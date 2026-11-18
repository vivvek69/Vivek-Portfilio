"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";

type Origin = { x: number; y: number };
type PlayOptions = { origin?: Origin; onCovered: () => void; onDone?: () => void };

type Ctx = { play: (opts: PlayOptions) => void; busy: () => boolean };

const FireCtx = createContext<Ctx>({ play: ({ onCovered, onDone }) => { onCovered(); onDone?.(); }, busy: () => false });

export const useFireTransition = () => useContext(FireCtx);

type P = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; r: number; hue: number; seed: number };

/**
 * Fire burst transition used for scene jumps and for opening / closing missions:
 *   1. gather  — embers converge on the origin (the clicked element)
 *   2. explode — a fire blast expands until the screen is covered in darkness
 *   3. onCovered() swaps the content underneath
 *   4. dissipate — the darkness burns away from the centre outwards
 */
export function FireTransitionProvider({ children, reduced }: { children: ReactNode; reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const running = useRef(false);

  const play = useCallback(
    ({ origin, onCovered, onDone }: PlayOptions) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || running.current) {
        onCovered();
        onDone?.();
        return;
      }
      running.current = true;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.style.display = "block";

      const ox = origin?.x ?? w / 2;
      const oy = origin?.y ?? h / 2;
      const maxR = Math.hypot(Math.max(ox, w - ox), Math.max(oy, h - oy)) + 80;

      if (reduced) {
        // Accessible variant: a short cross-fade through black.
        const t0 = performance.now();
        let covered = false;
        const step = (now: number) => {
          const t = (now - t0) / 420;
          ctx.clearRect(0, 0, w, h);
          const a = t < 0.5 ? t * 2 : Math.max(0, 2 - t * 2);
          if (t >= 0.5 && !covered) {
            covered = true;
            onCovered();
          }
          ctx.fillStyle = `rgba(5,4,3,${a})`;
          ctx.fillRect(0, 0, w, h);
          if (t < 1) requestAnimationFrame(step);
          else {
            canvas.style.display = "none";
            running.current = false;
            onDone?.();
          }
        };
        requestAnimationFrame(step);
        return;
      }

      const count = w < 700 ? 140 : 260;
      const ps: P[] = Array.from({ length: count }, () => {
        const a = Math.random() * Math.PI * 2;
        const d = 120 + Math.random() * Math.max(w, h) * 0.5;
        return {
          x: ox + Math.cos(a) * d,
          y: oy + Math.sin(a) * d,
          vx: 0,
          vy: 0,
          tx: ox,
          ty: oy,
          r: 0.8 + Math.random() * 2.4,
          hue: 15 + Math.random() * 30,
          seed: Math.random(),
        };
      });

      const GATHER = 520;
      const EXPLODE = 560;
      const HOLD = 140;
      const DISSIPATE = 820;
      const t0 = performance.now();
      let covered = false;
      let exploded = false;

      const frame = (now: number) => {
        const t = now - t0;
        ctx.clearRect(0, 0, w, h);

        if (t < GATHER) {
          const k = t / GATHER;
          // dim the world slightly while energy gathers
          ctx.fillStyle = `rgba(5,4,3,${k * 0.35})`;
          ctx.fillRect(0, 0, w, h);
          ctx.globalCompositeOperation = "lighter";
          for (const p of ps) {
            const pull = 0.05 + k * 0.12;
            p.x += (p.tx - p.x) * pull + Math.sin(t * 0.01 + p.seed * 10) * 1.2;
            p.y += (p.ty - p.y) * pull + Math.cos(t * 0.01 + p.seed * 10) * 1.2;
            dot(ctx, p.x, p.y, p.r * (1 + k), p.hue, 0.4 + k * 0.6);
          }
          // core
          const core = 10 + k * 40;
          glow(ctx, ox, oy, core, 1);
          ctx.globalCompositeOperation = "source-over";
        } else if (t < GATHER + EXPLODE + HOLD) {
          if (!exploded) {
            exploded = true;
            for (const p of ps) {
              const a = Math.random() * Math.PI * 2;
              const s = 6 + Math.random() * 18;
              p.vx = Math.cos(a) * s;
              p.vy = Math.sin(a) * s - 2;
            }
          }
          const k = Math.min(1, (t - GATHER) / EXPLODE);
          const e = 1 - Math.pow(1 - k, 3);
          const R = e * maxR;
          // the blast front: dark core, burning rim
          const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, Math.max(1, R));
          g.addColorStop(0, "rgba(5,4,3,1)");
          g.addColorStop(Math.max(0, 0.78 - (1 - e) * 0.3), "rgba(12,6,3,1)");
          g.addColorStop(0.9, "rgba(255,120,30,0.95)");
          g.addColorStop(0.96, "rgba(255,213,138,0.9)");
          g.addColorStop(1, "rgba(255,106,19,0)");
          ctx.fillStyle = `rgba(5,4,3,${0.35 + e * 0.4})`;
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(ox, oy, R, 0, Math.PI * 2);
          ctx.fill();
          if (k >= 1) {
            ctx.fillStyle = "rgb(5,4,3)";
            ctx.fillRect(0, 0, w, h);
            if (!covered) {
              covered = true;
              onCovered();
            }
          }
          ctx.globalCompositeOperation = "lighter";
          for (const p of ps) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95;
            p.vy = p.vy * 0.95 - 0.08;
            dot(ctx, p.x, p.y, p.r * 1.6, p.hue, 0.9 * (1 - k * 0.3));
          }
          if (k < 0.4) glow(ctx, ox, oy, 60 + k * 400, 1 - k * 2.5);
          ctx.globalCompositeOperation = "source-over";
        } else if (t < GATHER + EXPLODE + HOLD + DISSIPATE) {
          const k = (t - GATHER - EXPLODE - HOLD) / DISSIPATE;
          const e = k * k * (3 - 2 * k);
          // darkness burns away from the centre with an ember rim
          const cx = w / 2;
          const cy = h / 2;
          const R = e * (Math.hypot(w, h) / 2 + 120);
          ctx.fillStyle = "rgb(5,4,3)";
          ctx.fillRect(0, 0, w, h);
          ctx.globalCompositeOperation = "destination-out";
          const hole = ctx.createRadialGradient(cx, cy, Math.max(0, R - 120), cx, cy, Math.max(1, R));
          hole.addColorStop(0, "rgba(0,0,0,1)");
          hole.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = hole;
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = `rgba(255,140,40,${0.55 * (1 - k)})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(0, R - 60), 0, Math.PI * 2);
          ctx.stroke();
          for (const p of ps) {
            p.x += p.vx * 0.4;
            p.y += p.vy * 0.4 - 0.6;
            dot(ctx, p.x, p.y, p.r, p.hue, 0.8 * (1 - k));
          }
          ctx.globalCompositeOperation = "source-over";
        } else {
          ctx.clearRect(0, 0, w, h);
          canvas.style.display = "none";
          running.current = false;
          onDone?.();
          return;
        }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    },
    [reduced]
  );

  useEffect(() => {
    const c = canvasRef.current;
    if (c) c.style.display = "none";
  }, []);

  const value = useMemo<Ctx>(() => ({ play, busy: () => running.current }), [play]);

  return (
    <FireCtx.Provider value={value}>
      {children}
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[90] h-full w-full" />
    </FireCtx.Provider>
  );
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, hue: number, a: number) {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
  g.addColorStop(0, `hsla(${hue + 20},100%,80%,${a})`);
  g.addColorStop(0.4, `hsla(${hue},100%,55%,${a * 0.5})`);
  g.addColorStop(1, `hsla(${hue},100%,40%,0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 4, 0, Math.PI * 2);
  ctx.fill();
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,246,220,${a})`);
  g.addColorStop(0.3, `rgba(255,170,60,${a * 0.8})`);
  g.addColorStop(1, "rgba(255,90,10,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

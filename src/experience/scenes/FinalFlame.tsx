"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { profile } from "@/data/resumeData";

type P = { x: number; y: number; tx: number; ty: number; vx: number; vy: number; delay: number; s: number; hue: number; seed: number };

/**
 * Screen 10 — The End Is Only The Beginning. Embers rise out of the darkness
 * and gather into the name, then the closing line appears.
 */
export function FinalFlame({ reduced, onReplay }: { reduced: boolean; onReplay: (origin: { x: number; y: number }) => void }) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [formed, setFormed] = useState(false);

  useEffect(() => {
    const el = section.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    if (reduced) {
      const id = requestAnimationFrame(() => setFormed(true));
      return () => cancelAnimationFrame(id);
    }
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = false;
    let started = false;
    let particles: P[] = [];
    let w = 0;
    let h = 0;
    let t0 = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    // pre-rendered ember sprite (much cheaper than per-particle gradients)
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const sctx = sprite.getContext("2d")!;
    const g = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,240,210,1)");
    g.addColorStop(0.25, "rgba(255,170,60,0.85)");
    g.addColorStop(0.6, "rgba(255,90,15,0.25)");
    g.addColorStop(1, "rgba(255,60,0,0)");
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 32, 32);

    const build = async () => {
      await document.fonts.ready;
      const rect = el.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // sample glyph pixels from an offscreen render of the name
      const off = document.createElement("canvas");
      off.width = Math.floor(w);
      off.height = Math.floor(h);
      const o = off.getContext("2d", { willReadFrequently: true })!;
      // draw each real HTML name line at its exact on-screen position and size
      o.fillStyle = "#fff";
      o.textAlign = "center";
      o.textBaseline = "middle";
      el.querySelectorAll<HTMLElement>("[data-ember-line]").forEach((line) => {
        const cs = getComputedStyle(line);
        const r = line.getBoundingClientRect();
        o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        o.fillText(line.textContent ?? "", r.left - rect.left + r.width / 2, r.top - rect.top + r.height / 2);
      });
      const data = o.getImageData(0, 0, off.width, off.height).data;
      const step = w < 640 ? 3 : 4;
      const pts: [number, number][] = [];
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          if (data[(y * off.width + x) * 4 + 3] > 140) pts.push([x, y]);
        }
      }
      const max = w < 640 ? 1400 : 3200;
      const stride = Math.max(1, pts.length / max);
      particles = [];
      for (let i = 0; i < pts.length; i += stride) {
        const [tx, ty] = pts[Math.floor(i)];
        particles.push({
          x: tx + (Math.random() - 0.5) * w * 0.6,
          y: h + 20 + Math.random() * h * 0.4,
          tx,
          ty,
          vx: 0,
          vy: 0,
          delay: Math.random() * 900 + (tx / w) * 500,
          s: 3 + Math.random() * 5,
          hue: Math.random(),
          seed: Math.random() * 100,
        });
      }
    };

    const frame = (now: number) => {
      const t = now - t0;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      let settled = 0;
      for (const p of particles) {
        if (t < p.delay) {
          // still rising from below
          p.y -= 0.6;
        } else {
          const k = Math.min(1, (t - p.delay) / 1600);
          const pull = 0.035 + k * 0.08;
          p.vx = p.vx * 0.82 + (p.tx - p.x) * pull;
          p.vy = p.vy * 0.82 + (p.ty - p.y) * pull;
          p.x += p.vx + Math.sin(t * 0.004 + p.seed) * (1 - k) * 2.2;
          p.y += p.vy;
          if (Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) < 1.5) settled++;
        }
        const flick = 0.55 + 0.45 * Math.sin(t * 0.012 + p.seed * 3);
        ctx.globalAlpha = 0.35 + flick * 0.55;
        const s = p.s * (0.7 + flick * 0.5);
        ctx.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      if (!formed && (settled > particles.length * 0.8 || t > 4200)) setFormed(true);
      if (running) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting) {
          if (!started) {
            started = true;
            await build();
            t0 = performance.now();
          }
          if (!running) {
            running = true;
            raf = requestAnimationFrame(frame);
          }
        } else {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      running = false;
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const replay = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onReplay({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  return (
    <section ref={section} id="finale" aria-labelledby="finale-title" className="scene flex min-h-[100svh] flex-col items-center justify-center bg-ink">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(45%_35%_at_50%_42%,rgba(255,106,19,0.14),transparent_70%)]" />
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 z-[1]" style={{ opacity: formed ? 0.6 : 1, transition: "opacity 2.4s ease 0.4s" }} />

      <div className="relative z-[2] flex w-full max-w-6xl flex-col items-center px-4 pb-16 text-center">
        <h2 id="finale-title" className="sr-only">
          The end is only the beginning — {profile.name}, {profile.role}
        </h2>
        <p className="eyebrow" style={{ opacity: formed ? 1 : 0, transition: "opacity 1.2s" }}>
          拾 · 10 — The End Is Only The Beginning
        </p>

        {/* the embers gather onto these exact lines; the crisp text then fades in over them */}
        <div aria-hidden className="fire-glow mt-8 font-display font-extrabold leading-[0.95]" style={{ fontSize: "clamp(3.2rem, 13vw, 10.5rem)" }}>
          {[profile.firstName, profile.lastName].map((line) => (
            <span key={line} data-ember-line className="fire-text block" style={{ opacity: formed ? 1 : 0, transition: "opacity 2s ease 0.4s" }}>
              {line}
            </span>
          ))}
        </div>

        <p
          className="glow-text mt-8 font-display font-bold tracking-[0.5em] text-bone"
          style={{ fontSize: "clamp(1rem, 2.6vw, 2.2rem)", opacity: formed ? 1 : 0, transition: "opacity 1.6s ease 0.8s" }}
        >
          {profile.role}
        </p>
        <p
          className="mt-8 max-w-3xl font-display text-[clamp(0.9rem,1.6vw,1.2rem)] uppercase leading-relaxed tracking-[0.18em] text-bone-dim"
          style={{ opacity: formed ? 1 : 0, transform: formed ? "none" : "translateY(14px)", transition: "all 1.4s ease 1.4s" }}
        >
          Every journey begins with a single step. <span className="text-amber">This is only the beginning.</span>
        </p>
        <button
          type="button"
          onClick={replay}
          className="btn-flame mt-10"
          style={{ opacity: formed ? 1 : 0, transition: "opacity 1s ease 2.2s", pointerEvents: formed ? "auto" : "none" }}
        >
          <RotateCcw size={14} aria-hidden /> Back to beginning
        </button>
      </div>

      <footer className="absolute inset-x-0 bottom-0 z-[2] flex flex-wrap items-center justify-between gap-2 px-4 py-5 text-[0.65rem] uppercase tracking-[0.3em] text-smoke md:px-8">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Hyderabad · India</span>
      </footer>
    </section>
  );
}

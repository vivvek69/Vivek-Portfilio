"use client";

import { useEffect, useRef } from "react";

type Ember = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; hue: number; phase: number };

/**
 * Global ambient fire layer for Screens 02–10: rising embers, a few sparks and a
 * warm smoke haze at the bottom edge. One 2D canvas for the whole page keeps
 * the GPU budget for the 3D opening.
 */
export function EmberField({ active, density = 1, reduced }: { active: boolean; density?: number; reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const target = Math.round((reduced ? 14 : w < 700 ? 34 : 70) * density);
    const embers: Ember[] = [];
    const spawn = (anywhere: boolean): Ember => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.25 + Math.random() * 0.9),
      r: 0.6 + Math.random() * 1.9,
      life: 0,
      max: 260 + Math.random() * 520,
      hue: 18 + Math.random() * 26,
      phase: Math.random() * Math.PI * 2,
    });
    for (let i = 0; i < target; i++) embers.push(spawn(true));

    let raf = 0;
    let last = performance.now();
    let scrollV = 0;
    let lastScroll = window.scrollY;

    const draw = (now: number) => {
      const dt = Math.min(2.5, (now - last) / 16.67);
      last = now;
      const sy = window.scrollY;
      // embers react to scrolling, as if pushed by the wind of movement
      scrollV += ((sy - lastScroll) * 0.04 - scrollV) * 0.1;
      lastScroll = sy;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.life += dt;
        e.phase += 0.02 * dt;
        e.x += (e.vx + Math.sin(e.phase) * 0.25) * dt;
        e.y += (e.vy - scrollV) * dt;
        const t = e.life / e.max;
        if (t >= 1 || e.y < -20 || e.y > h + 40) {
          embers[i] = spawn(false);
          continue;
        }
        const alpha = Math.sin(Math.PI * t) * (0.55 + 0.45 * Math.sin(e.phase * 5));
        const r = e.r * (1 - t * 0.4);
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r * 4);
        g.addColorStop(0, `hsla(${e.hue + 15}, 100%, 75%, ${alpha})`);
        g.addColorStop(0.35, `hsla(${e.hue}, 100%, 55%, ${alpha * 0.5})`);
        g.addColorStop(1, `hsla(${e.hue - 10}, 100%, 40%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };

    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [active, density, reduced]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[1]" style={{ opacity: active ? 1 : 0, transition: "opacity 1.2s" }}>
      {/* smoke haze lit from below */}
      <div className="absolute inset-x-0 bottom-0 h-[38vh] bg-[radial-gradient(70%_100%_at_50%_100%,rgba(255,90,20,0.10),transparent_70%)]" />
      <canvas ref={ref} className="absolute inset-0" />
    </div>
  );
}

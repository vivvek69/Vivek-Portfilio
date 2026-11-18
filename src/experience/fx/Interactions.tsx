"use client";

import { useEffect } from "react";

/**
 * Global, delegated micro-interactions:
 *  - `.lit-panel` / `[data-spot]`: firelight follows the cursor (--mx / --my)
 *  - `[data-tilt]`: subtle 3D tilt toward the cursor (--rx / --ry)
 *  - `[data-count]`: numbers count up when they scroll into view
 * One pointer listener for the whole page; skipped for reduced motion.
 */
export function Interactions({ reduced }: { reduced: boolean }) {
  useEffect(() => {
    if (reduced) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    let raf = 0;
    let last: PointerEvent | null = null;
    let tilted: HTMLElement | null = null;

    const apply = () => {
      raf = 0;
      const e = last;
      if (!e) return;
      const target = e.target as Element | null;
      const spot = target?.closest<HTMLElement>(".lit-panel, [data-spot]");
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
      const tilt = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (tilted && tilted !== tilt) {
        tilted.style.setProperty("--rx", "0deg");
        tilted.style.setProperty("--ry", "0deg");
      }
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const max = Number(tilt.dataset.tilt) || 6;
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.setProperty("--ry", `${(px * max).toFixed(2)}deg`);
        tilt.style.setProperty("--rx", `${(-py * max).toFixed(2)}deg`);
      }
      tilted = tilt;
    };

    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      if (tilted) {
        tilted.style.setProperty("--rx", "0deg");
        tilted.style.setProperty("--ry", "0deg");
        tilted = null;
      }
    };
    if (fine) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }

    // count-up numbers: "8.5", "81.4%", ">82%" — the final text is in the HTML already
    const counters = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          counters.unobserve(entry.target);
          const el = entry.target as HTMLElement;
          const text = el.dataset.count || el.textContent || "";
          const m = text.match(/^(\D*)(\d+(?:\.\d+)?)(\D*)$/);
          if (!m) continue;
          const [, pre, num, post] = m;
          const target = parseFloat(num);
          const decimals = num.includes(".") ? num.split(".")[1].length : 0;
          const t0 = performance.now();
          const dur = 1400;
          const step = (now: number) => {
            const k = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - k, 4);
            el.textContent = `${pre}${(target * eased).toFixed(decimals)}${post}`;
            if (k < 1) requestAnimationFrame(step);
            else el.textContent = text;
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.6 }
    );
    const seen = new WeakSet<Element>();
    const scan = () =>
      document.querySelectorAll("[data-count]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        counters.observe(el);
      });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      counters.disconnect();
      mo.disconnect();
    };
  }, [reduced]);

  return null;
}

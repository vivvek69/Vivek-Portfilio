"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { scenes, type SceneId } from "@/data/resumeData";
import { SoundToggle } from "../ui/SoundToggle";

type Props = {
  hidden: boolean;
  active: SceneId;
  onJump: (id: SceneId, origin: { x: number; y: number }) => void;
};

/**
 * Minimal cinematic navigation:
 *  - desktop: a vertical rail of kanji numerals with a burning progress line
 *  - mobile: a thin fire progress bar along the top edge
 *  - both: a menu dialog listing all ten scenes, and a sound toggle
 */
export function SceneNav({ hidden, active, onJump }: Props) {
  const [open, setOpen] = useState(false);
  const fill = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstItem = useRef<HTMLButtonElement>(null);

  // scroll progress → fire line (no React re-render per scroll)
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (fill.current) fill.current.style.transform = `scaleY(${p})`;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    firstItem.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const jump = (id: SceneId) => (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOpen(false);
    onJump(id, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  const activeIndex = scenes.findIndex((s) => s.id === active);

  return (
    <div aria-hidden={hidden} style={{ opacity: hidden ? 0 : 1, pointerEvents: hidden ? "none" : "auto", transition: "opacity 1s" }}>
      {/* mobile progress */}
      <div className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent lg:hidden">
        <div ref={bar} className="h-full origin-left bg-gradient-to-r from-crimson via-flame to-gold shadow-[0_0_10px_#ff6a13]" style={{ transform: "scaleX(0)" }} />
      </div>

      {/* top bar */}
      <div className="fixed left-0 right-0 top-0 z-[60] flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <button
          type="button"
          onClick={jump("opening")}
          className="font-display text-sm font-bold tracking-[0.3em] text-bone/80 transition-colors hover:text-amber"
          aria-label="Back to the opening scene"
          tabIndex={hidden ? -1 : 0}
        >
          PV<span className="text-flame">.</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="hidden text-[0.62rem] uppercase tracking-[0.35em] text-smoke md:inline" aria-live="polite">
            {scenes[activeIndex]?.label}
          </span>
          <SoundToggle compact />
          <button
            ref={menuBtn}
            type="button"
            onClick={() => setOpen(true)}
            className="btn-ghost !px-3 !py-2"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label="Open scene menu"
            tabIndex={hidden ? -1 : 0}
          >
            <Menu size={16} aria-hidden />
          </button>
        </div>
      </div>

      {/* desktop rail */}
      <nav aria-label="Scenes" className="fixed left-5 top-1/2 z-[60] hidden -translate-y-1/2 lg:block">
        <div aria-hidden className="absolute bottom-3 left-[0.6rem] top-3 w-px bg-amber/15">
          <div ref={fill} className="absolute inset-0 origin-top bg-gradient-to-b from-gold via-flame to-crimson shadow-[0_0_8px_#ff6a13]" style={{ transform: "scaleY(0)" }} />
        </div>
        <ol className="relative flex flex-col gap-3.5">
          {scenes.map((s, i) => {
            const on = s.id === active;
            const past = i < activeIndex;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={jump(s.id)}
                  aria-current={on ? "step" : undefined}
                  aria-label={`${i + 1}. ${s.label}`}
                  tabIndex={hidden ? -1 : 0}
                  className="group flex items-center gap-3"
                >
                  <span
                    className={`grid h-5 w-5 place-items-center font-display text-[0.62rem] transition-all duration-500 ${
                      on ? "scale-125 text-gold [text-shadow:0_0_12px_#ff6a13]" : past ? "text-flame/80" : "text-smoke/60 group-hover:text-bone"
                    }`}
                  >
                    {s.short}
                  </span>
                  <span className={`whitespace-nowrap text-[0.6rem] uppercase tracking-[0.3em] transition-all duration-300 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 ${on ? "text-bone" : "text-bone-dim"}`}>
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* menu */}
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Scene menu" className="fixed inset-0 z-[85] overflow-y-auto bg-[rgba(5,4,3,0.96)] backdrop-blur-lg">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_110%,rgba(255,106,19,0.22),transparent_70%)]" />
          <div className="relative mx-auto flex min-h-full max-w-5xl flex-col px-4 py-6 md:px-8">
            <div className="flex justify-end">
              <button type="button" onClick={() => { setOpen(false); menuBtn.current?.focus(); }} className="btn-ghost !px-3 !py-2" aria-label="Close menu">
                <X size={16} aria-hidden />
              </button>
            </div>
            <ol className="my-auto grid gap-x-10 py-8 sm:grid-cols-2">
              {scenes.map((s, i) => (
                <li key={s.id} className="border-b border-amber/10">
                  <button
                    ref={i === 0 ? firstItem : undefined}
                    type="button"
                    onClick={jump(s.id)}
                    className="group flex w-full items-baseline gap-5 py-4 text-left"
                    aria-current={s.id === active ? "step" : undefined}
                  >
                    <span className="w-8 font-display text-lg text-amber/50 transition-colors group-hover:text-flame">{s.short}</span>
                    <span className={`font-display text-2xl font-bold transition-all group-hover:translate-x-1 group-hover:text-gold md:text-3xl ${s.id === active ? "text-gold" : "text-bone"}`}>
                      {s.label}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

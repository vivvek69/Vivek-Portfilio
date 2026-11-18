"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { skillCategories } from "@/data/resumeData";
import { Scene } from "../ui/Scene";

/**
 * Screen 08 — Technical Arsenal. Environment: a forge. Categories are a
 * weapon rack (ARIA tabs); choosing one ignites its technologies one by one.
 * No proficiency ratings — only what is on the résumé.
 */
export function ArsenalScene() {
  const [active, setActive] = useState(skillCategories[0].id);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = skillCategories.find((c) => c.id === active)!;

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = skillCategories.findIndex((c) => c.id === active);
    let n = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % skillCategories.length;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (i - 1 + skillCategories.length) % skillCategories.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = skillCategories.length - 1;
    if (n >= 0) {
      e.preventDefault();
      setActive(skillCategories[n].id);
      tabs.current[n]?.focus();
    }
  };

  return (
    <Scene
      id="arsenal"
      number="捌 · 08"
      kanji="技"
      title="Technical Arsenal"
      subtitle="Eleven disciplines. Select one to draw it from the forge."
      glow={{ x: "65%", y: "70%" }}
    >
      <div className="grid gap-10 lg:grid-cols-[19rem_1fr] lg:gap-14">
        <div
          role="tablist"
          aria-label="Skill categories"
          aria-orientation="vertical"
          onKeyDown={onKey}
          data-reveal
          className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
        >
          {skillCategories.map((c, i) => {
            const on = c.id === active;
            return (
              <button
                key={c.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`tab-${c.id}`}
                aria-selected={on}
                aria-controls="arsenal-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(c.id)}
                className={`group relative flex shrink-0 items-center gap-4 px-4 py-3 text-left transition-colors lg:py-3.5 ${on ? "text-bone" : "text-smoke hover:text-bone-dim"}`}
              >
                <span
                  aria-hidden
                  className={`font-display text-xl transition-all duration-500 ${on ? "text-flame [text-shadow:0_0_16px_rgba(255,106,19,0.9)]" : "text-amber/30"}`}
                >
                  {c.kanji}
                </span>
                <span className="whitespace-nowrap text-sm font-medium tracking-wide">{c.name}</span>
                <span
                  aria-hidden
                  className={`absolute bottom-0 left-0 h-px bg-gradient-to-r from-flame to-transparent transition-all duration-500 lg:bottom-auto lg:top-0 lg:h-full lg:w-px lg:bg-gradient-to-b ${on ? "w-full opacity-100 lg:w-px" : "w-0 opacity-0"}`}
                />
              </button>
            );
          })}
        </div>

        <div id="arsenal-panel" role="tabpanel" aria-labelledby={`tab-${current.id}`} className="relative min-h-[22rem]">
          <div aria-hidden className="pointer-events-none absolute -right-4 -top-10 select-none font-display text-[10rem] font-extrabold leading-none text-flame/[0.07] md:text-[14rem]">
            {current.kanji}
          </div>
          <p key={`h-${current.id}`} className="forge-in eyebrow">
            {current.items.length} techniques
          </p>
          <h3 key={`t-${current.id}`} className="forge-in fire-text mt-3 font-display text-[clamp(1.8rem,4vw,3rem)] font-extrabold">
            {current.name}
          </h3>
          <ul key={current.id} className="mt-8 grid gap-x-8 sm:grid-cols-2 xl:grid-cols-3">
            {current.items.map((item, i) => (
              <li
                key={item}
                className="forge-blade relative flex items-center gap-3 border-b border-amber/10 py-3.5 text-bone"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <span aria-hidden className="h-px w-5 bg-gradient-to-r from-flame to-amber shadow-[0_0_8px_#ff6a13]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes forge-in { from { opacity: 0; transform: translateY(14px); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
        @keyframes blade { 0% { opacity: 0; transform: translateX(-16px); color: #ffb547; text-shadow: 0 0 18px #ff6a13; }
          60% { opacity: 1; color: #ffe2b0; text-shadow: 0 0 12px rgba(255,106,19,.7); }
          100% { opacity: 1; transform: none; color: var(--bone); text-shadow: none; } }
        .forge-in { animation: forge-in .7s cubic-bezier(.2,.7,.2,1) both; }
        .forge-blade { animation: blade .9s cubic-bezier(.2,.7,.2,1) both; }
      `}</style>
    </Scene>
  );
}

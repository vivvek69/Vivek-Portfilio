"use client";

import { ArrowUpRight } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { projects } from "@/data/resumeData";
import { Scene } from "../ui/Scene";

/**
 * Screen 04 — Mission Archives. Environment: sealed scrolls in an archive.
 * Each mission is a typographic row; selecting it makes the name glow and
 * hands off to the fire transition, which opens the mission scene.
 */
export function MissionArchives({ onOpen }: { onOpen: (slug: string, origin: { x: number; y: number }) => void }) {
  const [chosen, setChosen] = useState<string | null>(null);

  const select = (slug: string) => (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const origin = e.clientX || e.clientY ? { x: e.clientX, y: e.clientY } : { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    setChosen(slug);
    window.setTimeout(() => setChosen(null), 1600);
    onOpen(slug, origin);
  };

  return (
    <Scene
      id="missions"
      number="肆 · 04"
      kanji="任"
      title="Mission Archives"
      subtitle="Five sealed missions. Choose one to break the seal."
      glow={{ x: "50%", y: "110%" }}
    >
      <ul className="border-t border-amber/15">
        {projects.map((p, i) => (
          <li key={p.slug} data-reveal style={{ ["--reveal-delay" as string]: `${i * 80}ms` }} className="border-b border-amber/15">
            <button
              type="button"
              id={`mission-${p.slug}`}
              onClick={select(p.slug)}
              aria-haspopup="dialog"
              className={`mission-row group relative grid w-full grid-cols-[2.6rem_1fr_auto] items-center gap-4 py-7 text-left md:grid-cols-[5rem_1fr_auto_auto] md:gap-8 md:py-9 ${chosen === p.slug ? "is-chosen" : ""}`}
            >
              <span className="font-display text-sm text-smoke transition-colors group-hover:text-amber md:text-base">{p.index}</span>
              <span className="min-w-0">
                <span className="mission-name block font-display text-[clamp(1.45rem,4.2vw,3.4rem)] font-extrabold leading-[1.02] text-bone">
                  {p.title}
                </span>
                <span className="mt-2 block text-sm text-bone-dim">{p.category}</span>
                <span className="mt-3 block text-[0.7rem] uppercase tracking-[0.22em] text-smoke">{p.tech.join(" · ")}</span>
              </span>
              <span aria-hidden className="mission-kanji hidden font-display text-6xl text-amber/15 transition-all duration-700 md:block">
                {p.kanji}
              </span>
              <span className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-amber">
                <span className="hidden sm:inline">Enter</span>
                <ArrowUpRight size={18} aria-hidden className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </span>
              {/* embers gather along the row on hover */}
              <span aria-hidden className="mission-sweep" />
              <span aria-hidden className="mission-heat pointer-events-none absolute inset-x-0 bottom-0 h-full opacity-0 transition-opacity duration-700" />
            </button>
          </li>
        ))}
      </ul>

      <style>{`
        .mission-row .mission-name { transition: color .5s, text-shadow .5s, letter-spacing .7s cubic-bezier(.2,.7,.2,1); }
        .mission-row:hover .mission-name, .mission-row:focus-visible .mission-name {
          color: #ffe2b0; text-shadow: 0 0 22px rgba(255,120,30,.55), 0 0 2px rgba(255,240,220,.9); letter-spacing: .015em;
        }
        .mission-row:hover .mission-kanji, .mission-row:focus-visible .mission-kanji { color: rgba(255,140,26,.75); text-shadow: 0 0 30px rgba(255,106,19,.6); }
        .mission-row .mission-heat { background: radial-gradient(60% 120% at 50% 130%, rgba(255,106,19,.18), transparent 70%); }
        .mission-row:hover .mission-heat { opacity: 1; }
        .mission-row.is-chosen .mission-name { color: #fff3dc; text-shadow: 0 0 10px #fff, 0 0 30px #ffb547, 0 0 70px #ff6a13; }
        .mission-row.is-chosen .mission-heat { opacity: 1; background: radial-gradient(70% 140% at 50% 120%, rgba(255,140,26,.45), transparent 70%); }
      `}</style>
    </Scene>
  );
}

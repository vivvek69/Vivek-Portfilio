"use client";

import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, Lock } from "lucide-react";
import { GithubIcon as Github } from "../ui/BrandIcons";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { projects, research, type Project } from "@/data/resumeData";
import { useViewer } from "../ui/DocumentViewer";

type Props = {
  project: Project;
  onReturn: (origin?: { x: number; y: number }) => void;
  onSwitch: (slug: string, origin?: { x: number; y: number }) => void;
  onResearch: () => void;
};

/** An individual mission scene (opened from Screen 04 without a page reload). */
export function MissionScene({ project: p, onReturn, onSwitch, onResearch }: Props) {
  const view = useViewer();
  const scroller = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const idx = projects.findIndex((x) => x.slug === p.slug);
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
    backRef.current?.focus({ preventScroll: true });
  }, [p.slug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector('[role="dialog"][aria-label]:not(#mission-dialog)')) onReturn();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onReturn]);

  const originOf = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  return (
    <div
      id="mission-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-title"
      ref={scroller}
      className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-ink"
    >
      {/* environment */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_80%_0%,rgba(143,26,12,0.28),transparent_70%),radial-gradient(80%_60%_at_20%_110%,rgba(255,106,19,0.2),transparent_70%)]" />
        <div className="absolute -right-[6vw] top-[8vh] select-none font-display text-[56vw] font-extrabold leading-none text-transparent md:text-[34vw]" style={{ WebkitTextStroke: "1px rgba(255,140,26,0.1)" }}>
          {p.kanji}
        </div>
      </div>

      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-amber/10 bg-ink/70 px-4 py-3 backdrop-blur-md md:px-8">
        <button ref={backRef} type="button" className="btn-ghost" onClick={(e) => onReturn(originOf(e.currentTarget))}>
          <ArrowLeft size={14} aria-hidden /> Return to archives
        </button>
        <p className="hidden font-display text-sm text-smoke sm:block">
          Mission {p.index} / {String(projects.length).padStart(2, "0")}
        </p>
      </div>

      <article className="relative mx-auto max-w-6xl px-4 pb-24 pt-14 md:px-8 md:pt-20">
        <header className="mission-enter">
          <p className="eyebrow">Mission {p.index} · {p.category}</p>
          <h2 id="mission-title" className="fire-text mt-4 font-display text-[clamp(2.4rem,8vw,6.5rem)] font-extrabold leading-[0.95]">
            {p.title}
          </h2>
          <div className="ember-rule mt-8 w-full max-w-xl" />
          <p className="mt-8 max-w-3xl font-display text-[clamp(1.1rem,2vw,1.45rem)] leading-relaxed text-bone">{p.overview}</p>
        </header>

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="mission-enter" style={{ animationDelay: "120ms" }} aria-labelledby="contrib">
            <h3 id="contrib" className="eyebrow">My contributions</h3>
            <ol className="mt-6 space-y-5">
              {p.contributions.map((c, i) => (
                <li key={c} className="grid grid-cols-[2.2rem_1fr] gap-3">
                  <span className="font-display text-sm text-amber">{String(i + 1).padStart(2, "0")}</span>
                  <p className="leading-relaxed text-bone-dim">{c}</p>
                </li>
              ))}
            </ol>
          </section>

          <aside className="mission-enter space-y-12" style={{ animationDelay: "220ms" }}>
            <section aria-labelledby="stack">
              <h3 id="stack" className="eyebrow">Technology stack</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {p.tech.map((t) => (
                  <li key={t} className="chip">{t}</li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="links">
              <h3 id="links" className="eyebrow">Links</h3>
              <div className="mt-5 flex flex-wrap gap-3">
                {p.github && (
                  <a href={p.github} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                    <Github size={14} aria-hidden /> Repository
                  </a>
                )}
                {p.live && (
                  <a href={p.live} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                    <ExternalLink size={14} aria-hidden /> Live
                  </a>
                )}
                {p.research && (
                  <>
                    <button type="button" className="btn-ghost" onClick={onResearch}>
                      <BookOpen size={14} aria-hidden /> Research paper
                    </button>
                    <a href={research.doiUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                      <ExternalLink size={14} aria-hidden /> DOI
                    </a>
                  </>
                )}
                {!p.github && !p.live && (
                  <p className="flex items-center gap-2 text-sm text-smoke">
                    <Lock size={14} aria-hidden /> Source and live links are not public yet.
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>

        <section className="mission-enter mt-20" style={{ animationDelay: "300ms" }} aria-labelledby="features">
          <h3 id="features" className="eyebrow">Features</h3>
          <ul className="mt-6 grid gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {p.features.map((f) => (
              <li key={f} className="flex items-baseline gap-3 border-b border-amber/10 py-3 text-bone">
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 translate-y-[-2px] rotate-45 bg-flame shadow-[0_0_10px_#ff6a13]" />
                {f}
              </li>
            ))}
          </ul>
        </section>

        {p.screenshots.length > 0 && (
          <section className="mission-enter mt-20" style={{ animationDelay: "380ms" }} aria-labelledby="shots">
            <h3 id="shots" className="eyebrow">System output</h3>
            <p className="mt-2 text-sm text-smoke">Frames from the paper’s Figure 4 — testing output of the multimodal system (FER, SER and LLM).</p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {p.screenshots.map((s) => (
                <li key={s.src}>
                  <button
                    type="button"
                    className="group block w-full text-left"
                    onClick={() => view({ kind: "image", src: s.src, title: s.caption, alt: s.alt })}
                  >
                    <span className="relative block aspect-[761/297] overflow-hidden border border-amber/15 transition-colors group-hover:border-amber/50">
                      <Image src={s.src} alt={s.alt} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    </span>
                    <span className="mt-2 block text-sm text-bone-dim">{s.caption}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav aria-label="Other missions" className="mt-24 grid gap-4 border-t border-amber/15 pt-8 sm:grid-cols-2">
          <button type="button" className="group text-left" onClick={(e) => onSwitch(prev.slug, originOf(e.currentTarget))}>
            <span className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-smoke">
              <ArrowLeft size={12} aria-hidden /> Previous mission
            </span>
            <span className="mt-2 block font-display text-xl text-bone transition-colors group-hover:text-amber">{prev.title}</span>
          </button>
          <button type="button" className="group text-left sm:text-right" onClick={(e) => onSwitch(next.slug, originOf(e.currentTarget))}>
            <span className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-smoke sm:justify-end">
              Next mission <ArrowRight size={12} aria-hidden />
            </span>
            <span className="mt-2 block font-display text-xl text-bone transition-colors group-hover:text-amber">{next.title}</span>
          </button>
        </nav>
      </article>

      <style>{`
        @keyframes mission-in { from { opacity: 0; transform: translateY(28px); filter: blur(8px); } to { opacity: 1; transform: none; filter: none; } }
        .mission-enter { animation: mission-in 1s cubic-bezier(.2,.7,.2,1) both; }
      `}</style>
    </div>
  );
}

"use client";

import { Award, BookMarked, Download, Hourglass, Maximize2 } from "lucide-react";
import Image from "next/image";
import { certificates, coursework, research } from "@/data/resumeData";
import { useViewer } from "../ui/DocumentViewer";
import { Scene } from "../ui/Scene";

/**
 * Screen 07 — Achievement Archives. Environment: a shrine shelf where each
 * verified certificate rests in firelight. Only supplied certificates appear.
 */
export function AchievementsScene() {
  const view = useViewer();
  return (
    <Scene id="achievements" number="漆 · 07" kanji="誉" title="Achievement Archives" glow={{ x: "50%", y: "60%" }}>
      <ul className="grid gap-16">
        {certificates.map((c) => (
          <li key={c.id} className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            <button
              type="button"
              data-reveal
              className="cert-altar group relative block"
              onClick={() => view({ kind: "image", src: c.image, file: c.pdf, title: c.title, alt: `${c.title} — awarded to Pasunuti Vivek` })}
              aria-label={`Open large preview: ${c.title}`}
            >
              <span aria-hidden className="absolute -inset-x-8 -bottom-10 h-24 bg-[radial-gradient(50%_100%_at_50%_100%,rgba(255,106,19,0.55),transparent_70%)] blur-xl" />
              <span data-tilt="6" className="sheen relative block overflow-hidden border border-amber/30 p-2 shadow-[0_40px_120px_-40px_rgba(255,106,19,0.6)]">
                <Image src={c.thumb} alt={c.title} width={640} height={454} sizes="(max-width: 1024px) 100vw, 60vw" className="w-full transition-transform duration-700 group-hover:scale-[1.015]" />
                <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center bg-ink/70 text-amber opacity-0 transition-opacity group-hover:opacity-100">
                  <Maximize2 size={16} aria-hidden />
                </span>
              </span>
            </button>
            <div data-reveal style={{ ["--reveal-delay" as string]: "150ms" }}>
              <span className="chip !border-amber/50 !text-amber">
                <Award size={12} aria-hidden /> Original certificate
              </span>
              <h3 className="glow-text mt-5 font-display text-3xl font-extrabold leading-tight text-bone">{c.title}</h3>
              <p className="mt-2 text-sm text-amber">{c.issuer}</p>
              <p className="mt-1 text-sm text-smoke">{c.date}</p>
              <p className="mt-5 leading-relaxed text-bone-dim">{c.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" className="btn-flame" onClick={() => view({ kind: "pdf", src: c.pdf, title: c.title })}>
                  Open PDF
                </button>
                <a href={c.pdf} download className="btn-ghost">
                  <Download size={14} aria-hidden /> Download
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-20 grid gap-px bg-amber/10 md:grid-cols-2">
        <div data-reveal className="bg-ink p-6 md:p-8">
          <BookMarked size={20} className="text-amber" aria-hidden />
          <p className="mt-4 font-display text-xl font-bold text-bone">Published in IEEE conference proceedings</p>
          <p className="mt-2 text-sm leading-relaxed text-bone-dim">
            {research.conferenceShort} · DOI{" "}
            <a href={research.doiUrl} target="_blank" rel="noopener noreferrer" className="break-all underline decoration-amber/50 underline-offset-4 hover:text-amber">
              {research.doi}
            </a>
          </p>
        </div>
        {coursework.map((c) => (
          <div key={c.title} data-reveal style={{ ["--reveal-delay" as string]: "120ms" }} className="bg-ink p-6 md:p-8">
            <Hourglass size={20} className="text-smoke" aria-hidden />
            <p className="mt-4 font-display text-xl font-bold text-bone">{c.title}</p>
            <p className="mt-2 text-sm text-smoke">{c.note}</p>
          </div>
        ))}
      </div>
    </Scene>
  );
}

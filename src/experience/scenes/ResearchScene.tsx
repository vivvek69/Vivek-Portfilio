"use client";

import { BookOpen, Download, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { certificates, research } from "@/data/resumeData";
import { useViewer } from "../ui/DocumentViewer";
import { Scene } from "../ui/Scene";

/** Screen 05 — Research Archives. Environment: a lantern-lit archive desk. */
export function ResearchScene() {
  const view = useViewer();
  const [embed, setEmbed] = useState(false);
  const cert = certificates[0];

  return (
    <Scene
      id="research"
      number="伍 · 05"
      kanji="研"
      title="Research Archives"
      glow={{ x: "30%", y: "0%" }}
      environment={
        <div aria-hidden className="absolute inset-0 z-0 bg-[repeating-linear-gradient(90deg,transparent_0_120px,rgba(255,181,71,0.025)_120px_121px)]" />
      }
    >
      <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p data-reveal className="eyebrow">IEEE · {research.conferenceShort} · Conference proceedings on IEEE Xplore</p>
          <h3 data-reveal className="glow-text mt-5 font-display text-[clamp(1.6rem,3.4vw,2.7rem)] font-extrabold leading-[1.15] text-bone">
            {research.title}
          </h3>
          <dl data-reveal className="mt-8 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="eyebrow !text-[0.6rem] pt-0.5">Conference</dt>
            <dd className="text-bone">{research.conference}</dd>
            <dt className="eyebrow !text-[0.6rem] pt-0.5">Dates</dt>
            <dd className="text-bone">{research.dates} · {research.venue}</dd>
            <dt className="eyebrow !text-[0.6rem] pt-0.5">Authors</dt>
            <dd className="text-bone-dim">
              {research.authors.map((a, i) => (
                <span key={a}>
                  <span className={i === 0 ? "font-semibold text-amber" : ""}>{a}</span>
                  {i < research.authors.length - 1 ? ", " : ""}
                </span>
              ))}
            </dd>
            <dt className="eyebrow !text-[0.6rem] pt-0.5">DOI</dt>
            <dd>
              <a href={research.doiUrl} target="_blank" rel="noopener noreferrer" className="break-all text-bone underline decoration-amber/50 underline-offset-4 hover:text-amber">
                {research.doi}
              </a>
            </dd>
            <dt className="eyebrow !text-[0.6rem] pt-0.5">Pages</dt>
            <dd className="text-bone">{research.pages}</dd>
          </dl>
          <p data-reveal className="mt-8 leading-relaxed text-bone-dim">{research.abstract}</p>

          <div data-reveal className="mt-8 flex flex-wrap gap-3">
            <button type="button" className="btn-flame" onClick={() => view({ kind: "pdf", src: research.paperUrl, title: research.title })}>
              <BookOpen size={14} aria-hidden /> Read the paper
            </button>
            <a href={research.paperUrl} download className="btn-ghost">
              <Download size={14} aria-hidden /> Download PDF
            </a>
            <a href={research.doiUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <ExternalLink size={14} aria-hidden /> IEEE Xplore (DOI)
            </a>
          </div>

          <div data-reveal className="mt-12">
            <p className="eyebrow">Research areas</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {research.areas.map((a) => (
                <li key={a} className="chip">{a}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* embedded original PDF — loads on demand */}
        <div data-reveal className="relative">
          <div className="relative aspect-[935/1210] w-full overflow-hidden border border-amber/20 bg-char shadow-[0_30px_80px_-30px_rgba(255,106,19,0.45)]">
            {embed ? (
              <object data={`${research.paperUrl}#view=FitH`} type="application/pdf" className="h-full w-full" aria-label="Embedded research paper PDF">
                <div className="grid h-full place-items-center p-6 text-center text-bone">
                  <a href={research.paperUrl} target="_blank" rel="noopener noreferrer" className="btn-flame">
                    Open the PDF <ExternalLink size={14} aria-hidden />
                  </a>
                </div>
              </object>
            ) : (
              <button type="button" onClick={() => setEmbed(true)} className="group absolute inset-0 block" aria-label="Load the embedded paper viewer">
                <Image src="/assets/research/paper-page1.webp" alt="First page of the IEEE paper" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover object-top opacity-80 transition-opacity group-hover:opacity-95" />
                <span className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,4,3,0.92)_0%,rgba(5,4,3,0.15)_55%)]" />
                <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6">
                  <span className="eyebrow">Original paper · 6 pages</span>
                  <span className="btn-flame">
                    <BookOpen size={14} aria-hidden /> Open embedded viewer
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* reported metrics */}
      <section className="mt-24" aria-labelledby="metrics-title">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-4">
          <h3 id="metrics-title" className="font-display text-2xl font-bold text-bone md:text-3xl">Results reported in the paper</h3>
          <p className="max-w-md text-xs leading-relaxed text-smoke">
            Figures from Section IV of the paper, under the stated test conditions. They are reported research results — not independently verified production benchmarks.
          </p>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-px bg-amber/10 md:grid-cols-5">
          {research.metrics.map((m, i) => (
            <li key={i} data-reveal style={{ ["--reveal-delay" as string]: `${i * 80}ms` }} className="bg-ink p-5 md:p-6">
              <p data-count className="fire-text font-display text-4xl font-extrabold tabular-nums md:text-5xl">{m.value}</p>
              <p className="mt-3 text-sm text-bone">{m.label}</p>
              <p className="mt-1 text-xs text-smoke">{m.context}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* original figures */}
      <section className="mt-24" aria-labelledby="figs-title">
        <h3 id="figs-title" data-reveal className="eyebrow">Original figures</h3>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {research.figures.map((f, i) => (
            <li key={f.src} data-reveal style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}>
              <button type="button" className="group block w-full text-left" onClick={() => view({ kind: "image", src: f.src, title: f.caption })}>
                <span data-tilt="5" className="sheen relative block aspect-[4/3] overflow-hidden bg-[#f4f1ec] p-3">
                  <Image src={f.src} alt={f.caption} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain p-3 transition-transform duration-700 group-hover:scale-[1.04]" />
                </span>
                <span className="mt-3 block text-sm text-bone-dim transition-colors group-hover:text-amber">{f.caption}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* certificate */}
      <section className="mt-24 grid items-center gap-10 md:grid-cols-[1fr_1.1fr]" aria-labelledby="cert-title">
        <div data-reveal>
          <p className="eyebrow">Conference presentation</p>
          <h3 id="cert-title" className="mt-4 font-display text-2xl font-bold text-bone md:text-3xl">{cert.title}</h3>
          <p className="mt-4 leading-relaxed text-bone-dim">{cert.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-ghost" onClick={() => view({ kind: "image", src: cert.image, file: cert.pdf, title: cert.title, alt: "Certificate of Presentation awarded to Pasunuti Vivek at ICEARS 2026" })}>
              View certificate
            </button>
            <a href={cert.pdf} download className="btn-ghost">
              <Download size={14} aria-hidden /> PDF
            </a>
          </div>
        </div>
        <button
          type="button"
          data-reveal
          onClick={() => view({ kind: "image", src: cert.image, file: cert.pdf, title: cert.title, alt: "Certificate of Presentation awarded to Pasunuti Vivek at ICEARS 2026" })}
          className="group relative block"
          aria-label="Enlarge the conference presentation certificate"
        >
          <span aria-hidden className="absolute -inset-4 bg-[radial-gradient(closest-side,rgba(255,106,19,0.3),transparent)] blur-xl transition-opacity group-hover:opacity-100 md:opacity-70" />
          <span data-tilt="7" className="sheen relative block shadow-2xl">
            <Image src={cert.thumb} alt="Certificate of Presentation — ICEARS 2026" width={640} height={454} className="w-full" />
          </span>
        </button>
      </section>
    </Scene>
  );
}

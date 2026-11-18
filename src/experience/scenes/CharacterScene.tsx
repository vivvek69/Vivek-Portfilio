import { Download } from "lucide-react";
import { FirePortrait } from "../ui/FirePortrait";
import { abilities, profile } from "@/data/resumeData";
import { Scene } from "../ui/Scene";

const FORMS = ["First Form", "Second Form", "Third Form", "Fourth Form", "Fifth Form", "Sixth Form"];

/** Screen 02 — Character Profile. Environment: a character dossier lit by a lantern. */
export function CharacterScene() {
  return (
    <Scene
      id="character"
      number="弐 · 02"
      kanji="主"
      title="Character Profile"
      glow={{ x: "22%", y: "40%" }}
      environment={
        <div aria-hidden className="absolute inset-0 z-0">
          {/* vertical shoji-like light slats */}
          <div className="absolute inset-y-0 left-[8%] w-px bg-gradient-to-b from-transparent via-amber/15 to-transparent" />
          <div className="absolute inset-y-0 left-[38%] hidden w-px bg-gradient-to-b from-transparent via-amber/10 to-transparent md:block" />
        </div>
      }
    >
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        {/* dossier */}
        <div data-reveal className="relative">
          <div className="relative mx-auto max-w-sm lg:mx-0">
            <div className="relative" data-tilt="6">
              <FirePortrait lit={false} sizes="(max-width: 1024px) 80vw, 30vw" />
              <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(5,4,3,0.95),transparent)] p-5 pt-16">
                <p className="eyebrow !text-[0.6rem]">Main Character</p>
                <p className="mt-2 font-display text-2xl font-extrabold text-bone">{profile.name}</p>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
              <dt className="eyebrow !text-[0.6rem] self-center">Class</dt>
              <dd className="text-bone">{profile.role}</dd>
              <dt className="eyebrow !text-[0.6rem] self-center">Affiliation</dt>
              <dd className="text-bone">{profile.organization}</dd>
              <dt className="eyebrow !text-[0.6rem] self-center">Base</dt>
              <dd className="text-bone">{profile.location}</dd>
            </dl>
            <a href={profile.resume} download className="btn-ghost mt-6" aria-label="Download résumé (PDF)">
              <Download size={14} aria-hidden /> Résumé PDF
            </a>
          </div>
        </div>

        {/* introduction + specializations */}
        <div>
          <div data-reveal style={{ ["--reveal-delay" as string]: "120ms" }}>
            <p className="eyebrow">Specializations</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {profile.specializations.map((s) => (
                <li key={s} className="chip">
                  <span className="ember-dot h-1.5 w-1.5 rounded-full bg-flame" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <blockquote
            data-reveal
            style={{ ["--reveal-delay" as string]: "220ms" }}
            className="relative mt-10 border-l border-amber/40 pl-6 font-display text-[clamp(1.15rem,2.1vw,1.6rem)] leading-[1.55] text-bone"
          >
            <span aria-hidden className="absolute -left-3 -top-6 font-display text-6xl text-flame/40">“</span>
            {profile.introduction}
          </blockquote>

          <div className="mt-14">
            <p data-reveal className="eyebrow">Abilities</p>
            <ol className="mt-5 divide-y divide-amber/10 border-y border-amber/10">
              {abilities.map((a, i) => (
                <li
                  key={a.id}
                  data-reveal
                  style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
                  className="group relative grid grid-cols-[3rem_1fr] items-center gap-4 py-4 transition-colors md:grid-cols-[3.5rem_10rem_1fr]"
                >
                  <span aria-hidden className="ability-kanji font-display text-3xl text-amber/40 transition-colors duration-500 group-hover:text-flame group-hover:[text-shadow:0_0_18px_rgba(255,106,19,0.8)]">
                    {a.kanji}
                  </span>
                  <span className="hidden text-[0.65rem] uppercase tracking-[0.35em] text-smoke md:block">{FORMS[i]}</span>
                  <div className="col-start-2 md:col-start-3">
                    <p className="font-display text-lg font-bold text-bone md:text-xl">{a.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-bone-dim">{a.detail}</p>
                  </div>
                  {/* fire line that ignites on hover */}
                  <span aria-hidden className="absolute bottom-[-1px] left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-flame via-amber to-transparent transition-transform duration-700 group-hover:scale-x-100" />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Scene>
  );
}

import { education } from "@/data/resumeData";
import { Scene } from "../ui/Scene";

/**
 * Screen 06 — Knowledge Foundation. Environment: stone steps rising toward a
 * flame. SSC is the first step, the Diploma (EEE) the second, the B.Tech
 * (CSE) the summit.
 */
export function EducationScene() {
  const steps = [...education].reverse(); // SSC → Diploma → B.Tech
  return (
    <Scene id="education" number="陸 · 06" kanji="学" title="Knowledge Foundation" glow={{ x: "80%", y: "10%" }}>
      <ol className="relative grid gap-6 md:grid-cols-3 md:items-end md:gap-5">
        {steps.map((e, i) => (
          <li
            key={e.level}
            data-reveal
            style={{ ["--reveal-delay" as string]: `${i * 160}ms`, ["--step" as string]: i }}
            className="edu-step relative"
          >
            <div className="lit-panel p-6 md:p-7" style={{ minHeight: `calc(15rem + ${i} * 4.5rem)` }}>
              <div className="flex items-start justify-between gap-4">
                <p className="eyebrow">{e.period}</p>
                <span className="font-display text-xs text-smoke">Step {i + 1}</span>
              </div>
              <p className="mt-6 font-display text-4xl font-extrabold text-bone md:text-5xl">{e.level}</p>
              <p className="mt-3 text-[0.95rem] font-semibold leading-snug text-amber">{e.field}</p>
              <p className="mt-2 text-sm text-bone-dim">
                {e.institution}
                {e.location ? `, ${e.location}` : ""}
              </p>
              <div className="mt-8 flex items-baseline gap-3 border-t border-amber/15 pt-5">
                <span className="text-[0.62rem] uppercase tracking-[0.35em] text-smoke">CGPA</span>
                <span data-count className="fire-text font-display text-4xl font-extrabold tabular-nums">{e.cgpa}</span>
              </div>
            </div>
            {i === steps.length - 1 && (
              <span aria-hidden className="ember-dot flicker absolute -top-3 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-flame max-md:hidden" />
            )}
          </li>
        ))}
      </ol>
    </Scene>
  );
}

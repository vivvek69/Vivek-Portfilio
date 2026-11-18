import { experience } from "@/data/resumeData";
import { Scene } from "../ui/Scene";

/**
 * Screen 03 — The Journey. Environment: a night railway. The timeline is the
 * track itself; each responsibility is a station whose lantern ignites as it
 * scrolls into view.
 */
export function JourneyScene() {
  return (
    <Scene
      id="journey"
      number="参 · 03"
      kanji="旅"
      title="The Journey"
      subtitle="Every line of the track is real work shipped at Sigmanix Tech Solutions."
      glow={{ x: "70%", y: "20%" }}
    >
      {/* departure board */}
      <div data-reveal className="relative mb-16 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow">Current station</p>
          <h3 className="mt-3 font-display text-[clamp(1.8rem,4vw,3.2rem)] font-extrabold leading-tight text-bone">
            {experience.role} <span className="text-flame">—</span> {experience.company}
          </h3>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Stack">
            {experience.stack.map((s) => (
              <li key={s} className="chip">{s}</li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-4 md:flex-col md:items-end">
          <span className="chip !border-amber/50 !text-amber">{experience.type}</span>
          <p data-ignite className="date-burn font-display text-2xl font-bold tracking-[0.12em] text-bone md:text-3xl">
            {experience.period}
          </p>
        </div>
      </div>

      {/* the track */}
      <div className="relative">
        <div aria-hidden className="journey-track absolute bottom-0 left-[1.15rem] top-0 w-6 md:left-1/2 md:-translate-x-1/2">
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-amber/60 via-amber/25 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-amber/60 via-amber/25 to-transparent" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,transparent_0_18px,rgba(255,181,71,0.14)_18px_21px)]" />
          {/* the rail burns down the track as you scroll; an ember leads the way */}
          <div className="journey-fill absolute left-1/2 top-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-gold via-flame to-crimson shadow-[0_0_12px_#ff6a13]">
            <span className="ember-dot absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#fff3dc,#ff8c1a_55%,transparent_70%)]" />
          </div>
        </div>

        <ol className="relative space-y-10 md:space-y-4">
          {experience.responsibilities.map((r, i) => {
            const right = i % 2 === 1;
            return (
              <li
                key={r.title}
                data-ignite
                className={`station relative grid grid-cols-[2.4rem_1fr] gap-5 md:grid-cols-[1fr_4rem_1fr] md:gap-0`}
              >
                {/* lantern */}
                <div className="relative col-start-1 row-start-1 flex justify-center pt-1 md:col-start-2">
                  <span aria-hidden className="lantern relative z-10 grid h-9 w-9 place-items-center rounded-full border border-amber/30 bg-char font-display text-xs text-amber/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div
                  data-reveal
                  className={`lit-panel col-start-2 row-start-1 p-5 md:p-6 ${right ? "md:col-start-3 md:ml-4" : "md:col-start-1 md:mr-4 md:text-right"}`}
                >
                  <p className="eyebrow !text-[0.6rem]">Station {String(i + 1).padStart(2, "0")}</p>
                  <h4 className="mt-2 font-display text-xl font-bold text-bone">{r.title}</h4>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-bone-dim">{r.text}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div data-reveal className="relative mt-12 flex flex-col items-start gap-3 pl-[0.4rem] md:items-center md:pl-0">
          <span aria-hidden className="ember-dot flicker h-4 w-4 rounded-full bg-flame" />
          <p className="font-display text-lg text-amber md:text-center">Present — the journey continues.</p>
        </div>
      </div>

      <style>{`
        .station .lantern { transition: all .8s cubic-bezier(.2,.7,.2,1) .15s; }
        .station.is-lit .lantern {
          color: #1a0b02;
          background: radial-gradient(circle at 50% 40%, #ffe3a8, #ff8c1a 60%, #c2400c);
          border-color: rgba(255,213,138,.8);
          box-shadow: 0 0 0 6px rgba(255,106,19,.12), 0 0 30px rgba(255,120,30,.75);
        }
        .date-burn { background: linear-gradient(90deg,#ffd58a,#ff8c1a 50%,#f6ebdc 50%); background-size: 200% 100%; background-position: 100% 0;
          -webkit-background-clip: text; background-clip: text; color: transparent; transition: background-position 1.8s cubic-bezier(.3,.6,.2,1); }
        .date-burn.is-lit { background-position: 0 0; }
      `}</style>
    </Scene>
  );
}

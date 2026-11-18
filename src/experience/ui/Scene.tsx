import type { CSSProperties, ReactNode } from "react";

type SceneProps = {
  id: string;
  number: string;
  kanji: string;
  title: string;
  subtitle?: ReactNode;
  glow?: { x: string; y: string };
  children: ReactNode;
  className?: string;
  /** Environmental layer unique to this scene (behind content). */
  environment?: ReactNode;
};

/** Title whose letters ignite one by one when the header is revealed. */
export function IgniteTitle({ text }: { text: string }) {
  let i = 0;
  return (
    <span className="ignite" aria-hidden>
      {text.split(" ").map((word, w, words) => (
        <span key={w} className="inline-block whitespace-nowrap">
          {[...word].map((ch) => (
            <span key={i} className="ch" style={{ "--i": i++ } as CSSProperties}>
              {ch}
            </span>
          ))}
          {w < words.length - 1 && <span className="ch" style={{ "--i": i++ } as CSSProperties}> </span>}
        </span>
      ))}
    </span>
  );
}

/**
 * Shared shell for Screens 02–10: same fire light, typography and title
 * treatment; each screen supplies its own `environment`.
 */
export function Scene({ id, number, kanji, title, subtitle, glow, children, className = "", environment }: SceneProps) {
  const style = { "--glow-x": glow?.x ?? "50%", "--glow-y": glow?.y ?? "100%" } as CSSProperties;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`scene ${className}`} style={style}>
      <div aria-hidden className="scene-seam" data-reveal />
      <div aria-hidden className="scene-glow" />
      {environment}
      {/* giant kanji watermark, drifting with the scroll */}
      <div
        aria-hidden
        className="scene-kanji pointer-events-none absolute -right-[4vw] top-[6vh] z-[1] select-none font-display text-[38vw] font-extrabold leading-none text-transparent md:text-[24vw]"
        style={{ WebkitTextStroke: "1px rgba(255,140,26,0.09)" }}
      >
        {kanji}
      </div>
      <div className="scene-inner">
        <header className="mb-12 md:mb-16" data-reveal>
          <div className="flex items-center gap-4">
            <span className="font-display text-sm text-amber">{number}</span>
            <span className="ember-rule scene-num-rule w-16" />
          </div>
          <h2
            id={`${id}-title`}
            aria-label={title}
            className="glow-text mt-5 font-display text-[clamp(2.3rem,6.5vw,5.4rem)] font-extrabold uppercase leading-[0.95] tracking-[0.02em] text-bone"
          >
            <IgniteTitle text={title} />
          </h2>
          {subtitle && <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-bone-dim md:text-base">{subtitle}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

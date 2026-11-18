import Image from "next/image";

const CUTOUT = "/assets/profile/vivek-cutout.webp";
/* same fades as .portrait-img in globals.css — hides the photo's cropped shoulder edges */
const FADE = "linear-gradient(180deg, #000 78%, transparent 100%), radial-gradient(75% 95% at 50% 32%, #000 62%, transparent 100%)";

/**
 * The real photograph, cut out of its white studio backdrop and lit by the
 * scene's fire: smoke behind, firelight from below, a warm rim along the
 * silhouette. The head breaks out of the arch for depth.
 */
export function FirePortrait({ lit = true, eager = false, sizes, className = "" }: { lit?: boolean; eager?: boolean; sizes: string; className?: string }) {
  return (
    <div className={`fire-portrait relative aspect-[890/1024] ${lit ? "is-lit" : ""} ${className}`}>
      {/* the arch: a dark portal with smoke and firelight */}
      <div aria-hidden className="portal absolute inset-x-[4%] bottom-0 top-[14%] overflow-hidden rounded-t-[999px]">
        <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_100%,#3a1206_0%,#160805_55%,#070504_100%)]" />
        <div className="portrait-smoke portrait-smoke-a" />
        <div className="portrait-smoke portrait-smoke-b" />
        <div className="portrait-fire absolute inset-x-[-10%] bottom-[-12%] h-[60%] bg-[radial-gradient(50%_60%_at_50%_100%,rgba(255,120,30,0.75),rgba(194,42,16,0.35)_45%,transparent_75%)]" />
        <div className="absolute inset-0 rounded-t-[999px] shadow-[inset_0_0_0_1px_rgba(255,181,71,0.45),inset_0_0_60px_rgba(0,0,0,0.6)]" />
      </div>

      {/* the person */}
      <div className="portrait-figure absolute inset-0">
        <Image
          src={CUTOUT}
          alt="Portrait of Pasunuti Vivek"
          fill
          sizes={sizes}
          preload={eager}
          loading={eager ? "eager" : "lazy"}
          className="portrait-img object-contain object-bottom"
        />
        {/* firelight grading, clipped to the silhouette */}
        <div aria-hidden className="portrait-light absolute inset-0" style={{ WebkitMaskImage: `url(${CUTOUT}), ${FADE}`, maskImage: `url(${CUTOUT}), ${FADE}` }} />
      </div>

      {/* fire line along the base of the portal */}
      <div aria-hidden className="ember-rule absolute -bottom-px left-[-6%] right-[-6%]" />
      {/* a few embers rising in front */}
      <div aria-hidden className="portrait-embers pointer-events-none absolute inset-0">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} style={{ left: `${8 + ((i * 37) % 84)}%`, animationDelay: `${(i * 0.7) % 5}s`, animationDuration: `${4.5 + (i % 4)}s` }} />
        ))}
      </div>
    </div>
  );
}

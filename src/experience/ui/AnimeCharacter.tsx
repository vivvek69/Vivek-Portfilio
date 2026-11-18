import { useId } from "react";
import { CHARACTER_VIEWBOX, characterMarkup } from "./characterSvg";

/**
 * Animated anime-style character of Pasunuti Vivek: breathing, blinking,
 * swaying hair and coat, a flickering AI-core flame, energy running through
 * the coat's circuit lines, and eyes that follow the cursor ([data-look]).
 * It rises out of the fire when `lit` (or when an ancestor is revealed).
 */
export function AnimeCharacter({ lit = false, className = "", label = "Animated anime-style character of Pasunuti Vivek holding a flame" }: { lit?: boolean; className?: string; label?: string }) {
  const prefix = `ch${useId().replace(/[^a-zA-Z0-9]/g, "")}-`;
  return (
    <div className={`anime-char relative ${lit ? "is-lit" : ""} ${className}`} data-look>
      <svg viewBox={CHARACTER_VIEWBOX} role="img" aria-label={label} className="relative h-full w-full overflow-visible" dangerouslySetInnerHTML={{ __html: characterMarkup(prefix) }} />
      {/* the burning edge that draws the character upward */}
      <span aria-hidden className="char-edge" />
    </div>
  );
}

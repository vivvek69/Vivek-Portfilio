"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setMounted(true);

    const update = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    const handleHover = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const isInteractive = Boolean(
        target?.closest("a, button, [data-cursor='interactive']") ||
          target?.closest("[role='button']")
      );
      setHovering(isInteractive);
    };

    window.addEventListener("pointermove", update);
    window.addEventListener("mouseover", handleHover);
    window.addEventListener("mouseout", handleHover);

    return () => {
      window.removeEventListener("pointermove", update);
      window.removeEventListener("mouseover", handleHover);
      window.removeEventListener("mouseout", handleHover);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] hidden md:block" aria-hidden="true">
      <div
        className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ffb000]/80 bg-[#ff6500]/70 shadow-[0_0_20px_rgba(255,101,0,0.8)] transition-all duration-150"
        style={{ left: position.x, top: position.y }}
      />
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ff6500]/50 transition-all duration-200 ${
          hovering ? "h-16 w-16 bg-[#ff6500]/10" : "h-9 w-9 bg-[#ff6500]/5"
        }`}
        style={{ left: position.x, top: position.y }}
      />
    </div>
  );
}

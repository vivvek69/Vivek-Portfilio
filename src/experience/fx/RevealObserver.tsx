"use client";

import { useEffect } from "react";

/**
 * Adds `is-revealed` to any `[data-reveal]` element and `is-lit` to any
 * `[data-ignite]` element when it scrolls into view. Watches the DOM so
 * elements mounted later (e.g. mission scenes) are picked up automatically.
 */
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          if (el.hasAttribute("data-reveal")) el.classList.add("is-revealed");
          if (el.hasAttribute("data-ignite")) el.classList.add("is-lit");
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    const seen = new WeakSet<Element>();
    const scan = (root: ParentNode) => {
      root.querySelectorAll("[data-reveal]:not(.is-revealed), [data-ignite]:not(.is-lit)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };

    scan(document);
    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        scan(document);
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}

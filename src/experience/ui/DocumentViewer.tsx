"use client";

import { Download, ExternalLink, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type ViewerItem = {
  kind: "image" | "pdf";
  src: string;
  title: string;
  /** Original file to open / download (e.g. the PDF behind a preview image). */
  file?: string;
  alt?: string;
};

const ViewerCtx = createContext<(item: ViewerItem) => void>(() => {});
export const useViewer = () => useContext(ViewerCtx);

/** Large, accessible preview for documents and figures. Documents load only when opened. */
export function ViewerProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<ViewerItem | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const open = useCallback((next: ViewerItem) => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setItem(next);
  }, []);

  const close = useCallback(() => {
    setItem(null);
    requestAnimationFrame(() => returnFocus.current?.focus());
  }, []);

  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [item, close]);

  const value = useMemo(() => open, [open]);
  const file = item?.file ?? item?.src;

  return (
    <ViewerCtx.Provider value={value}>
      {children}
      {item && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          className="fixed inset-0 z-[95] flex flex-col bg-[rgba(5,4,3,0.94)] backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="flex items-center gap-3 border-b border-amber/15 px-4 py-3 md:px-6">
            <p className="min-w-0 flex-1 truncate font-display text-sm text-bone md:text-base">{item.title}</p>
            {file && (
              <>
                <a href={file} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-3 !py-2">
                  <ExternalLink size={14} aria-hidden /> <span className="max-sm:sr-only">Open</span>
                </a>
                <a href={file} download className="btn-ghost !px-3 !py-2">
                  <Download size={14} aria-hidden /> <span className="max-sm:sr-only">Download</span>
                </a>
              </>
            )}
            <button ref={closeRef} type="button" onClick={close} className="btn-ghost !px-3 !py-2" aria-label="Close preview">
              <X size={16} aria-hidden />
            </button>
          </div>
          <div className="relative min-h-0 flex-1 p-3 md:p-6" onClick={(e) => e.target === e.currentTarget && close()}>
            {item.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.src} alt={item.alt ?? item.title} className="mx-auto h-full w-full object-contain shadow-[0_0_80px_rgba(255,106,19,0.15)]" />
            ) : (
              <object data={`${item.src}#view=FitH`} type="application/pdf" className="h-full w-full bg-char" aria-label={item.title}>
                <div className="grid h-full place-items-center p-6 text-center">
                  <div>
                    <p className="text-bone">This browser can’t display the PDF inline.</p>
                    <a href={item.src} target="_blank" rel="noopener noreferrer" className="btn-flame mt-5">
                      Open the PDF <ExternalLink size={14} aria-hidden />
                    </a>
                  </div>
                </div>
              </object>
            )}
          </div>
        </div>
      )}
    </ViewerCtx.Provider>
  );
}

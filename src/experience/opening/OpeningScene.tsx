"use client";

import { ChevronDown, FastForward, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import { AnimeCharacter } from "../ui/AnimeCharacter";
import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "@/data/resumeData";
import { useCapabilities } from "../hooks/useCapabilities";
import { SoundToggle } from "../ui/SoundToggle";

const TrainStage = dynamic(() => import("./three/TrainStage"), { ssr: false });

type Phase = "loading" | "playing" | "revealed" | "done";

type Props = {
  onPlayingChange: (playing: boolean) => void;
  onReplay: () => void;
  onEnter: () => void;
  paused: boolean;
};

export function OpeningScene({ onPlayingChange, onReplay, onEnter, paused }: Props) {
  const caps = useCapabilities();
  const [phase, setPhase] = useState<Phase>("loading");
  const [failed, setFailed] = useState(false);
  const [skipToken, setSkipToken] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const cinematic = caps.ready && caps.webgl && !caps.reducedMotion && !failed;
  const staticMode = caps.ready && !cinematic;

  // Static composition: reduced motion, no WebGL, or the 3D scene failed.
  useEffect(() => {
    if (!staticMode) return;
    const id = requestAnimationFrame(() => setPhase("done"));
    return () => cancelAnimationFrame(id);
  }, [staticMode]);

  // If the 3D chunk never becomes ready, fall back instead of leaving a blank screen.
  useEffect(() => {
    if (!cinematic || phase !== "loading") return;
    const id = window.setTimeout(() => setFailed(true), 12000);
    return () => window.clearTimeout(id);
  }, [cinematic, phase]);

  useEffect(() => {
    onPlayingChange(phase === "loading" || phase === "playing");
  }, [phase, onPlayingChange]);

  const skip = useCallback(() => {
    if (phase === "playing" || phase === "loading") {
      if (phase === "loading") setPhase("done");
      else setSkipToken((n) => n + 1);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" && phase !== "loading") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, skip]);

  const revealed = phase === "revealed" || phase === "done";
  const dark = revealed || staticMode || skipToken > 0;

  return (
    <section
      ref={sectionRef}
      id="opening"
      aria-label="Opening — Pasunuti Vivek, AI Engineer"
      className="scene flex min-h-[100svh] items-stretch"
      style={{ background: dark ? "#050403" : "#f6f3ee", transition: "background 1.2s ease" }}
    >
      {/* 3D stage */}
      {cinematic && (
        <div className="absolute inset-0 z-0" style={{ opacity: phase === "loading" ? 0 : 1, transition: "opacity 0.8s" }}>
          <TrainStage
            quality={caps.lowPower ? "low" : "high"}
            paused={paused && phase === "done"}
            skipToken={skipToken}
            onReady={() => setPhase((p) => (p === "loading" ? "playing" : p))}
            onReveal={() => setPhase((p) => (p === "done" ? p : "revealed"))}
            onComplete={() => setPhase("done")}
            onLost={() => setFailed(true)}
          />
        </div>
      )}

      {/* static backdrop for the fallback path */}
      {staticMode && (
        <div aria-hidden className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_110%,rgba(255,90,20,0.28),transparent_65%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_75%_40%,rgba(143,26,12,0.25),transparent_70%)]" />
        </div>
      )}

      {/* quiet loader on the white screen */}
      {cinematic && phase === "loading" && (
        <div className="absolute inset-0 z-10 grid place-items-center" role="status" aria-live="polite">
          <div className="flex flex-col items-center gap-4 text-[#7b7068]">
            <div className="h-px w-24 overflow-hidden bg-[#d9d1c7]">
              <div className="h-full w-1/3 animate-[loader_1.2s_ease-in-out_infinite] bg-[#7b7068]" />
            </div>
            <span className="text-[0.62rem] uppercase tracking-[0.5em]">Departing</span>
          </div>
          <style>{`@keyframes loader{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
        </div>
      )}

      {/* legibility scrim behind the identity */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(5,4,3,0.85)_0%,rgba(5,4,3,0.35)_45%,transparent_70%)] max-md:bg-[linear-gradient(0deg,rgba(5,4,3,0.92)_0%,rgba(5,4,3,0.4)_55%,transparent_80%)]"
        style={{ opacity: revealed ? 1 : 0, transition: "opacity 1.6s" }}
      />

      <IdentityReveal revealed={revealed} onEnter={onEnter} />

      {/* controls */}
      {(phase === "playing" || phase === "loading") && (
        <div className="absolute right-4 top-4 z-20 flex gap-2 md:right-6 md:top-6">
          <SoundToggle compact />
        </div>
      )}
      <div className="absolute bottom-5 right-4 z-20 flex gap-2 md:bottom-8 md:right-8">
        {(phase === "playing" || phase === "loading") && cinematic ? (
          <button
            type="button"
            onClick={skip}
            className="btn-ghost"
            style={!dark ? { color: "#3b332d", borderColor: "rgba(59,51,45,0.3)", background: "rgba(255,255,255,0.5)" } : undefined}
          >
            <FastForward size={14} aria-hidden /> Skip intro
          </button>
        ) : cinematic ? (
          <button type="button" onClick={onReplay} className="btn-ghost" style={{ opacity: phase === "done" ? 1 : 0, transition: "opacity 1s" }}>
            <RotateCcw size={14} aria-hidden /> Replay intro
          </button>
        ) : null}
      </div>
    </section>
  );
}

function IdentityReveal({ revealed, onEnter }: { revealed: boolean; onEnter: () => void }) {
  const [lit, setLit] = useState(false);
  useEffect(() => {
    if (!revealed) {
      const id = requestAnimationFrame(() => setLit(false));
      return () => cancelAnimationFrame(id);
    }
    // two frames so the transition starts from the hidden state
    let id2 = 0;
    const id = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setLit(true));
    });
    return () => {
      cancelAnimationFrame(id);
      cancelAnimationFrame(id2);
    };
  }, [revealed]);

  return (
    <div
      className="relative z-10 mx-auto grid w-full max-w-[86rem] grid-cols-1 items-center gap-6 px-4 pb-24 pt-20 md:grid-cols-[1.15fr_0.85fr] md:gap-10 md:px-10 md:pb-16 md:pt-16 lg:pl-24"
      style={{ visibility: revealed ? "visible" : "hidden" }}
    >
      {/* name + title */}
      <div className="order-2 md:order-1">
        <p className={`eyebrow trail-reveal ${lit ? "is-lit" : ""}`} style={{ ["--trail-delay" as string]: "0ms" }}>
          {profile.organization}
        </p>
        <h1 className="fire-glow mt-4 font-display font-extrabold leading-[0.86] tracking-[-0.01em]">
          <span
            className={`fire-text trail-reveal block text-[clamp(3rem,10vw,8.6rem)] ${lit ? "is-lit" : ""}`}
            style={{ ["--trail-delay" as string]: "150ms" }}
          >
            {profile.firstName}
          </span>
          <span
            className={`fire-text trail-reveal block text-[clamp(3rem,10vw,8.6rem)] ${lit ? "is-lit" : ""}`}
            style={{ ["--trail-delay" as string]: "450ms" }}
          >
            {profile.lastName}
          </span>
        </h1>
        <div
          className="ember-rule mt-6 w-full max-w-md origin-left"
          style={{ transform: lit ? "scaleX(1)" : "scaleX(0)", transition: "transform 1.4s cubic-bezier(.3,.7,.2,1) 0.9s" }}
        />
        <p
          className={`glow-text trail-reveal mt-5 text-[clamp(1rem,2.4vw,1.6rem)] font-semibold tracking-[0.55em] text-bone ${lit ? "is-lit" : ""}`}
          style={{ ["--trail-delay" as string]: "1000ms" }}
        >
          {profile.role}
        </p>
        <div
          className="mt-8 flex flex-wrap items-center gap-3"
          style={{ opacity: lit ? 1 : 0, transform: lit ? "none" : "translateY(10px)", transition: "all 1s ease 1.8s" }}
        >
          <button type="button" onClick={onEnter} className="btn-flame">
            Begin the journey <ChevronDown size={14} aria-hidden />
          </button>
          <span className="text-xs tracking-[0.2em] text-bone-dim">{profile.location}</span>
        </div>
      </div>

      {/* the main character rises out of the fire */}
      <div className="order-1 flex justify-center md:order-2 md:justify-end">
        <figure className="relative aspect-[400/860] h-[44svh] md:h-[min(84svh,52rem)]">
          <AnimeCharacter lit={lit} className="h-full w-full" />
          <figcaption
            className="absolute -left-7 top-4 font-display text-xs tracking-[0.5em] text-amber/80 [writing-mode:vertical-rl] max-md:hidden"
            style={{ opacity: lit ? 1 : 0, transition: "opacity 1.2s ease 1.6s" }}
          >
            人工知能技師
          </figcaption>
        </figure>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-bone-dim md:flex"
        style={{ opacity: lit ? 0.8 : 0, transition: "opacity 1s ease 2.4s" }}
      >
        <span className="text-[0.6rem] uppercase tracking-[0.5em]">Scroll</span>
        <span className="block h-10 w-px bg-gradient-to-b from-amber to-transparent" />
      </div>
    </div>
  );
}

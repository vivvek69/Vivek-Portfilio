"use client";

import { useSyncExternalStore } from "react";

export type Capabilities = {
  /** True once evaluated on the client. */
  ready: boolean;
  reducedMotion: boolean;
  webgl: boolean;
  /** Touch-first or narrow device: lower particle counts, no post-processing. */
  lowPower: boolean;
};

const SERVER: Capabilities = { ready: false, reducedMotion: false, webgl: false, lowPower: false };

let cached: Capabilities | null = null;

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return false;
    (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function compute(): Capabilities {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 820;
  const cores = navigator.hardwareConcurrency ?? 8;
  return {
    ready: true,
    reducedMotion,
    webgl: detectWebGL(),
    lowPower: coarse || narrow || cores <= 4,
  };
}

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onChange = () => {
    cached = compute();
    cb();
  };
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): Capabilities {
  if (!cached) cached = compute();
  return cached;
}

export function useCapabilities(): Capabilities {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER);
}

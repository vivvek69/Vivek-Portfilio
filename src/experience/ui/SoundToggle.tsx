"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { fireAudio } from "../fx/audio";

export function SoundToggle({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => fireAudio.subscribe(setOn), []);
  return (
    <button
      type="button"
      onClick={() => void fireAudio.toggle()}
      aria-pressed={on}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      className={`btn-ghost ${compact ? "!px-3 !py-2" : ""} ${className}`}
    >
      {on ? <Volume2 size={14} aria-hidden /> : <VolumeX size={14} aria-hidden />}
      {!compact && <span>{on ? "Sound on" : "Sound off"}</span>}
    </button>
  );
}

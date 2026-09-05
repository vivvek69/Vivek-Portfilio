"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const steps = [
  "SYSTEM INITIALIZING...",
  "LOADING AI CORE...",
  "LOADING ENGINEERING DATA...",
  "INITIALIZING INTELLIGENT SYSTEMS...",
];

export function FireLoader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((current) => {
        const next = current + 3;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setVisible(false), 900);
          return 100;
        }
        return next;
      });
    }, 80);

    const stepTimer = setInterval(() => {
      setStepIndex((current) => (current + 1) % steps.length);
    }, 750);

    return () => {
      clearInterval(interval);
      clearInterval(stepTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8 } }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#050505]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,101,0,0.18),transparent_38%)]" />
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1 }}
            className="relative flex flex-col items-center gap-5"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.9, 1.1, 1], opacity: 1 }}
              transition={{ duration: 1.3, repeat: Infinity, repeatType: "reverse" }}
              className="h-8 w-8 rounded-full bg-[radial-gradient(circle,_#fff7ed_0%,_#ffb000_25%,_#ff6500_55%,_transparent_78%)] shadow-[0_0_40px_rgba(255,101,0,0.8)]"
            />
            <div className="text-center uppercase tracking-[0.5em] text-[#fff7ed]/75 text-[10px] md:text-xs">
              {steps[stepIndex]}
            </div>
            <div className="w-[260px] overflow-hidden rounded-full border border-[#ff6500]/25 bg-[#101010]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
                className="h-2 rounded-full bg-[linear-gradient(90deg,_#ffb000_0%,_#ff6500_35%,_#ff2a00_100%)] shadow-[0_0_20px_rgba(255,101,0,0.8)]"
              />
            </div>
            <div className="text-3xl font-black tracking-[0.4em] text-[#fff7ed]">
              {progress}%
            </div>
            <div className="text-xs uppercase tracking-[0.6em] text-[#ffb000]/80">
              SYSTEM READY
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

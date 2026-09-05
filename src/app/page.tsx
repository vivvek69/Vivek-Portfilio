"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { z } from "zod";
import { CustomCursor } from "@/components/cinematic/CustomCursor";
import { FireLoader } from "@/components/cinematic/FireLoader";
import { SceneBackground } from "@/components/cinematic/SceneBackground";
import {
  analyticsData,
  contactLinks,
  coreNodes,
  education,
  forgeNodes,
  missions,
  navItems,
  profile,
  projects,
  roleSequence,
  skillBars,
  skillCategories,
} from "@/data/resumeData";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  message: z.string().min(10, "Tell me more"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8">
      <p className="mb-3 text-[10px] uppercase tracking-[0.7em] text-[#ffb000]/80">{eyebrow}</p>
      <h2 className="text-3xl font-black uppercase tracking-tight text-[#fff7ed] drop-shadow-[0_0_18px_rgba(255,176,0,0.35)] md:text-5xl">
        {title}
      </h2>
    </div>
  );
}

export default function Home() {
  const [activeProject, setActiveProject] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicIntervalRef = useRef<number | null>(null);

  const stopAmbientMusic = () => {
    if (musicIntervalRef.current) {
      window.clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setMusicEnabled(false);
  };

  const startAmbientMusic = async () => {
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    const context = new AudioCtor();
    const master = context.createGain();
    master.gain.value = 0.025;
    master.connect(context.destination);

    const notes = [174.61, 196.0, 220.0, 246.94, 261.63];
    const oscillators = notes.map((frequency, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const filter = context.createBiquadFilter();

      oscillator.type = index % 2 === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      filter.type = "lowpass";
      filter.frequency.value = 1000;
      filter.Q.value = 0.9;
      gainNode.gain.value = 0.0001;

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(master);
      oscillator.start();

      return { oscillator, gainNode, frequency };
    });

    const pulse = () => {
      oscillators.forEach(({ gainNode, oscillator, frequency }, index) => {
        const lift = index % 2 === 0 ? 1 : 0.9;
        oscillator.frequency.setTargetAtTime(frequency * lift, context.currentTime, 0.8);
        gainNode.gain.cancelScheduledValues(context.currentTime);
        gainNode.gain.setTargetAtTime(0.012 + (index % 3) * 0.004, context.currentTime, 0.9);
      });
    };

    pulse();
    audioContextRef.current = context;
    musicIntervalRef.current = window.setInterval(pulse, 2800);
    setMusicEnabled(true);
  };

  const toggleMusic = async () => {
    if (musicEnabled) {
      stopAmbientMusic();
      return;
    }

    await startAmbientMusic();
  };

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const activeMission = useMemo(
    () => (activeProject !== null ? projects[activeProject] : projects[0]),
    [activeProject]
  );

  const handleSubmit = (values: ContactFormValues) => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      form.reset();
    }, 1200);
    console.log("Portfolio form submitted", values);
  };

  return (
    <main className="bg-[#050505] text-[#fff7ed] selection:bg-[#ff6500]/30">
      <CustomCursor />
      <FireLoader />

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#050505]/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="text-xs font-bold uppercase tracking-[0.5em] text-[#ffb000]">VIVEK</div>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[10px] uppercase tracking-[0.25em] text-[#fff7ed]/70 transition hover:text-[#ffb000]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="rounded-full border border-[#ff6500]/50 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-[#fff7ed] md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            MENU
          </button>
        </div>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-white/10 bg-[#050505]/90 p-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-xs uppercase tracking-[0.35em] text-[#fff7ed]/80"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </header>

      <section className="relative min-h-screen overflow-hidden border-b border-white/10">
        <SceneBackground />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,101,0,0.14)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(0,0,0,0.6),_rgba(0,0,0,0.15),_rgba(5,5,5,0.7))]" />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pb-16 pt-28 md:px-10">
          <div className="mb-5 flex items-center justify-between gap-3">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.7em] text-[#ffb000]"
            >
              <Sparkles size={12} />
              CHAPTER 00 · THE AWAKENING
            </motion.div>

            <button
              type="button"
              onClick={toggleMusic}
              className="inline-flex items-center gap-2 rounded-full border border-[#ff6500]/50 bg-[#0d0d0d]/75 px-3 py-2 text-[9px] font-medium uppercase tracking-[0.3em] text-[#fff7ed] shadow-[0_0_25px_rgba(255,101,0,0.18)] backdrop-blur-sm transition hover:border-[#ffb000]/70"
              aria-label={musicEnabled ? "Pause background music" : "Play background music"}
            >
              {musicEnabled ? <Volume2 size={14} className="text-[#ffb000]" /> : <VolumeX size={14} className="text-[#fff7ed]/70" />}
              {musicEnabled ? "Music On" : "Music Off"}
            </button>
          </div>

          <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.15 }}
                className="max-w-4xl text-[3.1rem] font-black uppercase leading-[0.82] tracking-[-0.05em] text-[#fff7ed] drop-shadow-[0_0_30px_rgba(255,141,0,0.25)] sm:text-[4.1rem] md:text-[5.5rem] lg:text-[7.5rem]"
              >
                <span className="block bg-[linear-gradient(180deg,_#fffaf3_0%,_#ffe8b2_22%,_#ffbf53_42%,_#ff8d2a_68%,_#fff7ed_100%)] bg-clip-text text-transparent [text-shadow:0_0_18px_rgba(255,180,0,0.14)]">
                  THE FIRE NEVER STOPS.
                </span>
                <span className="mt-2 block text-[#fff9f2] [text-shadow:0_0_22px_rgba(255,101,0,0.4),0_0_1px_rgba(255,255,255,0.7)]">
                  NEITHER DOES THE LEARNING.
                </span>
              </motion.h1>

              <div className="mt-7 space-y-2">
                <div className="text-[2.25rem] font-black uppercase leading-none tracking-[0.12em] text-[#fff7ed] sm:text-[3.3rem] md:text-[5rem]">
                  PASUNITI
                </div>
                <div className="text-[2.4rem] font-black uppercase leading-none tracking-[0.08em] text-[#ff6500] sm:text-[3.6rem] md:text-[5.2rem]">
                  VIVEK
                </div>
              </div>

              <div className="mt-8 space-y-2 overflow-hidden">
                {roleSequence.map((role, index) => (
                  <motion.div
                    key={role}
                    initial={{ y: 32, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.4 + index * 0.2 }}
                    className="text-[0.66rem] uppercase leading-relaxed tracking-[0.28em] text-[#fff7ed]/70 sm:text-xs md:text-sm"
                  >
                    {role}
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  href="#engineer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ff6500]/60 bg-[linear-gradient(135deg,_rgba(255,101,0,0.14),_rgba(255,176,0,0.08))] px-7 py-3 text-[10px] font-bold uppercase tracking-[0.35em] text-[#fff7ed] shadow-[0_0_30px_rgba(255,101,0,0.35)]"
                >
                  ENTER THE JOURNEY <ArrowRight size={16} />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  href="#projects"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/3 px-7 py-3 text-[10px] font-bold uppercase tracking-[0.35em] text-[#fff7ed]"
                >
                  EXPLORE MISSIONS
                </motion.a>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative mx-auto w-full max-w-md rounded-[2rem] border border-[#ff6500]/25 bg-[#0b0b0b]/80 p-6 shadow-[0_0_60px_rgba(255,101,0,0.15)] backdrop-blur-md"
            >
              <div className="mb-5 text-[10px] uppercase tracking-[0.6em] text-[#ffb000]">SYSTEM STATUS</div>
              <div className="space-y-4 text-sm text-[#fff7ed]/90">
                {[
                  ["PYTHON", "ONLINE"],
                  ["GENERATIVE AI", "ONLINE"],
                  ["AI AGENTS", "ONLINE"],
                  ["BACKEND SYSTEMS", "ONLINE"],
                ].map(([label, status]) => (
                  <div key={label} className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="uppercase tracking-[0.25em] text-[#fff7ed]/70">{label}</span>
                    <span className="text-[10px] uppercase tracking-[0.35em] text-[#ffb000]">{status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="engineer" className="relative border-b border-white/10 bg-[#080808] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="CHAPTER 01" title="THE ENGINEER" />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-[#ff6500]/20 bg-[linear-gradient(135deg,_rgba(255,101,0,0.06),_rgba(255,255,255,0.02))] p-6 md:p-8">
              <div className="mb-6 text-[10px] uppercase tracking-[0.7em] text-[#ffb000]">ENGINEER PROFILE</div>
              <div className="mb-4 text-3xl font-black uppercase tracking-tight text-[#fff7ed] md:text-5xl">
                {profile.name}
              </div>
              <div className="mb-8 text-xl uppercase tracking-[0.2em] text-[#ff6500] md:text-2xl">
                {profile.role}
              </div>
              <div className="mb-6 flex items-center gap-2 text-[#fff7ed]/70">
                <MapPin size={16} className="text-[#ffb000]" />
                {profile.location}
              </div>
              <div className="space-y-4 text-sm leading-7 text-[#fff7ed]/70 md:text-base">
                <p className="text-xl font-semibold uppercase tracking-[0.2em] text-[#fff7ed]">THE MISSION</p>
                <p>{profile.objective}</p>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-[#0d0d0d] p-6">
              <div className="mb-5 text-[10px] uppercase tracking-[0.7em] text-[#ffb000]">SCANNING PROFILE...</div>
              <div className="space-y-6">
                {[
                  "PYTHON",
                  "GENERATIVE AI",
                  "AI AGENTS",
                  "BACKEND SYSTEMS",
                ].map((item, index) => (
                  <div key={item} className="relative overflow-hidden rounded-full border border-[#ff6500]/30 bg-[#111111] px-3 py-3">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${70 + index * 10}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.15 }}
                      className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,_rgba(255,176,0,0.3),_rgba(255,101,0,0.8))]"
                    />
                    <div className="relative flex items-center justify-between px-2 text-[10px] uppercase tracking-[0.35em] text-[#fff7ed]">
                      <span>{item}</span>
                      <span className="text-[#ffb000]">ONLINE</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className="relative border-b border-white/10 bg-[#090909] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="CHAPTER 02" title="THE FLAME FORGE" />
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-[2rem] border border-[#ff6500]/20 bg-[#111111] p-6">
              <div className="mb-8 text-[10px] uppercase tracking-[0.7em] text-[#ffb000]">AI ENGINEERING</div>
              <div className="relative flex min-h-[360px] items-center justify-center">
                <div className="absolute h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(255,101,0,0.24),_transparent_60%)] blur-2xl" />
                {forgeNodes.map((node, index) => {
                  const angle = (index / forgeNodes.length) * Math.PI * 2;
                  const radius = index % 2 === 0 ? 130 : 170;
                  const x = Math.round(Math.cos(angle) * radius);
                  const y = Math.round(Math.sin(angle) * radius);
                  return (
                    <motion.div
                      key={node.name}
                      initial={{ opacity: 0, scale: 0.7 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.3 }}
                      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                      style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                    >
                      <div className="rounded-full border border-[#ff6500]/50 bg-[#0f0f0f]/80 px-3 py-2 text-[9px] uppercase tracking-[0.35em] text-[#fff7ed] shadow-[0_0_30px_rgba(255,101,0,0.25)]">
                        {node.name}
                      </div>
                    </motion.div>
                  );
                })}
                <div className="relative rounded-full border border-[#ffb000]/60 bg-[radial-gradient(circle,_rgba(255,176,0,0.18),_rgba(255,101,0,0.08),_rgba(0,0,0,0.85))] px-6 py-5 text-center shadow-[0_0_50px_rgba(255,101,0,0.25)]">
                  <div className="text-[9px] uppercase tracking-[0.7em] text-[#ffb000]">CORE</div>
                  <div className="mt-2 text-2xl font-black uppercase tracking-[0.2em] text-[#fff7ed]">
                    AI
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#0d0d0d] p-6">
              <div className="mb-6 text-[10px] uppercase tracking-[0.7em] text-[#ffb000]">ENGINEERING ANALYTICS</div>
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={analyticsData} outerRadius="80%">
                      <PolarGrid stroke="#ffffff22" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#fff7ed", fontSize: 11 }} />
                      <Radar dataKey="A" stroke="#ff6500" fill="#ff6500" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillBars} barCategoryGap={18}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff14" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ff6500" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {skillCategories.map((category) => (
                  <div key={category.name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-3 text-[9px] uppercase tracking-[0.35em] text-[#ffb000]">{category.name}</div>
                    <div className="flex flex-wrap gap-2">
                      {category.items.map((item) => (
                        <span key={item} className="rounded-full border border-[#ff6500]/30 bg-[#140d09] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#fff7ed]/80">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="journey" className="relative border-b border-white/10 bg-[#070707] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="CHAPTER 03" title="THE PATH OF KNOWLEDGE" />
          <div className="relative mx-auto max-w-3xl">
            <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-[#ff6500] via-[#ffb000] to-transparent" />
            <div className="space-y-10">
              {education.map((item, index) => (
                <motion.div
                  key={item.degree}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative pl-14"
                >
                  <div className="absolute left-0 top-2 h-10 w-10 rounded-full border border-[#ff6500]/60 bg-[radial-gradient(circle,_rgba(255,176,0,0.5),_rgba(255,101,0,0.2),_rgba(0,0,0,0.8))] shadow-[0_0_30px_rgba(255,101,0,0.4)]" />
                  <div className="rounded-[1.5rem] border border-white/10 bg-[#111111] p-6">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.45em] text-[#ffb000]">{item.duration}</div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-[#fff7ed] md:text-2xl">
                      {item.degree}
                    </h3>
                    <p className="mt-2 text-[#fff7ed]/70">{item.school}</p>
                    <p className="mt-3 text-[#ffb000]">{item.score}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="missions" className="relative border-b border-white/10 bg-[#090909] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="CHAPTER 04" title="MISSION ARCHIVES" />
          <div className="rounded-[2rem] border border-[#ff6500]/20 bg-[#0f0f0f] p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.6em] text-[#ffb000]">MISSION 001</div>
                <h3 className="mt-3 text-2xl font-black uppercase tracking-tight text-[#fff7ed] md:text-4xl">
                  {missions[0].company}
                </h3>
              </div>
              <div className="rounded-full border border-[#ff6500]/40 bg-[#180d09] px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-[#ffb000]">
                {missions[0].status}
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="mb-3 text-[10px] uppercase tracking-[0.6em] text-[#ffb000]">ROLE</div>
                <div className="text-lg font-semibold uppercase tracking-[0.25em] text-[#fff7ed]">{missions[0].role}</div>
                <p className="mt-5 text-[#fff7ed]/70">{missions[0].summary}</p>
              </div>
              <div className="space-y-3">
                {missions[0].details.map((detail) => (
                  <div key={detail} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-[#fff7ed]/70">
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="relative border-b border-white/10 bg-[#070707] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="CHAPTER 05" title="THE PROJECT REALM" />
          <div className="grid gap-6 lg:grid-cols-3">
            {projects.map((project, index) => (
              <motion.button
                key={project.id}
                type="button"
                whileHover={{ y: -8, rotateX: 6 }}
                onClick={() => setActiveProject(index)}
                className={`relative overflow-hidden rounded-[2rem] border p-5 text-left transition ${
                  activeProject === index ? "border-[#ff6500]/50 bg-[#190e0c]" : "border-white/10 bg-[#101010]"
                }`}
              >
                <div className="mb-6 text-[10px] uppercase tracking-[0.6em] text-[#ffb000]">MISSION {project.id}</div>
                <h3 className="min-h-[120px] text-xl font-black uppercase tracking-tight text-[#fff7ed]">
                  {project.title}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tech.map((item) => (
                    <span key={item} className="rounded-full border border-[#ff6500]/30 bg-[#140d09] px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-[#fff7ed]/70">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>

          {activeMission && (
            <motion.div
              key={activeMission.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-[2rem] border border-[#ff6500]/20 bg-[linear-gradient(135deg,_rgba(255,101,0,0.08),_rgba(255,255,255,0.02))] p-6 md:p-8"
            >
              <div className="mb-3 text-[10px] uppercase tracking-[0.7em] text-[#ffb000]">MISSION DETAILS</div>
              <h4 className="text-2xl font-black uppercase tracking-tight text-[#fff7ed] md:text-4xl">
                {activeMission.title}
              </h4>
              <p className="mt-4 max-w-3xl text-[#fff7ed]/70">{activeMission.description}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {activeMission.highlights.map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-[#121212] px-4 py-4 text-sm text-[#fff7ed]/75">
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <section id="ai-core" className="relative border-b border-white/10 bg-[#090909] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="CHAPTER 06" title="THE AI CORE" />
          <div className="rounded-[2rem] border border-[#ff6500]/20 bg-[#111111] p-6 md:p-8">
            <div className="relative flex min-h-[420px] flex-col items-center justify-center">
              <div className="absolute h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(255,101,0,0.22),_transparent_60%)] blur-3xl" />
              {coreNodes.map((node, index) => (
                <div
                  key={node.name}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                  style={{
                    left: "50%",
                    top: `${18 + index * 20}%`,
                  }}
                >
                  <div className="rounded-full border border-[#ff6500]/40 bg-[#0f0f0f] px-5 py-3 text-[9px] uppercase tracking-[0.5em] text-[#fff7ed] shadow-[0_0_25px_rgba(255,101,0,0.2)]">
                    {node.name}
                  </div>
                </div>
              ))}
              <div className="relative z-10 rounded-full border border-[#ffb000]/60 bg-[radial-gradient(circle,_rgba(255,176,0,0.25),_rgba(255,101,0,0.08),_rgba(0,0,0,0.85))] px-8 py-5 text-center shadow-[0_0_60px_rgba(255,101,0,0.25)]">
                <div className="text-[9px] uppercase tracking-[0.7em] text-[#ffb000]">CENTER</div>
                <div className="mt-2 text-3xl font-black uppercase tracking-[0.2em] text-[#fff7ed]">AI CORE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="achievements" className="relative border-b border-white/10 bg-[#080808] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="CHAPTER 07" title="ACHIEVEMENTS" />
          <div className="rounded-[2rem] border border-[#ff6500]/20 bg-[radial-gradient(circle_at_center,_rgba(255,101,0,0.12),_transparent_40%),_#0f0f0f] p-8">
            <div className="mb-4 text-[10px] uppercase tracking-[0.7em] text-[#ffb000]">ACHIEVEMENT UNLOCKED</div>
            <div className="text-3xl font-black uppercase tracking-tight text-[#fff7ed] md:text-5xl">
              IEEE INTERNATIONAL CONFERENCE
            </div>
            <div className="mt-5 max-w-3xl text-[#fff7ed]/75">
              AI-Based Emotionally Intelligent Robotic Companion for Adaptive Human-Robot Interaction
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                "Deep learning architecture",
                "CNN-based emotion recognition",
                "Hybrid AI models",
              ].map((item) => (
                <div key={item} className="rounded-xl border border-[#ff6500]/30 bg-[#140d09] px-4 py-4 text-sm text-[#fff7ed]/75">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="relative bg-[#050505] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="FINAL CHAPTER" title="THE NEXT JOURNEY STARTS HERE" />
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="rounded-[2rem] border border-[#ff6500]/20 bg-[#111111] p-6">
              {contactLinks.map((item) => (
                <div key={item.label} className="mb-5 border-b border-white/10 pb-3">
                  <div className="text-[10px] uppercase tracking-[0.55em] text-[#ffb000]">{item.label}</div>
                  <div className="mt-2 text-sm uppercase tracking-[0.2em] text-[#fff7ed]">{item.value}</div>
                </div>
              ))}
            </div>

            <form onSubmit={form.handleSubmit(handleSubmit)} className="rounded-[2rem] border border-white/10 bg-[#0d0d0d] p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.5em] text-[#ffb000]">NAME</label>
                  <input
                    {...form.register("name")}
                    className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-[#fff7ed] outline-none ring-0 placeholder:text-[#fff7ed]/35 focus:border-[#ff6500]/60"
                    placeholder="Your name"
                  />
                  {form.formState.errors.name && <p className="mt-2 text-xs text-[#ffb000]">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.5em] text-[#ffb000]">EMAIL</label>
                  <input
                    {...form.register("email")}
                    className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-[#fff7ed] outline-none placeholder:text-[#fff7ed]/35 focus:border-[#ff6500]/60"
                    placeholder="you@example.com"
                  />
                  {form.formState.errors.email && <p className="mt-2 text-xs text-[#ffb000]">{form.formState.errors.email.message}</p>}
                </div>
              </div>
              <div className="mt-6">
                <label className="mb-2 block text-[10px] uppercase tracking-[0.5em] text-[#ffb000]">MESSAGE</label>
                <textarea
                  {...form.register("message")}
                  rows={6}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-[#fff7ed] outline-none placeholder:text-[#fff7ed]/35 focus:border-[#ff6500]/60"
                  placeholder="Tell me about your challenge"
                />
                {form.formState.errors.message && <p className="mt-2 text-xs text-[#ffb000]">{form.formState.errors.message.message}</p>}
              </div>
              <button
                type="submit"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#ff6500]/50 bg-[linear-gradient(135deg,_rgba(255,101,0,0.14),_rgba(255,176,0,0.1))] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.35em] text-[#fff7ed]"
              >
                {isSending ? "SENDING..." : "MESSAGE READY"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

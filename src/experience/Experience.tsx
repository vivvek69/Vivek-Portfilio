"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { projects, scenes, type SceneId } from "@/data/resumeData";
import { EmberField } from "./fx/EmberField";
import { FireTransitionProvider, useFireTransition } from "./fx/FireTransition";
import { Interactions } from "./fx/Interactions";
import { RevealObserver } from "./fx/RevealObserver";
import { useCapabilities } from "./hooks/useCapabilities";
import { SceneNav } from "./nav/SceneNav";
import { OpeningScene } from "./opening/OpeningScene";
import { AchievementsScene } from "./scenes/AchievementsScene";
import { ArsenalScene } from "./scenes/ArsenalScene";
import { CharacterScene } from "./scenes/CharacterScene";
import { ContactScene } from "./scenes/ContactScene";
import { EducationScene } from "./scenes/EducationScene";
import { FinalFlame } from "./scenes/FinalFlame";
import { JourneyScene } from "./scenes/JourneyScene";
import { MissionArchives } from "./scenes/MissionArchives";
import { MissionScene } from "./scenes/MissionScene";
import { ResearchScene } from "./scenes/ResearchScene";
import { ViewerProvider } from "./ui/DocumentViewer";

type Origin = { x: number; y: number };
const MISSION_HASH = "#mission/";

export function Experience() {
  const caps = useCapabilities();
  return (
    <FireTransitionProvider reduced={caps.reducedMotion}>
      <ViewerProvider>
        <Stage reduced={caps.reducedMotion} />
      </ViewerProvider>
    </FireTransitionProvider>
  );
}

function Stage({ reduced }: { reduced: boolean }) {
  const fire = useFireTransition();
  const [introPlaying, setIntroPlaying] = useState(true);
  const [introKey, setIntroKey] = useState(0);
  const [active, setActive] = useState<SceneId>("opening");
  const [heroVisible, setHeroVisible] = useState(true);
  const [mission, setMission] = useState<string | null>(null);
  const lastMissionRow = useRef<string | null>(null);

  /* lock scrolling while the intro plays or a mission is open */
  useEffect(() => {
    document.body.classList.toggle("intro-lock", introPlaying || mission !== null);
    return () => document.body.classList.remove("intro-lock");
  }, [introPlaying, mission]);

  /* which scene is on screen */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0) setActive(e.target.id as SceneId);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.01] }
    );
    const hero = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting), { threshold: 0 });
    scenes.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    const op = document.getElementById("opening");
    if (op) hero.observe(op);
    return () => {
      io.disconnect();
      hero.disconnect();
    };
  }, [introKey]);

  const scrollToScene = useCallback((id: SceneId) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "instant" as ScrollBehavior });
    // move focus for keyboard and screen-reader users
    const heading = el.querySelector<HTMLElement>("h1, h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }, []);

  const jump = useCallback(
    (id: SceneId, origin?: Origin) => {
      if (mission) setMission(null);
      fire.play({ origin, onCovered: () => scrollToScene(id) });
    },
    [fire, mission, scrollToScene]
  );

  /* missions */
  const openMission = useCallback(
    (slug: string, origin?: Origin, push = true) => {
      lastMissionRow.current = slug;
      fire.play({
        origin,
        onCovered: () => {
          setMission(slug);
          if (push) window.history.pushState({ mission: slug }, "", `${MISSION_HASH}${slug}`);
          else window.history.replaceState({ mission: slug }, "", `${MISSION_HASH}${slug}`);
        },
      });
    },
    [fire]
  );

  const closeMission = useCallback(
    (origin?: Origin, fromHistory = false) => {
      fire.play({
        origin,
        onCovered: () => {
          setMission(null);
          if (!fromHistory && window.location.hash.startsWith(MISSION_HASH)) {
            window.history.pushState(null, "", window.location.pathname + window.location.search);
          }
        },
        onDone: () => document.getElementById(`mission-${lastMissionRow.current}`)?.focus({ preventScroll: true }),
      });
    },
    [fire]
  );

  /* browser back / forward between archive and missions */
  useEffect(() => {
    const onPop = () => {
      const hash = window.location.hash;
      if (hash.startsWith(MISSION_HASH)) {
        const slug = hash.slice(MISSION_HASH.length);
        if (projects.some((p) => p.slug === slug)) {
          lastMissionRow.current = slug;
          fire.play({ onCovered: () => setMission(slug) });
        }
      } else if (mission) {
        closeMission(undefined, true);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [fire, mission, closeMission]);

  const replay = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setIntroKey((k) => k + 1);
  }, []);

  const replayFromEnd = useCallback(
    (origin: Origin) => {
      fire.play({ origin, onCovered: replay });
    },
    [fire, replay]
  );

  const project = projects.find((p) => p.slug === mission) ?? null;

  return (
    <>
      <RevealObserver />
      <Interactions reduced={reduced} />
      <EmberField active={!introPlaying && !heroVisible} reduced={reduced} />
      <SceneNav hidden={introPlaying} active={active} onJump={jump} />

      <main className="relative z-[2]" inert={mission !== null}>
        <OpeningScene
          key={introKey}
          onPlayingChange={setIntroPlaying}
          onReplay={replay}
          onEnter={() => jump("character")}
          paused={!heroVisible}
        />
        <CharacterScene />
        <JourneyScene />
        <MissionArchives onOpen={(slug, origin) => openMission(slug, origin)} />
        <ResearchScene />
        <EducationScene />
        <AchievementsScene />
        <ArsenalScene />
        <ContactScene />
        <FinalFlame reduced={reduced} onReplay={replayFromEnd} />
      </main>

      {project && (
        <MissionScene
          project={project}
          onReturn={(origin) => closeMission(origin)}
          onSwitch={(slug, origin) => openMission(slug, origin, false)}
          onResearch={() => {
            if (window.location.hash.startsWith(MISSION_HASH)) {
              window.history.replaceState(null, "", window.location.pathname + window.location.search);
            }
            jump("research");
          }}
        />
      )}
    </>
  );
}

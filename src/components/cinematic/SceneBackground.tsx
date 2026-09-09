export function SceneBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_52%_52%,_rgba(255,101,0,0.5)_0%,_rgba(178,35,0,0.24)_20%,_transparent_58%)]" />
      <div className="absolute -left-[12%] top-[12%] h-[75%] w-[75%] rotate-[-18deg] rounded-[45%] bg-[radial-gradient(ellipse_at_center,_rgba(255,176,0,0.38),_rgba(255,42,0,0.18)_34%,_transparent_70%)] blur-2xl" />
      <div className="absolute -right-[15%] bottom-[-20%] h-[80%] w-[70%] rotate-[24deg] rounded-[45%] bg-[radial-gradient(ellipse_at_center,_rgba(142,18,65,0.42),_rgba(255,42,0,0.16)_42%,_transparent_72%)] blur-3xl" />
      <div className="absolute left-[42%] top-[38%] h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff6500]/35 blur-2xl animate-[pulse_5s_ease-in-out_infinite]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_28%,_rgba(0,0,0,0.72)_100%)]" />
    </div>
  );
}

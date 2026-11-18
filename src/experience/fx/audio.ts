"use client";

/**
 * Tiny procedural sound engine (Web Audio). Nothing is downloaded and nothing
 * plays until the visitor explicitly enables sound — no autoplay.
 *
 *  - rumble: low-passed brown noise whose level follows the train's proximity
 *  - chuff:  band-passed noise bursts paced by the train's speed
 *  - whistle: two detuned tones with a soft envelope
 *  - ignite: a low boom + rising noise sweep when the train turns to fire
 *  - crackle: sparse noise clicks for the lingering fire
 */
class FireAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private rumbleGain: GainNode | null = null;
  private crackleTimer: number | null = null;
  private chuffTimer: number | null = null;
  private noise: AudioBuffer | null = null;
  private speed = 0;
  enabled = false;
  private listeners = new Set<(on: boolean) => void>();

  subscribe(fn: (on: boolean) => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    this.listeners.forEach((fn) => fn(this.enabled));
  }

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // 2 seconds of brown noise, reused by every voice
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }

    const rumble = ctx.createBufferSource();
    rumble.buffer = buf;
    rumble.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 140;
    const rg = ctx.createGain();
    rg.gain.value = 0;
    rumble.connect(lp).connect(rg).connect(master);
    rumble.start();

    this.ctx = ctx;
    this.master = master;
    this.rumbleGain = rg;
    this.noise = buf;
    return ctx;
  }

  async setEnabled(on: boolean) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    if (on && ctx.state === "suspended") await ctx.resume();
    this.enabled = on;
    this.master.gain.setTargetAtTime(on ? 0.55 : 0, ctx.currentTime, 0.25);
    if (on) this.startCrackle();
    else this.stopLoops();
    this.emit();
  }

  toggle() {
    return this.setEnabled(!this.enabled);
  }

  /** Called every frame by the opening scene. proximity 0..1, speed 0..1 */
  train(proximity: number, speed: number) {
    if (!this.enabled || !this.ctx || !this.rumbleGain) return;
    this.rumbleGain.gain.setTargetAtTime(0.08 + proximity * proximity * 0.9, this.ctx.currentTime, 0.1);
    this.speed = speed;
    if (speed > 0.02 && this.chuffTimer === null) this.scheduleChuff();
  }

  stopTrain() {
    if (!this.ctx || !this.rumbleGain) return;
    this.rumbleGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
    this.speed = 0;
    if (this.chuffTimer !== null) {
      window.clearTimeout(this.chuffTimer);
      this.chuffTimer = null;
    }
  }

  private scheduleChuff() {
    const tick = () => {
      if (!this.enabled || this.speed <= 0.02) {
        this.chuffTimer = null;
        return;
      }
      this.burst(900, 0.18 + this.speed * 0.25, 0.09, "bandpass");
      this.chuffTimer = window.setTimeout(tick, 520 - this.speed * 330);
    };
    tick();
  }

  whistle() {
    const ctx = this.ctx;
    if (!this.enabled || !ctx || !this.master) return;
    const g = ctx.createGain();
    g.gain.value = 0;
    g.connect(this.master);
    const t = ctx.currentTime;
    g.gain.linearRampToValueAtTime(0.09, t + 0.12);
    g.gain.setValueAtTime(0.09, t + 0.9);
    g.gain.linearRampToValueAtTime(0, t + 1.5);
    for (const f of [523, 659, 784]) {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(f * 0.97, t);
      o.frequency.linearRampToValueAtTime(f, t + 0.15);
      o.connect(g);
      o.start(t);
      o.stop(t + 1.6);
    }
  }

  ignite() {
    const ctx = this.ctx;
    if (!this.enabled || !ctx || !this.master || !this.noise) return;
    const t = ctx.currentTime;
    // boom
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(32, t + 1.2);
    og.gain.setValueAtTime(0.7, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
    o.connect(og).connect(this.master);
    o.start(t);
    o.stop(t + 1.7);
    // whoosh
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(200, t);
    f.frequency.exponentialRampToValueAtTime(5000, t + 0.6);
    f.frequency.exponentialRampToValueAtTime(400, t + 2.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.8, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2.4);
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + 2.5);
  }

  private burst(freq: number, gain: number, dur: number, type: BiquadFilterType) {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.noise) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = 0.8;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.05);
  }

  private startCrackle() {
    if (this.crackleTimer !== null) return;
    const tick = () => {
      if (!this.enabled) {
        this.crackleTimer = null;
        return;
      }
      this.burst(2400 + Math.random() * 3000, 0.05 + Math.random() * 0.07, 0.03 + Math.random() * 0.05, "highpass");
      this.crackleTimer = window.setTimeout(tick, 60 + Math.random() * 420);
    };
    tick();
  }

  private stopLoops() {
    if (this.crackleTimer !== null) window.clearTimeout(this.crackleTimer);
    if (this.chuffTimer !== null) window.clearTimeout(this.chuffTimer);
    this.crackleTimer = null;
    this.chuffTimer = null;
  }
}

export const fireAudio = new FireAudio();

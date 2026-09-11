let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  void ctx.resume();
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType, startOffset = 0) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const t0 = audio.currentTime + startOffset;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export function playSuccess() {
  tone(880, 0.12, "sine");
  tone(1320, 0.18, "sine", 0.1);
}

export function playError() {
  tone(160, 0.35, "square");
}

export function vibrateError() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate?.([120, 60, 120]);
  }
}

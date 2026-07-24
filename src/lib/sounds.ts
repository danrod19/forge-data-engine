/**
 * Sons sutis via Web Audio API (sem assets externos).
 * Seguro para SSR — só inicializa no browser.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

function tone(
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.08
) {
  const ctx = getCtx();
  if (!ctx) return;

  // Resume if suspended (browser autoplay policy)
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(
    0.0001,
    ctx.currentTime + start + duration
  );
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.02);
}

/** Acorde curto ascendente — acerto */
export function playCorrectSound() {
  try {
    tone(523.25, 0, 0.1, "sine", 0.07); // C5
    tone(659.25, 0.08, 0.12, "sine", 0.07); // E5
    tone(783.99, 0.16, 0.18, "triangle", 0.06); // G5
  } catch {
    /* ignore */
  }
}

/** Tom descendente — erro */
export function playWrongSound() {
  try {
    tone(220, 0, 0.12, "square", 0.04);
    tone(165, 0.1, 0.18, "square", 0.035);
  } catch {
    /* ignore */
  }
}

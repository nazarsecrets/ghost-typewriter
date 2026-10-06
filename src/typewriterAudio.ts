/** Small, locally generated mechanical sounds. Nothing loads or plays until the
 * writer turns sound on; text input never waits for this engine. */
export type TypewriterSound = "letter" | "punctuation" | "space" | "erase" | "return";

const VOICES: Record<TypewriterSound, { seconds: number; strength: number; pitch: number }> = {
  letter: { seconds: 0.065, strength: 0.18, pitch: 920 },
  punctuation: { seconds: 0.075, strength: 0.22, pitch: 1100 },
  space: { seconds: 0.055, strength: 0.095, pitch: 680 },
  erase: { seconds: 0.085, strength: 0.14, pitch: 570 },
  return: { seconds: 0.31, strength: 0.19, pitch: 760 },
};

let context: AudioContext | null = null;
let sounds: Record<TypewriterSound, AudioBuffer[]> | null = null;
let resumePending: Promise<void> | null = null;
let lastPlayed = 0;
let variation = 0;
let muteGeneration = 0;
let muted = true;
const active = new Set<AudioBufferSourceNode>();

function makeBuffer(audio: AudioContext, kind: TypewriterSound, variant: number) {
  const { seconds, strength, pitch } = VOICES[kind];
  const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * seconds), audio.sampleRate);
  const data = buffer.getChannelData(0);
  let seed = 101 + variant * 997 + kind.length * 313;
  let low = 0;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 0x100000000 * 2 - 1;
  };
  const frequency = pitch * (1 + (variant - 1.5) * 0.018);

  for (let i = 0; i < data.length; i++) {
    const time = i / audio.sampleRate;
    const noise = random();
    low = low * 0.78 + noise * 0.22;
    const click = (noise - low) * Math.exp(-time * 115);
    const body = Math.sin(2 * Math.PI * frequency * time) * Math.exp(-time * 75);
    const echoTime = Math.max(0, time - (kind === "erase" ? 0.019 : 0.009));
    const echo = time > (kind === "erase" ? 0.019 : 0.009)
      ? (noise - low) * Math.exp(-echoTime * 135) * 0.38 : 0;
    let sample = strength * (click * 0.72 + body * 0.46 + echo);

    if (kind === "return") {
      const travel = (noise - low) * Math.exp(-time * 18) * 0.09;
      const bellTime = time - 0.065;
      const bell = bellTime > 0
        ? (Math.sin(2 * Math.PI * 1270 * bellTime) + 0.34 * Math.sin(2 * Math.PI * 2540 * bellTime))
          * Math.exp(-bellTime * 16) * 0.11 : 0;
      const stopTime = time - 0.19;
      const stop = stopTime > 0 ? (noise - low) * Math.exp(-stopTime * 105) * 0.12 : 0;
      sample += travel + bell + stop;
    }

    data[i] = sample;
  }
  return buffer;
}

function getContext() {
  if (context) return context;
  if (typeof window === "undefined" || !window.AudioContext) return null;
  try {
    context = new AudioContext();
    sounds = Object.fromEntries(
      (Object.keys(VOICES) as TypewriterSound[]).map((kind) =>
        [kind, Array.from({ length: 4 }, (_, variant) => makeBuffer(context!, kind, variant))]
      )
    ) as Record<TypewriterSound, AudioBuffer[]>;
  } catch { context = null; sounds = null; }
  return context;
}

export async function enableTypewriterSound() {
  try {
    const audio = getContext();
    if (!audio) return false;
    if (audio.state !== "running") await audio.resume();
    muted = audio.state !== "running";
    return !muted;
  } catch { return false; }
}

export function prepareTypewriterSound() { muted = false; getContext(); }

export function muteTypewriterSound() {
  muted = true;
  muteGeneration++;
  for (const source of active) { try { source.stop(); } catch { /* already ended */ } }
  active.clear();
  if (context?.state === "running") void context.suspend().catch(() => {});
}

function play(audio: AudioContext, kind: TypewriterSound) {
  if (muted || audio.state !== "running" || !sounds || active.size >= 6) return;
  const source = audio.createBufferSource();
  source.buffer = sounds[kind][variation++ % sounds[kind].length];
  source.connect(audio.destination);
  source.onended = () => { active.delete(source); source.disconnect(); };
  active.add(source);
  source.start();
}

export function playTypewriterSound(kind: TypewriterSound) {
  if (muted) return;
  const now = performance.now();
  // Cap overlapping strikes in a burst. Return is always allowed through.
  if (kind !== "return" && now - lastPlayed < 28) return;
  lastPlayed = now;
  const audio = getContext();
  if (!audio) return;
  if (audio.state === "running") { play(audio, kind); return; }
  // A remembered preference resumes on the next actual key gesture after reload.
  if (!resumePending) {
    const generation = muteGeneration;
    resumePending = audio.resume().then(() => {
      if (generation === muteGeneration) play(audio, kind);
    }).catch(() => {}).finally(() => { resumePending = null; });
  }
}

/** Opt-in recorded typewriter sounds. Loading and playback never delay input. */
export type TypewriterSound = "letter" | "punctuation" | "space" | "erase" | "return";

const STRIKE_COUNT = 8;
const STRIKE_STEP = 0.245;
const STRIKE_LENGTH = 0.22;
const VOLUME: Record<TypewriterSound, number> = {
  letter: 1,
  punctuation: 1.1,
  space: 0.55,
  erase: 0.7,
  return: 1,
};

let context: AudioContext | null = null;
let buffers: { strikes: AudioBuffer; carriage: AudioBuffer } | null = null;
let loading: Promise<boolean> | null = null;
let resumePending: Promise<void> | null = null;
let muted = true;
let generation = 0;
let variation = 0;
let lastPlayed = 0;
const active = new Set<AudioBufferSourceNode>();

function getContext() {
  if (context) return context;
  if (typeof window === "undefined" || !window.AudioContext) return null;
  try { context = new AudioContext(); } catch { context = null; }
  return context;
}

function loadSounds(audio: AudioContext) {
  if (buffers) return Promise.resolve(true);
  if (loading) return loading;
  const base = import.meta.env.BASE_URL;
  loading = Promise.all([
    fetch(`${base}sounds/typewriter-strikes.wav`).then((response) => {
      if (!response.ok) throw new Error("Strike recording unavailable");
      return response.arrayBuffer();
    }).then((data) => audio.decodeAudioData(data)),
    fetch(`${base}sounds/typewriter-return.wav`).then((response) => {
      if (!response.ok) throw new Error("Carriage recording unavailable");
      return response.arrayBuffer();
    }).then((data) => audio.decodeAudioData(data)),
  ]).then(([strikes, carriage]) => {
    buffers = { strikes, carriage };
    return true;
  }).catch(() => false).finally(() => { loading = null; });
  return loading;
}

export async function enableTypewriterSound() {
  const audio = getContext();
  if (!audio) return false;
  try {
    // Start the context during the click gesture, before fetching assets.
    if (audio.state !== "running") await audio.resume();
    if (audio.state !== "running" || !(await loadSounds(audio))) return false;
    muted = false;
    return true;
  } catch { return false; }
}

export function prepareTypewriterSound() {
  muted = false;
  const audio = getContext();
  if (audio) void loadSounds(audio);
}

export function muteTypewriterSound() {
  muted = true;
  generation++;
  for (const source of active) { try { source.stop(); } catch { /* already ended */ } }
  active.clear();
  if (context?.state === "running") void context.suspend().catch(() => {});
}

function play(audio: AudioContext, kind: TypewriterSound) {
  if (muted || audio.state !== "running" || !buffers || active.size >= 6) return;
  const source = audio.createBufferSource();
  const gain = audio.createGain();
  source.buffer = kind === "return" ? buffers.carriage : buffers.strikes;
  gain.gain.value = VOLUME[kind];
  source.connect(gain).connect(audio.destination);
  source.onended = () => { active.delete(source); source.disconnect(); gain.disconnect(); };
  active.add(source);
  if (kind === "return") source.start();
  else {
    const variant = variation++ % STRIKE_COUNT;
    source.start(0, variant * STRIKE_STEP, STRIKE_LENGTH);
  }
}

export function playTypewriterSound(kind: TypewriterSound) {
  if (muted) return;
  const now = performance.now();
  if (kind !== "return" && now - lastPlayed < 28) return;
  lastPlayed = now;
  const audio = getContext();
  if (!audio) return;
  if (audio.state === "running") { play(audio, kind); return; }
  if (!resumePending) {
    const requestedGeneration = generation;
    resumePending = audio.resume().then(() => {
      if (requestedGeneration === generation) play(audio, kind);
    }).catch(() => {}).finally(() => { resumePending = null; });
  }
}

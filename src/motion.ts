import { animate, stagger, steps, type JSAnimation } from "animejs";

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ghostReveal(element: HTMLElement | null) {
  if (!element || reduceMotion()) return;
  animate(element.querySelectorAll("[data-word]"), {
    opacity: [0, 1], translateY: [5, 0], duration: 420,
    delay: stagger(32, { start: 70 }), ease: "out(3)"
  });
}

export function pathwayExit(element: HTMLElement | null) {
  if (!element || reduceMotion()) return;
  animate(element, { opacity: [1, 0], translateY: [0, -12], duration: 180, ease: "in(2)" });
}

export function pathwayEnter(element: HTMLElement | null) {
  if (!element || reduceMotion()) return;
  animate(element, { opacity: [0, 1], translateY: [12, 0], duration: 360, ease: "out(3)" });
}

/** Tuning constants for the physical writing rule (POC.md §2). */
export const WRITING_ANCHOR = 0.3;
export const OPACITY_ACTIVE = 1;
export const OPACITY_PREVIOUS = 0.82;
export const OPACITY_DISTANT = 0.68;

/** Resting opacity for a paragraph `distance` paragraphs behind the caret. */
export function paragraphOpacity(distance: number) {
  if (distance <= 0) return OPACITY_ACTIVE;
  return distance === 1 ? OPACITY_PREVIOUS : OPACITY_DISTANT;
}

/**
 * Hold the live line at a fixed altitude. `caretOffset` is the distance from
 * the paragraph's top down to the line being written, so a growing paragraph
 * keeps the caret in place instead of pushing it toward the bottom.
 */
let writingScroll: JSAnimation | null = null;
export function stopWritingScroll() { writingScroll?.cancel(); writingScroll = null; }

export function focusParagraph(element: HTMLElement | null, caretOffset = 0) {
  stopWritingScroll();
  if (!element) return;
  const scroller = document.scrollingElement as HTMLElement | null;
  if (!scroller) return;
  const target = Math.max(0, window.scrollY + element.getBoundingClientRect().top + caretOffset - window.innerHeight * WRITING_ANCHOR);
  if (Math.abs(target - window.scrollY) < 1) return;
  // The position is the rule; only the travel to it is motion.
  if (reduceMotion()) { scroller.scrollTop = target; return; }
  writingScroll = animate(scroller, { scrollTop: target, duration: 500, ease: "inOut(3)" });
}

/**
 * Let older writing recede into the page. Mirrors the resting values the
 * `is-past` / `is-distant` classes declare, so reduced motion holds the same
 * hierarchy without animating; the active paragraph is restored to full ink.
 */
export function quietParagraph(paragraphs: { element: HTMLElement; distance: number }[]) {
  if (reduceMotion()) return;
  paragraphs.forEach(({ element, distance }) => animate(element, {
    opacity: paragraphOpacity(distance), duration: 320, ease: "out(2)"
  }));
}

export function enterWritingMode(element: HTMLElement | null) {
  if (!element || reduceMotion()) return;
  animate(element, { opacity: [0, 1], scale: [0.985, 1], duration: 560, ease: "out(4)" });
}

/** How long a gap between keystrokes counts as deliberate rather than sustained
 * typing. A burst keeps a small pulse but never queues motion. */
const DELIBERATE_GAP = 320;
let impulse: JSAnimation | null = null;
let lastStrike = 0;

/** Different keys do different mechanical work (typewriting-feel.md §5). */
export type Strike = "letter" | "punctuation" | "space" | "erase";
const STRIKE: Record<Strike, { travel: number; dip: number; duration: number }> = {
  letter: { travel: -1.4, dip: 0.7, duration: 120 },
  punctuation: { travel: -1.8, dip: 1, duration: 105 },
  space: { travel: -0.8, dip: 0.3, duration: 125 },
  erase: { travel: 1.2, dip: 0.5, duration: 135 },
};

/** Classify a key the way the mechanism would, not the way the editor does. */
export function strikeOf(key: string): Strike {
  if (key === "Backspace" || key === "Delete") return "erase";
  if (key === " " || key === "Spacebar") return "space";
  if (key.length === 1 && !/[\p{L}\p{N}]/u.test(key)) return "punctuation";
  return "letter";
}

/**
 * The active line takes a short horizontal step with a small downward impact.
 * Erase steps the other way. The larger sound-matched response stays local to
 * the line and fades down while typing quickly.
 *
 * Text is committed before this is called: the impulse observes typing, it
 * never gates it.
 */
export function paperImpulse(element: HTMLElement | null, strike: Strike = "letter") {
  if (!element || reduceMotion()) return;
  const now = performance.now();
  const weight = Math.max(0.45, Math.min(1, (now - lastStrike) / DELIBERATE_GAP));
  lastStrike = now;
  const { travel, dip, duration } = STRIKE[strike];
  // Replace rather than queue, so fast typing cannot build a backlog.
  impulse?.cancel();
  impulse = animate(element, {
    translateX: [0, travel * weight, 0],
    translateY: [0, dip * weight, 0],
    duration,
    ease: "out(3)",
  });
}

let carriage: JSAnimation | null = null;
let surface: JSAnimation | null = null;

/**
 * Return is the one keystroke that moves the sheet rather than the line. The
 * short rightward travel accompanies the recorded carriage sound while the
 * new paragraph and writing-position scroll remain native and immediate.
 */
export function carriageReturn(paper: HTMLElement | null) {
  if (!paper || reduceMotion()) return;
  carriage?.cancel(); surface?.cancel();
  carriage = animate(paper, { translateX: [0, 8, 0], duration: 340, ease: "out(3)" });
  surface = animate(paper, { "--sheet-lift": [0, 1, 0], duration: 380, ease: "out(3)" });
}

// Manual guide marks use a short stepped overstrike; text never moves.
export function guideOverstrike(element: HTMLElement | null, marked: boolean) {
  if (!element) return;
  if (reduceMotion()) { element.style.transform = `scaleX(${marked ? 1 : 0})`; return; }
  animate(element, { scaleX: marked ? [0, 1] : [1, 0], duration: 240, ease: steps(8) });
}

export function recedeGuides(element: HTMLElement | null, hasWriting: boolean) {
  if (!element) return;
  const opacity = hasWriting ? .68 : 1;
  if (reduceMotion()) { element.style.opacity = String(opacity); return; }
  const motion = animate(element, { opacity, duration: 240, ease: "linear" });
  return () => { motion.cancel(); };
}

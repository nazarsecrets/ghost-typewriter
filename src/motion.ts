import { animate, stagger, type JSAnimation } from "animejs";

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
export const OPACITY_PREVIOUS = 0.72;
export const OPACITY_DISTANT = 0.42;

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
 * typing. The impulse shrinks as typing speeds up so a burst reads as rhythm
 * rather than a queue of identical nudges (typewriting-feel.md §7). */
const DELIBERATE_GAP = 320;
let impulse: JSAnimation | null = null;
let lastStrike = 0;

/**
 * Stage 3 of a keystroke: the writing surface answers the impact
 * (typewriting-feel.md §3). Deliberately smaller than the 0.5-1px the document
 * suggests — the author has already rejected writing-time motion once — and
 * local to the active line, never the application.
 *
 * Text is committed before this is called: the impulse observes typing, it
 * never gates it.
 */
export function paperImpulse(element: HTMLElement | null) {
  if (!element || reduceMotion()) return;
  const now = performance.now();
  const weight = Math.min(1, (now - lastStrike) / DELIBERATE_GAP);
  lastStrike = now;
  // Replace rather than queue, so fast typing cannot build a backlog.
  impulse?.cancel();
  impulse = animate(element, {
    translateY: [0, 0.25 + 0.35 * weight, 0],
    duration: 80 + 40 * weight,
    ease: "out(2)",
  });
}

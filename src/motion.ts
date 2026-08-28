import { animate, stagger } from "animejs";

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

export function focusParagraph(element: HTMLElement | null) {
  if (!element || reduceMotion()) return;
  const scroller = document.scrollingElement as HTMLElement | null;
  if (!scroller) return;
  const target = window.scrollY + element.getBoundingClientRect().top - window.innerHeight * 0.42;
  animate(scroller, { scrollTop: Math.max(0, target), duration: 500, ease: "inOut(3)" });
}

export function quietParagraph(elements: HTMLElement[]) {
  if (reduceMotion()) return;
  elements.forEach((element, index) => animate(element, {
    opacity: Math.max(0.72, 0.9 - index * 0.08), duration: 320, ease: "out(2)"
  }));
}

export function enterWritingMode(element: HTMLElement | null) {
  if (!element || reduceMotion()) return;
  animate(element, { opacity: [0, 1], scale: [0.985, 1], duration: 560, ease: "out(4)" });
}

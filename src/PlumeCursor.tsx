import { useEffect, useRef } from "react";
import { animate, type JSAnimation } from "animejs";
import { measureCaret } from "./caret";

export type PlumeOrigin = { x: number; y: number; width: number; height: number; text: string; font: string; letterSpacing: string; id: number };
type Props = { active: boolean; busy: boolean; origin: PlumeOrigin | null };

/** One visual cursor for the whole app. Native editing, selection, and IME remain
 * in the textarea; continuous positioning never causes React renders. */
export function PlumeCursor({ active, busy, origin }: Props) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const flightRef = useRef<HTMLSpanElement>(null);
  const nibRef = useRef<SVGGElement>(null);
  const echoRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<SVGPathElement>(null);
  const inkSvgRef = useRef<SVGSVGElement>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const previousBusy = useRef(false);
  const usedOrigin = useRef<number | null>(null);

  useEffect(() => {
    const root = rootRef.current!, flight = flightRef.current!, nib = nibRef.current!;
    const echo = echoRef.current!, ink = inkRef.current!, inkSvg = inkSvgRef.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    let editor: HTMLTextAreaElement | null = null;
    let composing = false, frame = 0, idleTimer = 0;
    let reaction: JSAnimation | null = null, journey: JSAnimation | null = null;
    let echoAnimation: JSAnimation | null = null, inkAnimation: JSAnimation | null = null;
    let returning = previousBusy.current && !busy;
    previousBusy.current = busy;
    const allowed = () => !reduced.matches && !forced.matches && !document.hidden;
    const cancelReaction = () => {
      reaction?.cancel(); reaction = null;
      window.clearTimeout(idleTimer);
      nib.style.transform = "";
    };
    const endJourney = () => {
      journey?.cancel(); journey = null;
      echoAnimation?.cancel(); inkAnimation?.cancel();
      flight.style.transform = ""; flight.style.opacity = "1";
      echo.style.visibility = "hidden"; inkSvg.style.visibility = "hidden";
    };
    const hide = () => {
      editor?.classList.remove("has-plume");
      root.style.visibility = "hidden";
      root.dataset.state = "hidden";
      cancelReaction(); endJourney();
    };
    const scheduleIdle = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (root.style.visibility !== "visible" || !allowed() || busy) return;
        reaction?.cancel();
        root.dataset.state = "thinking";
        // One barely perceptible breath, then complete stillness. Never loops.
        reaction = animate(nib, { translateY: [0, -0.6, 0], rotate: [0, -1, 0], duration: 560, ease: "inOutSine", onComplete: () => { root.dataset.state = "resting"; } });
      }, 1400);
    };
    const sync = () => {
      frame = 0;
      if (busy && allowed()) { editor?.classList.remove("has-plume"); return; }
      if (!active || !allowed() || composing) { hide(); return; }
      const focused = document.activeElement;
      const next = focused instanceof HTMLTextAreaElement && focused.classList.contains("manuscript-paragraph") ? focused : null;
      if (editor !== next) { editor?.classList.remove("has-plume"); editor = next; }
      if (!editor || editor.selectionStart !== editor.selectionEnd) { hide(); return; }
      const caret = measureCaret(editor);
      const point = { x: caret.x, y: caret.y + caret.height };
      const rect = editor.getBoundingClientRect();
      if (point.y < 64 || point.y > innerHeight || point.x < rect.left - 1 || point.x > rect.right + 1) { hide(); return; }
      lastPoint.current = point;
      root.style.transform = `translate3d(${point.x - 3}px, ${point.y - 21}px, 0)`;
      root.dataset.x = String(point.x); root.dataset.y = String(point.y);
      const wasHidden = root.style.visibility !== "visible";
      root.style.visibility = "visible";
      editor.classList.add("has-plume");
      if (origin && usedOrigin.current !== origin.id) {
        usedOrigin.current = origin.id;
        endJourney(); cancelReaction();
        root.dataset.state = "arriving";
        echo.style.visibility = "visible"; inkSvg.style.visibility = "visible";
        ink.style.strokeDasharray = "1"; ink.style.strokeDashoffset = "1";
        echoAnimation = animate(echo, { opacity: [1, 0], translateY: [0, -8], duration: 220, ease: "out(2)" });
        inkAnimation = animate(ink, { strokeDashoffset: [1, 0], opacity: [0, 0.3, 0], duration: 420, ease: "out(2)" });
        journey = animate(flight, {
          translateX: [origin.x - point.x, 0], translateY: [origin.y + origin.height - point.y, 0], opacity: [0.6, 1],
          duration: 420, ease: "out(3)", onComplete: () => { endJourney(); root.dataset.state = "resting"; scheduleIdle(); },
        });
      } else if (returning || wasHidden) {
        returning = false;
        root.dataset.state = "returning";
        journey = animate(flight, { translateY: [-5, 0], opacity: [0, 1], duration: 220, ease: "out(2)", onComplete: () => { root.dataset.state = "resting"; } });
        scheduleIdle();
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const input = (event: Event) => {
      if (!(event.target instanceof HTMLTextAreaElement) || !event.target.classList.contains("manuscript-paragraph")) return;
      schedule();
      if (!allowed() || composing || busy) return;
      endJourney(); cancelReaction();
      if (origin) usedOrigin.current = origin.id;
      root.dataset.state = "writing";
      reaction = animate(nib, { translateY: [0, -1.4, 0], rotate: [0, -3, 0], duration: 130, ease: "out(2)", onComplete: () => { root.dataset.state = "resting"; } });
      scheduleIdle();
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLTextAreaElement && event.target.classList.contains("manuscript-paragraph")) {
        endJourney();
        if (origin) usedOrigin.current = origin.id;
        schedule();
      }
    };
    const compositionStart = () => { composing = true; hide(); };
    const compositionEnd = () => { composing = false; schedule(); };
    const blur = () => hide();
    const preferences = () => { hide(); schedule(); };
    const observer = new ResizeObserver(schedule);
    document.querySelectorAll(".manuscript-paragraph").forEach((element) => observer.observe(element));
    document.addEventListener("focusin", schedule);
    document.addEventListener("focusout", schedule);
    document.addEventListener("selectionchange", schedule);
    document.addEventListener("input", input);
    document.addEventListener("keydown", keydown);
    document.addEventListener("compositionstart", compositionStart);
    document.addEventListener("compositionend", compositionEnd);
    document.addEventListener("scroll", schedule, true);
    document.addEventListener("visibilitychange", preferences);
    window.addEventListener("resize", schedule);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    reduced.addEventListener("change", preferences); forced.addEventListener("change", preferences);
    if (busy && allowed() && lastPoint.current) {
      root.style.visibility = "visible"; root.dataset.state = "departing";
      journey = animate(flight, { translateY: [0, -9], opacity: [1, 0], duration: 240, ease: "in(2)", onComplete: () => { root.style.visibility = "hidden"; root.dataset.state = "responding"; } });
    } else schedule();
    return () => {
      cancelAnimationFrame(frame); hide(); observer.disconnect();
      document.removeEventListener("focusin", schedule); document.removeEventListener("focusout", schedule);
      document.removeEventListener("selectionchange", schedule); document.removeEventListener("input", input);
      document.removeEventListener("keydown", keydown); document.removeEventListener("compositionstart", compositionStart);
      document.removeEventListener("compositionend", compositionEnd); document.removeEventListener("scroll", schedule, true);
      document.removeEventListener("visibilitychange", preferences); window.removeEventListener("resize", schedule);
      window.removeEventListener("blur", blur); window.removeEventListener("focus", schedule);
      window.visualViewport?.removeEventListener("resize", schedule); window.visualViewport?.removeEventListener("scroll", schedule);
      reduced.removeEventListener("change", preferences); forced.removeEventListener("change", preferences);
    };
  }, [active, busy, origin]);

  return <>
    <span className="plume-cursor" ref={rootRef} aria-hidden="true" data-state="hidden">
      <span className="plume-flight" ref={flightRef}>
        <svg width="22" height="24" viewBox="0 0 22 24" focusable="false">
          <g ref={nibRef} fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21 16 4M7 16C6 10 10 4 19 2c0 8-4 13-10 14M10 12l5-1" />
          </g>
        </svg>
      </span>
    </span>
    <div className="plume-thought" ref={echoRef} aria-hidden="true" style={origin ? { left: origin.x, top: origin.y, width: origin.width, font: origin.font, letterSpacing: origin.letterSpacing } : undefined}>{origin?.text}</div>
    <svg className="plume-ink" ref={inkSvgRef} aria-hidden="true" focusable="false" style={origin ? { left: origin.x, top: origin.y + origin.height + 3 } : undefined} width="88" height="5" viewBox="0 0 88 5">
      <path ref={inkRef} d="M1 3Q40 1 86 2" pathLength="1" fill="none" stroke="currentColor" strokeWidth="0.7" />
    </svg>
  </>;
}

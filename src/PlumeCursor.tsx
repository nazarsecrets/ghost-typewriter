import { useEffect, useRef } from "react";
import { animate, type JSAnimation } from "animejs";
import { measureCaret } from "./caret";

export type PlumeOrigin = { x: number; y: number; width: number; height: number; text: string; font: string; letterSpacing: string; id: number };
type Props = { active: boolean; busy: boolean; origin: PlumeOrigin | null };

/** The quill is drawn in a 34x56 box with its nib tip at NIB. Screen position,
 * every rotation, the ink contact and the transform origins are all expressed
 * from that point, so the plume reads as resting on the page, not beside it. */
const VIEW = { width: 34, height: 56 };
const NIB = { x: 3, y: 55 };
const DESKTOP_HEIGHT = 60;
const COMPACT_HEIGHT = 46;

export function PlumeCursor({ active, busy, origin }: Props) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const flightRef = useRef<HTMLSpanElement>(null);
  const bodyRef = useRef<HTMLSpanElement>(null);
  const echoRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const trailSvgRef = useRef<SVGSVGElement>(null);
  const inkwellRef = useRef<HTMLSpanElement>(null);
  const inkwellMouthRef = useRef<SVGCircleElement>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const previousBusy = useRef(false);
  const wasActive = useRef(false);
  const usedOrigin = useRef<number | null>(null);

  useEffect(() => {
    const root = rootRef.current!, flight = flightRef.current!, body = bodyRef.current!;
    const echo = echoRef.current!;
    const trail = trailRef.current!, trailSvg = trailSvgRef.current!;
    const inkwell = inkwellRef.current!, inkwellMouth = inkwellMouthRef.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    let editor: HTMLTextAreaElement | null = null;
    let composing = false, frame = 0;
    let reaction: JSAnimation | null = null;
    let journey: JSAnimation | null = null;
    let echoAnimation: JSAnimation | null = null, trailAnimation: JSAnimation | null = null;
    let inkwellAnimation: JSAnimation | null = null;
    let returning = previousBusy.current && !busy;
    previousBusy.current = busy;
    const enteringSession = active && !wasActive.current;
    const leavingSession = !active && wasActive.current;
    wasActive.current = active;
    let lifting = enteringSession;

    const allowed = () => !reduced.matches && !forced.matches && !document.hidden;

    /** The plume is sized to the viewport, so the geometry is read, never cached. */
    const metrics = () => {
      const height = innerWidth <= 760 ? COMPACT_HEIGHT : DESKTOP_HEIGHT;
      const scale = height / VIEW.height;
      return { height, width: VIEW.width * scale, nib: { x: NIB.x * scale, y: NIB.y * scale } };
    };

    const inkwellPoint = () => {
      const rect = inkwellMouth.getBoundingClientRect();
      if (!rect.width || getComputedStyle(inkwell).display === "none") return null;
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };
    const showInkwell = (visible: boolean) => {
      inkwellAnimation?.cancel();
      if (visible) inkwell.style.visibility = "visible";
      inkwellAnimation = animate(inkwell, {
        opacity: visible ? [0, 0.85] : [0.85, 0], duration: visible ? 320 : 420,
        ease: "out(2)", onComplete: () => { if (!visible) inkwell.style.visibility = "hidden"; },
      });
    };

    const cancelReaction = () => {
      reaction?.cancel(); reaction = null;
      body.style.transform = "";
    };
    const endJourney = () => {
      journey?.cancel(); journey = null;
      echoAnimation?.cancel(); trailAnimation?.cancel();
      flight.style.transform = ""; flight.style.opacity = "1";
      echo.style.visibility = "hidden"; trailSvg.style.visibility = "hidden";
    };
    const hide = () => {
      editor?.classList.remove("has-plume");
      root.style.visibility = "hidden";
      root.dataset.state = "hidden";
      cancelReaction(); endJourney();
      inkwellAnimation?.cancel(); inkwell.style.visibility = "hidden";
    };

    const sync = () => {
      frame = 0;
      if (busy && allowed()) { editor?.classList.remove("has-plume"); return; }
      if (leavingSession && allowed() && journey && !journey.completed) return;
      if (!active || !allowed() || composing) { hide(); return; }
      const focused = document.activeElement;
      const next = focused instanceof HTMLTextAreaElement && focused.classList.contains("manuscript-paragraph") ? focused : null;
      if (editor !== next) { editor?.classList.remove("has-plume"); editor = next; }
      if (!editor || editor.selectionStart !== editor.selectionEnd) { hide(); return; }
      const caret = measureCaret(editor);
      // The nib touches the baseline of the line just written, not the line box.
      const point = { x: caret.x, y: caret.y + caret.height / 2 + caret.fontSize * 0.36 };
      const rect = editor.getBoundingClientRect();
      const { height, width, nib } = metrics();
      // The feather rises above the nib: keep the whole quill clear of the header.
      if (point.y < 64 + height || point.y > innerHeight || point.x < rect.left - 1 || point.x > rect.right + 1) { hide(); return; }
      lastPoint.current = point;
      root.style.width = `${width}px`; root.style.height = `${height}px`;
      const nibOrigin = `${nib.x}px ${nib.y}px`;
      flight.style.transformOrigin = nibOrigin; body.style.transformOrigin = nibOrigin;
      root.style.transform = `translate3d(${point.x - nib.x}px, ${point.y - nib.y}px, 0)`;
      root.dataset.x = String(point.x); root.dataset.y = String(point.y);
      // The native caret remains the only writing cursor. Show the quill only
      // for an explicit transition; scrolling, selection, and edits never summon it.
      const pendingOrigin = origin && usedOrigin.current !== origin.id;
      if (!pendingOrigin && !lifting && !returning && (!journey || journey.completed)) {
        hide(); return;
      }
      root.style.visibility = "visible";

      if (origin && usedOrigin.current !== origin.id) {
        // Reflection to manuscript: thought, then ink, then writing.
        usedOrigin.current = origin.id;
        lifting = false;
        endJourney(); cancelReaction();
        root.dataset.state = "arriving";
        const from = { x: origin.x, y: origin.y + origin.height };
        echo.style.visibility = "visible";
        trailSvg.style.visibility = "visible";
        const bow = Math.max(60, Math.abs(point.y - from.y) * 0.32);
        trail.setAttribute("d", `M${from.x} ${from.y} C ${from.x + bow * 0.5} ${from.y + bow}, ${point.x - bow} ${point.y - bow * 0.7}, ${point.x} ${point.y}`);
        trail.style.strokeDasharray = "1"; trail.style.strokeDashoffset = "1";
        echoAnimation = animate(echo, { opacity: [1, 0], translateY: [0, -8], duration: 260, ease: "out(2)" });
        trailAnimation = animate(trail, {
          strokeDashoffset: [1, 0], opacity: [0.34, 0.34, 0], duration: 760, ease: "out(2)",
          onComplete: () => { trailSvg.style.visibility = "hidden"; },
        });
        journey = animate(flight, {
          translateX: [from.x - point.x, 0], translateY: [from.y - point.y, 0],
          rotate: [-9, 0], opacity: [0.55, 1], duration: 520, ease: "out(3)",
          onComplete: () => {
            hide();
          },
        });
      } else if (lifting) {
        // The session begins: the plume lifts out of the inkwell and travels over.
        lifting = false;
        const well = inkwellPoint();
        endJourney(); cancelReaction();
        if (!well) { hide(); return; }
        root.dataset.state = "lifting";
        showInkwell(true);
        journey = animate(flight, {
          translateX: [well.x - point.x, well.x - point.x, 0],
          translateY: [well.y - point.y, well.y - point.y - 12, 0],
          rotate: [-26, -18, 0], opacity: [0, 1, 1],
          duration: 760, ease: "out(3)",
          onComplete: () => {
            hide(); showInkwell(false);
          },
        });
      } else if (returning) {
        // The pen handed back: it returns from the direction it left.
        returning = false;
        root.dataset.state = "returning";
        journey = animate(flight, {
          translateX: [16, 0], translateY: [-13, 0], rotate: [-7, 0], opacity: [0, 1],
          duration: 380, ease: "out(3)",
          onComplete: () => {
            hide();
          },
        });
      }

    };

    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const input = (event: Event) => {
      if (!(event.target instanceof HTMLTextAreaElement) || !event.target.classList.contains("manuscript-paragraph")) return;
      // Input wins immediately over any transition; never delay or decorate it.
      lifting = false; returning = false;
      if (origin) usedOrigin.current = origin.id;
      hide();
      schedule();
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLTextAreaElement && event.target.classList.contains("manuscript-paragraph")) {
        lifting = false; returning = false;
        if (origin) usedOrigin.current = origin.id;
        hide(); schedule();
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
      // Ghostwriter takes over: the nib lifts off the page and the plume withdraws,
      // hovering near the manuscript rather than leaving it.
      root.style.visibility = "visible"; root.dataset.state = "departing";
      cancelReaction();
      reaction = animate(body, { translateY: [0, -4], rotate: [0, 7], duration: 300, ease: "out(2)" });
      journey = animate(flight, {
        translateX: [0, 16], translateY: [0, -13], opacity: [1, 0.12], duration: 360, ease: "in(2)",
        onComplete: () => { root.style.visibility = "hidden"; root.dataset.state = "responding"; },
      });
    } else if (leavingSession && allowed() && lastPoint.current) {
      // The session ends: the plume travels back and settles into the inkwell.
      const point = lastPoint.current;
      const well = inkwellPoint();
      if (!well) hide();
      else {
        const { width, height, nib } = metrics();
        root.style.width = `${width}px`; root.style.height = `${height}px`;
        root.style.transform = `translate3d(${point.x - nib.x}px, ${point.y - nib.y}px, 0)`;
        root.style.visibility = "visible"; root.dataset.state = "stowing";
        cancelReaction();
        showInkwell(true);
        journey = animate(flight, {
          translateX: [0, well.x - point.x], translateY: [-10, well.y - point.y],
          rotate: [0, -26], opacity: [1, 0.25], duration: 720, ease: "inOut(3)",
          onComplete: () => { hide(); showInkwell(false); },
        });
      }
    } else schedule();

    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      hide();
      inkwellAnimation?.cancel();
      inkwell.style.visibility = "hidden";
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
        <span className="plume-body" ref={bodyRef}>
          <svg width="100%" height="100%" viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} preserveAspectRatio="xMidYMid meet" focusable="false">
            {/* Pressure on paper, under the nib tip. */}
            <ellipse className="plume-contact" cx={NIB.x + 0.3} cy={NIB.y - 0.4} rx="1.7" ry="1.1" fill="currentColor" opacity="0" />
            {/* Feather body: both vanes and their barbs move as one. Fullness sits
                high on the feather and the tip is soft, not pointed. */}
            <g className="plume-feather">
              <g className="plume-vane plume-vane-wide">
                <path d="M27.19 3.20C26.91 3.33 26.03 3.68 25.52 3.95C25.00 4.22 24.56 4.52 24.11 4.82C23.66 5.13 23.18 5.41 22.83 5.77C22.48 6.12 22.37 6.58 22.01 6.93C21.64 7.27 21.05 7.50 20.63 7.82C20.21 8.13 19.80 8.45 19.49 8.82C19.18 9.20 19.03 9.64 18.78 10.04C18.52 10.44 18.23 10.82 17.98 11.22C17.73 11.62 17.54 12.05 17.25 12.43C16.96 12.81 16.54 13.13 16.24 13.50C15.93 13.87 15.65 14.25 15.42 14.67C15.20 15.08 15.10 15.55 14.91 15.98C14.72 16.41 14.48 16.82 14.29 17.25C14.11 17.68 14.00 18.15 13.80 18.58C13.60 19.00 13.32 19.38 13.10 19.80C12.88 20.21 12.67 20.63 12.50 21.07C12.34 21.52 12.28 22.01 12.12 22.45C11.97 22.90 11.73 23.31 11.58 23.76C11.43 24.20 11.35 24.69 11.21 25.14C11.06 25.59 10.88 26.02 10.74 26.48C10.59 26.93 10.44 27.38 10.35 27.85C10.26 28.33 10.31 28.88 10.20 29.35C10.09 29.82 9.82 30.21 9.68 30.66C9.54 31.12 9.44 31.59 9.35 32.07C9.26 32.55 9.20 33.04 9.15 33.54C9.10 34.04 9.05 34.53 9.05 35.05C9.05 35.58 9.20 36.18 9.16 36.68C9.11 37.18 8.79 37.54 8.78 38.06C8.77 38.57 8.99 39.21 9.10 39.78C9.20 40.36 9.35 41.21 9.40 41.50L28.00 3.60C27.24 4.79 24.90 8.35 23.42 10.76C21.93 13.16 20.46 15.58 19.11 18.05C17.76 20.52 16.48 23.03 15.31 25.59C14.14 28.15 13.08 30.76 12.09 33.41C11.11 36.07 9.85 40.15 9.40 41.50Z"
                  fill="currentColor" fillOpacity="0.055" stroke="currentColor" strokeWidth="0.3" strokeLinejoin="round" strokeLinecap="round" />
                <g className="plume-barbs" strokeWidth="0.22" stroke="currentColor" fill="none" strokeLinecap="round" opacity="0.58">
                  <path d="M9.79 38.87Q9.26 38.73 8.47 39.11" />
                  <path d="M10.66 36.24Q9.91 36.04 8.83 36.51" />
                  <path d="M11.59 33.64Q10.45 33.31 8.84 33.94" />
                  <path d="M12.56 31.06Q11.27 30.68 9.45 31.38" />
                  <path d="M13.59 28.51Q12.15 28.08 10.13 28.84" />
                  <path d="M14.69 25.99Q13.04 25.50 10.74 26.34" />
                  <path d="M15.84 23.50Q14.11 22.98 11.70 23.86" />
                  <path d="M17.06 21.04Q15.26 20.50 12.75 21.41" />
                  <path d="M18.34 18.61Q16.44 18.04 13.79 18.99" />
                  <path d="M19.68 16.21Q17.76 15.64 15.10 16.59" />
                  <path d="M21.07 13.84Q19.25 13.29 16.71 14.21" />
                  <path d="M22.50 11.48Q20.75 10.96 18.30 11.84" />
                  <path d="M23.96 9.14Q22.46 8.70 20.37 9.48" />
                  <path d="M25.45 6.81Q24.21 6.46 22.48 7.13" />
                  <path d="M26.95 4.49Q26.28 4.32 25.32 4.75" />
                </g>
              </g>
              <g className="plume-vane plume-vane-narrow">
                <path d="M28.54 3.86C28.45 4.08 28.22 4.75 28.03 5.18C27.84 5.61 27.56 6.00 27.40 6.44C27.23 6.88 27.21 7.39 27.04 7.83C26.88 8.27 26.61 8.67 26.39 9.08C26.16 9.49 25.93 9.90 25.69 10.31C25.46 10.71 25.18 11.10 24.99 11.53C24.80 11.96 24.68 12.42 24.54 12.87C24.39 13.33 24.34 13.82 24.13 14.24C23.92 14.66 23.54 15.00 23.28 15.39C23.02 15.79 22.81 16.20 22.57 16.61C22.34 17.02 22.09 17.42 21.88 17.84C21.67 18.26 21.48 18.69 21.30 19.13C21.13 19.56 21.04 20.04 20.81 20.45C20.59 20.87 20.22 21.21 19.97 21.60C19.71 22.00 19.52 22.43 19.30 22.85C19.09 23.26 18.88 23.68 18.67 24.10C18.46 24.53 18.24 24.94 18.05 25.37C17.86 25.80 17.75 26.27 17.52 26.68C17.29 27.08 16.91 27.42 16.66 27.82C16.41 28.22 16.21 28.64 16.03 29.08C15.84 29.51 15.73 29.98 15.56 30.42C15.39 30.85 15.18 31.27 14.99 31.70C14.80 32.13 14.68 32.60 14.44 33.00C14.19 33.40 13.80 33.73 13.53 34.12C13.26 34.51 13.01 34.91 12.80 35.33C12.60 35.75 12.48 36.22 12.31 36.66C12.13 37.09 11.93 37.52 11.75 37.95C11.56 38.38 11.47 38.86 11.20 39.25C10.93 39.64 10.43 39.91 10.12 40.29C9.82 40.66 9.52 41.30 9.40 41.50L28.00 3.60C27.24 4.79 24.90 8.35 23.42 10.76C21.93 13.16 20.46 15.58 19.11 18.05C17.76 20.52 16.48 23.03 15.31 25.59C14.14 28.15 13.08 30.76 12.09 33.41C11.11 36.07 9.85 40.15 9.40 41.50Z"
                  fill="currentColor" fillOpacity="0.035" stroke="currentColor" strokeWidth="0.26" strokeLinejoin="round" strokeLinecap="round" />
                <g className="plume-barbs" strokeWidth="0.2" stroke="currentColor" fill="none" strokeLinecap="round" opacity="0.4">
                  <path d="M10.51 39.22Q10.65 39.36 10.66 39.77" />
                  <path d="M11.63 35.88Q11.95 36.14 12.06 36.82" />
                  <path d="M12.83 32.58Q13.36 32.99 13.60 33.99" />
                  <path d="M14.12 29.32Q14.76 29.81 15.06 30.98" />
                  <path d="M15.51 26.11Q16.20 26.63 16.53 27.88" />
                  <path d="M17.00 22.95Q17.76 23.52 18.13 24.88" />
                  <path d="M18.59 19.84Q19.36 20.42 19.73 21.79" />
                  <path d="M20.28 16.78Q21.01 17.33 21.36 18.65" />
                  <path d="M22.04 13.76Q22.75 14.28 23.08 15.56" />
                  <path d="M23.88 10.77Q24.40 11.17 24.63 12.17" />
                  <path d="M25.76 7.80Q26.14 8.11 26.29 8.89" />
                  <path d="M27.66 4.85Q27.81 4.99 27.83 5.40" />
                </g>
              </g>
            </g>
            {/* Shaft: bare along the calamus, curving with the feather above it. */}
            <g className="plume-shaft">
              <path d="M5.90 48.90C7.30 46.30 8.60 43.90 9.40 41.50C9.85 40.15 11.11 36.07 12.09 33.41C13.08 30.76 14.14 28.15 15.31 25.59C16.48 23.03 17.83 20.40 19.11 18.05C20.39 15.70 21.79 13.41 22.97 11.48C24.14 9.54 25.62 7.29 26.15 6.45"
                fill="none" stroke="currentColor" strokeWidth="0.42" strokeLinecap="round" />
            </g>
            {/* The nib is the anchor: it never moves against the rest of the quill. */}
            <g className="plume-nib-group">
              <path className="plume-nib" d="M3 55L5.21 48.31L6.75 49.03Z" fill="currentColor" />
              <path className="plume-nib-slit" d="M3.6 53.2L5.4 49.6" stroke="var(--sheet)" strokeWidth="0.24" strokeLinecap="round" opacity="0.5" />
            </g>
          </svg>
        </span>
      </span>
    </span>
    {/* The plume's resting place: present only while it leaves or returns. */}
    <span className="plume-inkwell" ref={inkwellRef} aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 34 34" focusable="false">
        {/* Squat glass bottle: rounded shoulders, a short neck and its collar. */}
        <path d="M7 17.5C7 15.3 8.4 14.2 9.6 13.4H24.4C25.6 14.2 27 15.3 27 17.5V28C27 30.5 25 32.5 22.5 32.5H11.5C9 32.5 7 30.5 7 28Z"
          fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
        {/* Ink sitting heavy in the base. */}
        <path className="plume-inkwell-ink" d="M7.2 22.5H26.8V28C26.8 30.4 24.9 32.3 22.5 32.3H11.5C9.1 32.3 7.2 30.4 7.2 28Z"
          fill="currentColor" fillOpacity="0.72" />
        <path d="M9.6 13.4C9.6 12.2 10.1 11.6 11 11.2H23C23.9 11.6 24.4 12.2 24.4 13.4"
          fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
        <rect x="10.2" y="9.4" width="13.6" height="2.4" rx="1.2" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="0.8" />
        <ellipse className="plume-inkwell-mouth" cx="17" cy="9.6" rx="4.6" ry="1.5" fill="currentColor" fillOpacity="0.62" stroke="currentColor" strokeWidth="0.6" />
        <circle ref={inkwellMouthRef} cx="17" cy="9.2" r="0.5" fill="none" />
      </svg>
    </span>
    <div className="plume-thought" ref={echoRef} aria-hidden="true" style={origin ? { left: origin.x, top: origin.y, width: origin.width, font: origin.font, letterSpacing: origin.letterSpacing } : undefined}>{origin?.text}</div>
    <svg className="plume-trail" ref={trailSvgRef} aria-hidden="true" focusable="false">
      <path ref={trailRef} pathLength="1" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  </>;
}

/** A textarea mirror measures the real insertion point, including mid-line edits.
 * Reused per element: no hidden DOM accumulation and no writes to the manuscript.
 */
const mirrors = new WeakMap<HTMLTextAreaElement, HTMLDivElement>();
const TYPOGRAPHY = ["boxSizing", "fontFamily", "fontSize", "fontWeight", "fontStyle", "fontVariant", "lineHeight", "letterSpacing", "wordSpacing", "textIndent", "textTransform", "textAlign", "direction", "tabSize", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"] as const;

export function measureCaret(element: HTMLTextAreaElement) {
  let mirror = mirrors.get(element);
  if (!mirror) {
    mirror = document.createElement("div");
    mirror.setAttribute("aria-hidden", "true");
    mirrors.set(element, mirror);
  }
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  // Read layout together, then style the offscreen mirror before one measurement.
  const width = element.clientWidth + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
  const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
  mirror.style.cssText = "position:fixed;left:-10000px;top:0;visibility:hidden;pointer-events:none;white-space:pre-wrap;overflow-wrap:break-word;word-break:normal;overflow:hidden;border-style:solid;";
  for (const property of TYPOGRAPHY) mirror.style[property] = style[property];
  mirror.style.width = `${width}px`;
  const prefix = document.createTextNode(element.value.slice(0, element.selectionStart));
  const marker = document.createElement("span");
  // Include the suffix so wrapping matches the real text at a word boundary.
  marker.textContent = element.value.slice(element.selectionStart) || "\u200b";
  mirror.replaceChildren(prefix, marker);
  document.body.append(mirror);
  const range = document.createRange();
  range.setStart(marker.firstChild!, 0);
  range.setEnd(marker.firstChild!, Math.min(1, marker.textContent.length));
  const mark = range.getBoundingClientRect();
  const box = mirror.getBoundingClientRect();
  const offsetY = mark.top - box.top;
  const offsetX = (style.direction === "rtl" ? mark.right : mark.left) - box.left;
  mirror.remove();
  return { x: rect.left + offsetX - element.scrollLeft, y: rect.top + offsetY - element.scrollTop, offsetY, lineHeight, height: mark.height || lineHeight };
}

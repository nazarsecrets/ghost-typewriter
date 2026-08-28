import { createHash } from "node:crypto";

export function hash(input: string): string {
  return createHash("sha1").update(input).digest("hex").slice(0, 12);
}

// Strip HTML tags and collapse whitespace; decode a few common entities.
export function stripHtml(input: string): string {
  return (input || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

// Normalize a URL for dedup: drop protocol, www, trailing slash, query/hash.
export function canonicalUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`.toLowerCase();
  } catch {
    return (url || "").trim().toLowerCase();
  }
}

// Normalize a title for fuzzy matching: lowercase, alnum + spaces only.
export function normalizeTitle(title: string): string {
  return (title || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

export function daysAgo(iso: string, now = Date.now()): number {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return Infinity;
  return (now - t) / 86_400_000;
}

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

// Jaccard similarity over word sets — used for title-level near-duplicate detection.
export function jaccard(a: string, b: string): number {
  const sa = new Set(a.split(" ").filter(Boolean));
  const sb = new Set(b.split(" ").filter(Boolean));
  if (!sa.size || !sb.size) return 0;
  let inter = 0;
  for (const w of sa) if (sb.has(w)) inter++;
  return inter / (sa.size + sb.size - inter);
}

// Fetch with a timeout and a descriptive User-Agent (some feeds require one).
export async function fetchText(url: string, headers: Record<string, string> = {}, timeoutMs = 15000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "svr-ghostwriter-topics/1.0 (+github pages personal tool)", ...headers },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJson<T>(url: string, headers: Record<string, string> = {}, timeoutMs = 15000): Promise<T> {
  return JSON.parse(await fetchText(url, { Accept: "application/json", ...headers }, timeoutMs)) as T;
}

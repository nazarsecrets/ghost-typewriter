// Source adapters. Each returns RawItem[] for one source, or throws.
// Per-source failure is isolated by the orchestrator (FR-2.2).

import { XMLParser } from "fast-xml-parser";
import type { SourceDef } from "./config.ts";
import type { RawItem, SourceHealth } from "./types.ts";
import { fetchJson, fetchText, stripHtml } from "./util.ts";

const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

// --- RSS / Atom -----------------------------------------------------------
async function fetchRss(def: SourceDef): Promise<RawItem[]> {
  const parsed = xml.parse(await fetchText(def.target));
  const channel = parsed?.rss?.channel;
  const feed = parsed?.feed; // Atom

  if (channel) {
    return asArray(channel.item).map((item: any) => ({
      source: def.key,
      title: stripHtml(item.title ?? ""),
      description: stripHtml(item.description ?? item["content:encoded"] ?? ""),
      url: typeof item.link === "string" ? item.link : item.link?.["@_href"] ?? "",
      publishedAt: new Date(item.pubDate ?? item["dc:date"] ?? Date.now()).toISOString(),
    }));
  }
  if (feed) {
    return asArray(feed.entry).map((entry: any) => {
      const link = asArray(entry.link).find((l: any) => l["@_rel"] !== "self") ?? entry.link;
      return {
        source: def.key,
        title: stripHtml(entry.title?.["#text"] ?? entry.title ?? ""),
        description: stripHtml(entry.summary?.["#text"] ?? entry.summary ?? entry.content?.["#text"] ?? entry.content ?? ""),
        url: link?.["@_href"] ?? (typeof link === "string" ? link : ""),
        publishedAt: new Date(entry.updated ?? entry.published ?? Date.now()).toISOString(),
      };
    });
  }
  return [];
}

// --- DEV / Forem ----------------------------------------------------------
async function fetchDevto(def: SourceDef): Promise<RawItem[]> {
  const articles = await fetchJson<any[]>(`https://dev.to/api/articles?tag=${encodeURIComponent(def.target)}&top=30&per_page=30`);
  return articles.map((a) => ({
    source: def.key,
    title: stripHtml(a.title ?? ""),
    description: stripHtml(a.description ?? ""),
    url: a.url ?? "",
    publishedAt: new Date(a.published_at ?? Date.now()).toISOString(),
    engagement: (a.public_reactions_count ?? 0) + (a.comments_count ?? 0),
  }));
}

// --- Hacker News (Algolia) ------------------------------------------------
async function fetchHackerNews(def: SourceDef): Promise<RawItem[]> {
  const since = Math.floor((Date.now() - 30 * 86_400_000) / 1000);
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(def.target)}&tags=story&numericFilters=created_at_i>${since}&hitsPerPage=40`;
  const data = await fetchJson<{ hits: any[] }>(url);
  return data.hits
    .filter((h) => h.url && h.title)
    .map((h) => ({
      source: def.key,
      title: stripHtml(h.title),
      description: stripHtml(h.story_text ?? ""),
      url: h.url,
      publishedAt: new Date((h.created_at_i ?? 0) * 1000).toISOString(),
      engagement: (h.points ?? 0) + (h.num_comments ?? 0),
    }));
}

// --- arXiv ----------------------------------------------------------------
async function fetchArxiv(def: SourceDef): Promise<RawItem[]> {
  const url = `http://export.arxiv.org/api/query?search_query=cat:${encodeURIComponent(def.target)}&sortBy=submittedDate&sortOrder=descending&max_results=30`;
  const parsed = xml.parse(await fetchText(url));
  return asArray(parsed?.feed?.entry).map((entry: any) => ({
    source: def.key,
    title: stripHtml(entry.title ?? ""),
    description: stripHtml(entry.summary ?? ""),
    url: asArray(entry.link).find((l: any) => l["@_rel"] !== "related")?.["@_href"] ?? entry.id ?? "",
    publishedAt: new Date(entry.published ?? Date.now()).toISOString(),
  }));
}

// --- GitHub releases ------------------------------------------------------
async function fetchGithub(def: SourceDef): Promise<RawItem[]> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const releases = await fetchJson<any[]>(`https://api.github.com/repos/${def.target}/releases?per_page=10`, headers);
  return releases
    .filter((r) => !r.draft && !r.prerelease)
    .map((r) => ({
      source: def.key,
      title: stripHtml(`${def.label.split("·").pop()?.trim() ?? def.target} ${r.name || r.tag_name}`),
      description: stripHtml((r.body ?? "").slice(0, 400)),
      url: r.html_url ?? "",
      publishedAt: new Date(r.published_at ?? Date.now()).toISOString(),
      engagement: r.reactions?.total_count ?? 0,
    }));
}

const ADAPTERS: Record<SourceDef["type"], (def: SourceDef) => Promise<RawItem[]>> = {
  rss: fetchRss,
  devto: fetchDevto,
  hackernews: fetchHackerNews,
  arxiv: fetchArxiv,
  github: fetchGithub,
};

// Fetch one source, never throwing — returns items plus a health record.
export async function fetchSource(def: SourceDef): Promise<{ items: RawItem[]; health: SourceHealth }> {
  const fetchedAt = new Date().toISOString();
  try {
    const items = (await ADAPTERS[def.type](def)).filter((i) => i.title && i.url);
    return { items, health: { source: def.key, ok: true, items: items.length, fetchedAt } };
  } catch (error) {
    return {
      items: [],
      health: { source: def.key, ok: false, items: 0, fetchedAt, error: error instanceof Error ? error.message : String(error) },
    };
  }
}

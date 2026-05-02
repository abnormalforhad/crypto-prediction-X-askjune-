/**
 * Asset Library — loads and queries the pre-generated graphics manifest.
 *
 * Instead of calling an image generation API on every request (expensive,
 * slow, and credit-hungry), this module exposes a lightweight in-memory
 * index of curated PNG/SVG assets so the UI can pull the right visual
 * instantly by tag, category, or keyword match from the AI response.
 */

export interface Asset {
  id: string;
  path: string;
  category: 'coins' | 'charts' | 'concepts' | 'ui';
  tags: string[];
  alt: string;
  width: number;
  height: number;
}

interface Manifest {
  version: number;
  generated: string;
  assets: Asset[];
}

let _manifest: Manifest | null = null;

/** Fetch and cache the manifest once. */
export async function loadManifest(): Promise<Manifest> {
  if (_manifest) return _manifest;
  const res = await fetch('/assets/manifest.json');
  _manifest = (await res.json()) as Manifest;
  return _manifest;
}

/** Return all assets whose tags include any of the given keywords. */
export function getAssetsByTags(keywords: string[]): Asset[] {
  if (!_manifest) return [];
  const lower = keywords.map((k) => k.toLowerCase());
  return _manifest.assets.filter((a) =>
    a.tags.some((t) => lower.some((k) => t.includes(k) || k.includes(t)))
  );
}

/** Return all assets in a given category. */
export function getAssetsByCategory(category: Asset['category']): Asset[] {
  if (!_manifest) return [];
  return _manifest.assets.filter((a) => a.category === category);
}

/** Pick a random asset from a category (or from all if no category). */
export function getRandomAsset(category?: Asset['category']): Asset | null {
  const pool = category ? getAssetsByCategory(category) : (_manifest?.assets ?? []);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Return a single asset by id. */
export function getAssetById(id: string): Asset | null {
  return _manifest?.assets.find((a) => a.id === id) ?? null;
}

/**
 * Given a block of text (e.g. an AI response), scan it for keywords that
 * match asset tags and return the best-matching assets (de-duplicated,
 * sorted by number of tag hits descending).
 */
export function matchAssetsToText(text: string, maxResults = 3): Asset[] {
  if (!_manifest) return [];

  const lower = text.toLowerCase();

  const scored = _manifest.assets.map((asset) => {
    const hits = asset.tags.filter((tag) => lower.includes(tag)).length;
    return { asset, hits };
  });

  return scored
    .filter((s) => s.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, maxResults)
    .map((s) => s.asset);
}

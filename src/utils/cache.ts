import type { RepoAnalysis } from '../types';

const CACHE_KEY_PREFIX = 'code_navigator_cache_';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCacheKey(repoUrl: string): string {
  return CACHE_KEY_PREFIX + repoUrl.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

export function getCachedAnalysis(repoUrl: string): RepoAnalysis | null {
  try {
    const key = getCacheKey(repoUrl);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: RepoAnalysis = JSON.parse(raw);
    if (Date.now() - parsed.analyzedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setCachedAnalysis(repoUrl: string, analysis: RepoAnalysis): void {
  try {
    const key = getCacheKey(repoUrl);
    localStorage.setItem(key, JSON.stringify(analysis));
  } catch {
    // Storage quota exceeded — clear old entries
    clearOldCache();
  }
}

export function clearOldCache(): void {
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith(CACHE_KEY_PREFIX)
  );
  for (const key of keys) {
    localStorage.removeItem(key);
  }
}

export function getCacheAgeString(analyzedAt: number): string {
  const diffMs = Date.now() - analyzedAt;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${diffHr}h ago`;
}

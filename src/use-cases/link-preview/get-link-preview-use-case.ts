import type { LinkMetadata } from '@/lib/link-preview/parse-metadata';

import { RateLimitedError } from '../errors/rateLimited';

export type LinkMetadataFetcher = (url: string) => Promise<LinkMetadata>;

const CACHE_MAX_ENTRIES = 500;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 1000;

/**
 * Returns page metadata for a link node. Any fetch failure yields `{}` so the
 * front-end falls back to the plain URL; only rate limiting is an error.
 */
export class GetLinkPreviewUseCase {
  private readonly cache = new Map<
    string,
    { value: LinkMetadata; expiresAt: number }
  >();
  private readonly requests = new Map<string, number[]>();

  constructor(
    private readonly fetchMetadata: LinkMetadataFetcher,
    private readonly now: () => number = Date.now,
  ) {}

  async handle({
    url,
    userId,
  }: {
    url: string;
    userId: string;
  }): Promise<LinkMetadata> {
    this.consumeRateLimit(userId);

    const cached = this.cache.get(url);
    if (cached && cached.expiresAt > this.now()) {
      // refresh LRU position
      this.cache.delete(url);
      this.cache.set(url, cached);
      return cached.value;
    }

    let value: LinkMetadata;
    try {
      value = await this.fetchMetadata(url);
    } catch {
      value = {};
    }

    this.cache.set(url, { value, expiresAt: this.now() + CACHE_TTL_MS });
    if (this.cache.size > CACHE_MAX_ENTRIES) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) {
        this.cache.delete(oldest);
      }
    }

    return value;
  }

  private consumeRateLimit(userId: string) {
    const now = this.now();
    const recent = (this.requests.get(userId) ?? []).filter(
      (timestamp) => now - timestamp < RATE_WINDOW_MS,
    );
    if (recent.length >= RATE_LIMIT) {
      throw new RateLimitedError();
    }
    recent.push(now);
    this.requests.set(userId, recent);
  }
}

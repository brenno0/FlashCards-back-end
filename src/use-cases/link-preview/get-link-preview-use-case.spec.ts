import { describe, expect, it, vi } from 'vitest';

import { RateLimitedError } from '../errors/rateLimited';

import { GetLinkPreviewUseCase } from './get-link-preview-use-case';

describe('GetLinkPreviewUseCase', () => {
  it('caches results per URL', async () => {
    const fetcher = vi.fn().mockResolvedValue({ title: 'T' });
    const sut = new GetLinkPreviewUseCase(fetcher);

    await sut.handle({ url: 'https://a.io', userId: 'u' });
    const result = await sut.handle({ url: 'https://a.io', userId: 'u' });

    expect(result).toEqual({ title: 'T' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('returns empty preview when fetching fails', async () => {
    const sut = new GetLinkPreviewUseCase(
      vi.fn().mockRejectedValue(new Error('blocked')),
    );
    await expect(
      sut.handle({ url: 'http://10.0.0.1', userId: 'u' }),
    ).resolves.toEqual({});
  });

  it('expires cache after 24h', async () => {
    let now = 0;
    const fetcher = vi.fn().mockResolvedValue({});
    const sut = new GetLinkPreviewUseCase(fetcher, () => now);
    await sut.handle({ url: 'https://a.io', userId: 'u' });
    now += 24 * 60 * 60 * 1000 + 1;
    await sut.handle({ url: 'https://a.io', userId: 'u' });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('rate limits 30 requests per minute per user', async () => {
    let now = 0;
    const sut = new GetLinkPreviewUseCase(
      vi.fn().mockResolvedValue({}),
      () => now,
    );
    for (let i = 0; i < 30; i += 1) {
      await sut.handle({ url: `https://a.io/${i}`, userId: 'u' });
    }
    await expect(
      sut.handle({ url: 'https://a.io/x', userId: 'u' }),
    ).rejects.toBeInstanceOf(RateLimitedError);
    await expect(
      sut.handle({ url: 'https://a.io/x', userId: 'other' }),
    ).resolves.toEqual({});
    now += 60_001;
    await expect(
      sut.handle({ url: 'https://a.io/y', userId: 'u' }),
    ).resolves.toEqual({});
  });
});

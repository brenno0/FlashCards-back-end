import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryApiTokensRepository } from '@/repositories/in-memory/in-memory-api-tokens-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

import { API_TOKEN_PREFIX, isApiToken } from './api-token-secret';
import { AuthenticateApiTokenUseCase } from './authenticate-api-token-use-case';
import { CreateApiTokenUseCase } from './create-api-token-use-case';
import { DeleteApiTokenUseCase } from './delete-api-token-use-case';

const USER = 'user-1';

let tokens: InMemoryApiTokensRepository;

beforeEach(() => {
  tokens = new InMemoryApiTokensRepository();
});

const createToken = (userId = USER) =>
  new CreateApiTokenUseCase(tokens).handle({ name: 'Runway', userId });

describe('CreateApiTokenUseCase', () => {
  it('returns the plain token once and stores only its hash', async () => {
    const { token, apiToken } = await createToken();
    expect(token.startsWith(API_TOKEN_PREFIX)).toBe(true);
    expect(isApiToken(token)).toBe(true);
    expect(apiToken.tokenHash).not.toContain(token);
    expect(token.startsWith(apiToken.prefix)).toBe(true);
  });
});

describe('AuthenticateApiTokenUseCase', () => {
  it('resolves the owner and records the last use', async () => {
    const now = new Date('2026-10-07T12:00:00Z');
    const { token, apiToken } = await createToken();
    const result = await new AuthenticateApiTokenUseCase(
      tokens,
      () => now,
    ).handle({ token });
    expect(result).toEqual({ userId: USER });
    expect(tokens.items.find((t) => t.id === apiToken.id)?.lastUsedAt).toEqual(
      now,
    );
  });

  it('rejects unknown and revoked tokens', async () => {
    const { token, apiToken } = await createToken();
    const sut = new AuthenticateApiTokenUseCase(tokens);
    expect(await sut.handle({ token: `${token}x` })).toBeNull();
    await new DeleteApiTokenUseCase(tokens).handle({
      id: apiToken.id,
      userId: USER,
    });
    expect(await sut.handle({ token })).toBeNull();
  });
});

describe('DeleteApiTokenUseCase', () => {
  it("does not delete another user's token", async () => {
    const { apiToken } = await createToken('user-2');
    await expect(
      new DeleteApiTokenUseCase(tokens).handle({
        id: apiToken.id,
        userId: USER,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
    expect(tokens.items).toHaveLength(1);
  });
});

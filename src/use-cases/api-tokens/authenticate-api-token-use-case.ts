import type { ApiTokensRepository } from '@/repositories/api-tokens-repository';

import { hashApiToken } from './api-token-secret';

export class AuthenticateApiTokenUseCase {
  constructor(
    private readonly apiTokensRepository: ApiTokensRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  /** Returns the owner's id, or null when the token is unknown or revoked. */
  async handle({
    token,
  }: {
    token: string;
  }): Promise<{ userId: string } | null> {
    const apiToken = await this.apiTokensRepository.findByHash({
      tokenHash: hashApiToken(token),
    });
    if (!apiToken) {
      return null;
    }
    await this.apiTokensRepository.touch({ id: apiToken.id, at: this.now() });
    return { userId: apiToken.userId };
  }
}

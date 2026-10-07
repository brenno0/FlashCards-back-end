import type { ApiTokensRepository } from '@/repositories/api-tokens-repository';

import { generateApiToken } from './api-token-secret';

export class CreateApiTokenUseCase {
  constructor(private readonly apiTokensRepository: ApiTokensRepository) {}

  /** The plain token is only returned here; afterwards only its hash exists. */
  async handle({ name, userId }: { name: string; userId: string }) {
    const { token, tokenHash, prefix } = generateApiToken();
    const apiToken = await this.apiTokensRepository.create({
      name,
      tokenHash,
      prefix,
      userId,
    });
    return { apiToken, token };
  }
}

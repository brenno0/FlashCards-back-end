import type { ApiTokensRepository } from '@/repositories/api-tokens-repository';

export class GetApiTokensUseCase {
  constructor(private readonly apiTokensRepository: ApiTokensRepository) {}

  async handle({ userId }: { userId: string }) {
    const apiTokens = await this.apiTokensRepository.listByUser({ userId });
    return { apiTokens };
  }
}

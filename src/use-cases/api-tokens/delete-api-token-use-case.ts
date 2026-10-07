import type { ApiTokensRepository } from '@/repositories/api-tokens-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

export class DeleteApiTokenUseCase {
  constructor(private readonly apiTokensRepository: ApiTokensRepository) {}

  async handle({ id, userId }: { id: string; userId: string }) {
    const deleted = await this.apiTokensRepository.delete({ id, userId });
    if (!deleted) {
      throw new ResourceNotFoundError({ resource: 'Token' });
    }
  }
}

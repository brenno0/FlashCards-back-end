import type { DecksRepository } from '@/repositories/decks-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

interface GetAllDecksRequest {
  userId: string;
  title?: string;
  description?: string | null;
  isPublic?: boolean;
  folderId?: string | null;
  page?: number;
  pageSize?: number;
}

export class GetAllDecksUseCase {
  constructor(private readonly decksRepository: DecksRepository) {}

  async handle({
    userId,
    description,
    isPublic,
    title,
    folderId,
    page,
    pageSize,
  }: GetAllDecksRequest) {
    if (!userId) {
      throw new ResourceNotFoundError({ resource: 'Usuário' });
    }
    const decks = await this.decksRepository.getAll({
      userId,
      filters: {
        description,
        isPublic,
        title,
        folderId,
      },
      page,
      pageSize,
    });

    return { decks };
  }
}

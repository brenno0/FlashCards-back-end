import type { DecksRepository } from '@/repositories/decks-repository';

import { ResourceAlreadyExists } from '../errors/resourceAlreadyExists';

interface CreateDeckUseCaseRequest {
  title: string;
  userId: string;
  description?: string;
  isPublic?: boolean;
}

export class CreateDeckUseCase {
  constructor(private readonly decksRepository: DecksRepository) {}

  async handle({
    title,
    userId,
    description,
    isPublic,
  }: CreateDeckUseCaseRequest) {
    const deckTitle = await this.decksRepository.findByTitle(title, userId);

    if (deckTitle) {
      throw new ResourceAlreadyExists({ resource: 'Deck' });
    }

    const deck = await this.decksRepository.create({
      title,
      userId,
      description,
      isPublic,
    });

    return { deck };
  }
}

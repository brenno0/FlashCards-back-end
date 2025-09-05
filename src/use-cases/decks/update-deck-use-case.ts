import type { DecksRepository } from '@/repositories/decks-repository';
import type { Prisma } from 'generated/prisma';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

interface UpdateDeckUseCaseRequest {
  data: Prisma.DeckUpdateInput;
  deckId: string;
}

export class UpdateDeckUseCase {
  constructor(private readonly decksRepository: DecksRepository) {}

  async handle({ data, deckId }: UpdateDeckUseCaseRequest) {
    const deck = await this.decksRepository.getById({ deckId });

    if (!deck) {
      throw new ResourceNotFoundError({ resource: 'Deck' });
    }

    const updatedDeck = await this.decksRepository.update({
      data,
      deckId,
    });

    return {
      updatedDeck,
    };
  }
}

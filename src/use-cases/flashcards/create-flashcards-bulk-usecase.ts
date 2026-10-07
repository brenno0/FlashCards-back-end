import type { DecksRepository } from '@/repositories/decks-repository';
import type { FlashCardsRepository } from '@/repositories/flashcards-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

interface CreateFlashcardsBulkRequest {
  cards: { front: string; back: string }[];
  deckId: string;
  userId: string;
}

export class CreateFlashcardsBulkUseCase {
  constructor(
    private readonly flashcardsRepository: FlashCardsRepository,
    private readonly decksRepository: DecksRepository,
  ) {}

  async execute({ cards, deckId, userId }: CreateFlashcardsBulkRequest) {
    const deck = await this.decksRepository.getById({ deckId, userId });
    if (!deck) {
      throw new ResourceNotFoundError({ resource: 'Deck' });
    }

    const count = await this.flashcardsRepository.createMany(
      cards.map((card) => ({ ...card, deckId })),
    );
    return { count };
  }
}

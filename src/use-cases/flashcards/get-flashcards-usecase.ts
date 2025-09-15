import type { DecksRepository } from '@/repositories/decks-repository';
import type { FlashCardsRepository } from '@/repositories/flashcards-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

export class GetFlashCardsUseCase {
  constructor(
    private readonly flashcardsRepository: FlashCardsRepository,
    private readonly decksRepository: DecksRepository,
  ) {}

  async execute({ deckId }: { deckId: string }) {
    const deck = await this.decksRepository.getById({
      deckId,
    });

    if (!deck) {
      throw new ResourceNotFoundError({ resource: 'Flashcard' });
    }

    const flashcards = await this.flashcardsRepository.getByDeckId({ deckId });

    return { flashcards };
  }
}

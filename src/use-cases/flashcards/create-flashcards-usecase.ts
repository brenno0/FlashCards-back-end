import type { DecksRepository } from '@/repositories/decks-repository';
import type { FlashCardsRepository } from '@/repositories/flashcards-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

interface CreateFlashCardsRequest {
  front: string;
  back: string;
  deckId: string;
}

export class CreateFlashcardsUseCase {
  constructor(
    private readonly flashcardsRepository: FlashCardsRepository,
    private readonly decksRepository: DecksRepository,
  ) {}

  async execute({ front, back, deckId }: CreateFlashCardsRequest) {
    const deck = await this.decksRepository.getById({
      deckId,
    });

    if (!deck) {
      throw new ResourceNotFoundError({ resource: 'Deck' });
    }

    const flashcard = await this.flashcardsRepository.create({
      front,
      back,
      deckId,
    });

    return { flashcard };
  }
}

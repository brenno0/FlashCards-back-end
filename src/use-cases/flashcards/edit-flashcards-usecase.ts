import type { FlashCardsRepository } from '@/repositories/flashcards-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

export class EditFlashcardsUseCase {
  constructor(private readonly flashcardsRepository: FlashCardsRepository) {}

  async execute({
    flashcardId,
    front,
    back,
  }: {
    flashcardId: string;
    front?: string | null;
    back?: string | null;
  }) {
    const doesFlashCardExists = await this.flashcardsRepository.getById({
      flashcardId,
    });

    if (!doesFlashCardExists) {
      throw new ResourceNotFoundError({ resource: 'Flashcard' });
    }

    const flashcard = await this.flashcardsRepository.edit({
      flashcardId,
      front,
      back,
    });

    return { flashcard };
  }
}

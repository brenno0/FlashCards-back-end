import type { FlashCardsRepository } from '@/repositories/flashcards-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

interface DeleteFlashCardUseCaseProps {
  id: string;
}

export class DeleteFlashcardUseCase {
  constructor(private readonly flahcardsRepository: FlashCardsRepository) {}

  async handle({ id }: DeleteFlashCardUseCaseProps) {
    const didFlashcardExists = await this.flahcardsRepository.getById({
      flashcardId: id,
    });

    if (!didFlashcardExists) {
      throw new ResourceNotFoundError({ resource: 'Flashcard' });
    }
    await this.flahcardsRepository.deleteFlashcardById({ id });
  }
}

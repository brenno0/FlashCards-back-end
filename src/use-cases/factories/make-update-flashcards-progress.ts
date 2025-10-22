import { FlashcardsProgressPrismaRepository } from '@/repositories/prisma/flashcards-progress-repository';

import { UpdateFlashcardProgressUseCase } from '../study-sessions/update-flashcard-progress-use-case';

export const makeUpdateFlashcardsProgress = () => {
  const flashcardsProgressRepository = new FlashcardsProgressPrismaRepository();
  const useCase = new UpdateFlashcardProgressUseCase(
    flashcardsProgressRepository,
  );

  return { updateFlashcardProgressUseCase: useCase };
};

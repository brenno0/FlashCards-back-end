import { PrismaFlashCardsRepository } from '@/repositories/prisma/flashcards.repository.prisma';

import { EditFlashcardsUseCase } from '../flashcards/edit-flashcards-usecase';

export const makeEditFlashCard = () => {
  const flashcardsRepository = new PrismaFlashCardsRepository();

  const useCase = new EditFlashcardsUseCase(flashcardsRepository);

  return {
    editFlashCardUseCase: useCase,
  };
};

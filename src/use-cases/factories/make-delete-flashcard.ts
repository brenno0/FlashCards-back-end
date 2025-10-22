import { PrismaFlashCardsRepository } from '@/repositories/prisma/flashcards.repository.prisma';

import { DeleteFlashcardUseCase } from '../flashcards/delete-flashcard';

export const makeDeleteFlashcard = () => {
  const repository = new PrismaFlashCardsRepository();

  const useCase = new DeleteFlashcardUseCase(repository);

  return { deleteFlashcardUseCase: useCase };
};

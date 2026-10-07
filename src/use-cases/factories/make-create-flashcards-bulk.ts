import { DecksPrismaRepository } from '@/repositories/prisma/decks.repository.prisma';
import { PrismaFlashCardsRepository } from '@/repositories/prisma/flashcards.repository.prisma';

import { CreateFlashcardsBulkUseCase } from '../flashcards/create-flashcards-bulk-usecase';

export const makeCreateFlashCardsBulk = () => {
  const useCase = new CreateFlashcardsBulkUseCase(
    new PrismaFlashCardsRepository(),
    new DecksPrismaRepository(),
  );
  return { createFlashCardsBulkUseCase: useCase };
};

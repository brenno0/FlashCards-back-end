import { DecksPrismaRepository } from '@/repositories/prisma/decks.repository.prisma';
import { PrismaFlashCardsRepository } from '@/repositories/prisma/flashcards.repository.prisma';

import { CreateFlashcardsUseCase } from '../flashcards/create-flashcards-usecase';

export const makeCreateFlashCards = () => {
  const decksRepository = new DecksPrismaRepository();
  const flashCardsRepository = new PrismaFlashCardsRepository();
  const useCase = new CreateFlashcardsUseCase(
    flashCardsRepository,
    decksRepository,
  );

  return {
    createFlashCardUseCase: useCase,
  };
};

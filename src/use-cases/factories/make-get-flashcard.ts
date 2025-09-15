import { DecksPrismaRepository } from '@/repositories/prisma/decks.repository.prisma';
import { PrismaFlashCardsRepository } from '@/repositories/prisma/flashcards.repository.prisma';

import { GetFlashCardsUseCase } from '../flashcards/get-flashcards-usecase';

export const makeGetFlashCard = () => {
  const flashCardsRepository = new PrismaFlashCardsRepository();

  const decksRepository = new DecksPrismaRepository();
  const useCase = new GetFlashCardsUseCase(
    flashCardsRepository,
    decksRepository,
  );

  return {
    getFlashCardsUseCase: useCase,
  };
};

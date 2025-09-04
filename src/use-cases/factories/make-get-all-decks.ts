import { DecksPrismaRepository } from '@/repositories/prisma/decks.repository.prisma';

import { GetAllDecksUseCase } from '../decks/get-all-decks-use-case';

export const makeGetAllDecks = () => {
  const decksRepository = new DecksPrismaRepository();
  const createDeckUseCase = new GetAllDecksUseCase(decksRepository);

  return { createDeckUseCase };
};

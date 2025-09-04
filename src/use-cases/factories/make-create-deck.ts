import { DecksPrismaRepository } from '@/repositories/prisma/decks.repository.prisma';

import { CreateDeckUseCase } from '../decks/create-deck-use-case';

export const makeCreateDeck = () => {
  const decksRepository = new DecksPrismaRepository();
  const createDeckUseCase = new CreateDeckUseCase(decksRepository);

  return { createDeckUseCase };
};

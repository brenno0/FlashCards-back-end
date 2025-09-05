import { DecksPrismaRepository } from '@/repositories/prisma/decks.repository.prisma';

import { GetDeckByIdUseCase } from '../decks/find-deck-by-id-use-case';

export const makeGetDeckById = () => {
  const decksRepository = new DecksPrismaRepository();
  const getByIdDeckUseCase = new GetDeckByIdUseCase(decksRepository);

  return { getByIdDeckUseCase };
};

import { DecksPrismaRepository } from '@/repositories/prisma/decks.repository.prisma';

import { UpdateDeckUseCase } from '../decks/update-deck-use-case';

export const makeUpdateDeckById = () => {
  const decksRepository = new DecksPrismaRepository();
  const updateDeckById = new UpdateDeckUseCase(decksRepository);
  return { updateDeckById };
};

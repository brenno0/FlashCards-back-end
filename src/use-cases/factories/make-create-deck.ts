import { DecksPrismaRepository } from '@/repositories/prisma/decks.repository.prisma';
import { FoldersPrismaRepository } from '@/repositories/prisma/folders.repository.prisma';

import { CreateDeckUseCase } from '../decks/create-deck-use-case';

export const makeCreateDeck = () => {
  const decksRepository = new DecksPrismaRepository();
  const createDeckUseCase = new CreateDeckUseCase(
    decksRepository,
    new FoldersPrismaRepository(),
  );

  return { createDeckUseCase };
};

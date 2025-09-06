import { DecksPrismaRepository } from '@/repositories/prisma/decks.repository.prisma';

import { DeleteDeckByIdUseCase } from '../decks/delete-deck-by-id-use-case';

export const makeDeleteDeckById = () => {
  const decksRepository = new DecksPrismaRepository();
  const deleteDecksByIdUseCase = new DeleteDeckByIdUseCase(decksRepository);

  return { deleteDecksByIdUseCase };
};

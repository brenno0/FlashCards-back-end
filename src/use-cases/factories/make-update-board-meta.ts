import { BoardsPrismaRepository } from '@/repositories/prisma/boards.repository.prisma';
import { DecksPrismaRepository } from '@/repositories/prisma/decks.repository.prisma';
import { FoldersPrismaRepository } from '@/repositories/prisma/folders.repository.prisma';

import { UpdateBoardMetaUseCase } from '../boards/update-board-meta-use-case';

export const makeUpdateBoardMeta = () => {
  const boardsRepository = new BoardsPrismaRepository();
  const decksRepository = new DecksPrismaRepository();
  const updateBoardMetaUseCase = new UpdateBoardMetaUseCase(
    boardsRepository,
    decksRepository,
    new FoldersPrismaRepository(),
  );
  return { updateBoardMetaUseCase };
};

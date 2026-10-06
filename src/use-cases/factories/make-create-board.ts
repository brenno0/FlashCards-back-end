import { BoardsPrismaRepository } from '@/repositories/prisma/boards.repository.prisma';
import { DecksPrismaRepository } from '@/repositories/prisma/decks.repository.prisma';
import { FoldersPrismaRepository } from '@/repositories/prisma/folders.repository.prisma';

import { CreateBoardUseCase } from '../boards/create-board-use-case';

export const makeCreateBoard = () => {
  const boardsRepository = new BoardsPrismaRepository();
  const decksRepository = new DecksPrismaRepository();
  const createBoardUseCase = new CreateBoardUseCase(
    boardsRepository,
    decksRepository,
    new FoldersPrismaRepository(),
  );
  return { createBoardUseCase };
};

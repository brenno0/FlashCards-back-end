import { BoardsPrismaRepository } from '@/repositories/prisma/boards.repository.prisma';
import { DecksPrismaRepository } from '@/repositories/prisma/decks.repository.prisma';

import { CreateBoardUseCase } from '../boards/create-board-use-case';

export const makeCreateBoard = () => {
  const boardsRepository = new BoardsPrismaRepository();
  const decksRepository = new DecksPrismaRepository();
  const createBoardUseCase = new CreateBoardUseCase(
    boardsRepository,
    decksRepository,
  );
  return { createBoardUseCase };
};

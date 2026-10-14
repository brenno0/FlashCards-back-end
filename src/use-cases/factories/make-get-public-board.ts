import { BoardsPrismaRepository } from '@/repositories/prisma/boards.repository.prisma';

import { GetPublicBoardUseCase } from '../boards/get-public-board-use-case';

export const makeGetPublicBoard = () => {
  const boardsRepository = new BoardsPrismaRepository();
  const getPublicBoardUseCase = new GetPublicBoardUseCase(boardsRepository);
  return { getPublicBoardUseCase };
};

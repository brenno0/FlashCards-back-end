import { BoardsPrismaRepository } from '@/repositories/prisma/boards.repository.prisma';

import { GetBoardByIdUseCase } from '../boards/get-board-by-id-use-case';

export const makeGetBoardById = () => {
  const boardsRepository = new BoardsPrismaRepository();
  const getBoardByIdUseCase = new GetBoardByIdUseCase(boardsRepository);
  return { getBoardByIdUseCase };
};

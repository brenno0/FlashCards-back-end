import { BoardsPrismaRepository } from '@/repositories/prisma/boards.repository.prisma';

import { DeleteBoardUseCase } from '../boards/delete-board-use-case';

export const makeDeleteBoard = () => {
  const boardsRepository = new BoardsPrismaRepository();
  const deleteBoardUseCase = new DeleteBoardUseCase(boardsRepository);
  return { deleteBoardUseCase };
};

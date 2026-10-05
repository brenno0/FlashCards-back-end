import { BoardsPrismaRepository } from '@/repositories/prisma/boards.repository.prisma';

import { GetBoardsUseCase } from '../boards/get-boards-use-case';

export const makeGetBoards = () => {
  const boardsRepository = new BoardsPrismaRepository();
  const getBoardsUseCase = new GetBoardsUseCase(boardsRepository);
  return { getBoardsUseCase };
};

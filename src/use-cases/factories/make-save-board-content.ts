import { BoardAssetsPrismaRepository } from '@/repositories/prisma/board-assets.repository.prisma';
import { BoardsPrismaRepository } from '@/repositories/prisma/boards.repository.prisma';

import { SaveBoardContentUseCase } from '../boards/save-board-content-use-case';

export const makeSaveBoardContent = () => {
  const boardsRepository = new BoardsPrismaRepository();
  const saveBoardContentUseCase = new SaveBoardContentUseCase(
    boardsRepository,
    new BoardAssetsPrismaRepository(),
  );
  return { saveBoardContentUseCase };
};

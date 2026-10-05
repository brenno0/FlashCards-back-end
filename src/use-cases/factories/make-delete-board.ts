import { getStorageProvider } from '@/lib/storage';
import { BoardAssetsPrismaRepository } from '@/repositories/prisma/board-assets.repository.prisma';
import { BoardsPrismaRepository } from '@/repositories/prisma/boards.repository.prisma';

import { DeleteBoardUseCase } from '../boards/delete-board-use-case';

export const makeDeleteBoard = () => {
  const boardsRepository = new BoardsPrismaRepository();
  const boardAssetsRepository = new BoardAssetsPrismaRepository();
  const deleteBoardUseCase = new DeleteBoardUseCase(
    boardsRepository,
    boardAssetsRepository,
    getStorageProvider(),
  );
  return { deleteBoardUseCase };
};

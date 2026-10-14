import { getStorageProvider } from '@/lib/storage';
import { BoardAssetsPrismaRepository } from '@/repositories/prisma/board-assets.repository.prisma';
import { BoardsPrismaRepository } from '@/repositories/prisma/boards.repository.prisma';

import { GetPublicBoardAssetUseCase } from '../boards/get-public-board-asset-use-case';

export const makeGetPublicBoardAsset = () => {
  const boardsRepository = new BoardsPrismaRepository();
  const boardAssetsRepository = new BoardAssetsPrismaRepository();
  const getPublicBoardAssetUseCase = new GetPublicBoardAssetUseCase(
    boardsRepository,
    boardAssetsRepository,
    getStorageProvider(),
  );
  return { getPublicBoardAssetUseCase };
};

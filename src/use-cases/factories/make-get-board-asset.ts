import { getStorageProvider } from '@/lib/storage';
import { BoardAssetsPrismaRepository } from '@/repositories/prisma/board-assets.repository.prisma';

import { GetBoardAssetUseCase } from '../boards/get-board-asset-use-case';

export const makeGetBoardAsset = () => {
  const boardAssetsRepository = new BoardAssetsPrismaRepository();
  const getBoardAssetUseCase = new GetBoardAssetUseCase(
    boardAssetsRepository,
    getStorageProvider(),
  );
  return { getBoardAssetUseCase };
};

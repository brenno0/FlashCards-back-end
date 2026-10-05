import { getStorageProvider } from '@/lib/storage';
import { BoardAssetsPrismaRepository } from '@/repositories/prisma/board-assets.repository.prisma';
import { BoardsPrismaRepository } from '@/repositories/prisma/boards.repository.prisma';

import { UploadBoardAssetUseCase } from '../boards/upload-board-asset-use-case';

export const makeUploadBoardAsset = () => {
  const boardsRepository = new BoardsPrismaRepository();
  const boardAssetsRepository = new BoardAssetsPrismaRepository();
  const uploadBoardAssetUseCase = new UploadBoardAssetUseCase(
    boardsRepository,
    boardAssetsRepository,
    getStorageProvider(),
  );
  return { uploadBoardAssetUseCase };
};

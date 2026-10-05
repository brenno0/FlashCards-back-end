import { getStorageProvider } from '@/lib/storage';
import { BoardAssetsPrismaRepository } from '@/repositories/prisma/board-assets.repository.prisma';

import { CleanupOrphanedAssetsUseCase } from '../boards/cleanup-orphaned-assets-use-case';

export const makeCleanupOrphanedAssets = () => {
  const boardAssetsRepository = new BoardAssetsPrismaRepository();
  const cleanupOrphanedAssetsUseCase = new CleanupOrphanedAssetsUseCase(
    boardAssetsRepository,
    getStorageProvider(),
  );
  return { cleanupOrphanedAssetsUseCase };
};

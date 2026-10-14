import type { StorageProvider } from '@/lib/storage/storage-provider';
import type { BoardAssetsRepository } from '@/repositories/board-assets-repository';
import type { BoardsRepository } from '@/repositories/boards-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

/**
 * Serves an asset with no owner check, but only when its board is public —
 * guessing an assetId on a private board must still 404.
 */
export class GetPublicBoardAssetUseCase {
  constructor(
    private readonly boardsRepository: BoardsRepository,
    private readonly boardAssetsRepository: BoardAssetsRepository,
    private readonly storage: StorageProvider,
  ) {}

  async handle({ boardId, assetId }: { boardId: string; assetId: string }) {
    const board = await this.boardsRepository.findPublicById({ boardId });
    if (!board || !board.isPublic) {
      throw new ResourceNotFoundError({ resource: 'Asset' });
    }

    const asset = await this.boardAssetsRepository.findPublicById({
      assetId,
      boardId,
    });
    if (!asset) {
      throw new ResourceNotFoundError({ resource: 'Asset' });
    }

    const stream = await this.storage.get(asset.storageKey);
    return { asset, stream };
  }
}

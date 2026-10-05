import type { StorageProvider } from '@/lib/storage/storage-provider';
import type { BoardAssetsRepository } from '@/repositories/board-assets-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

export class GetBoardAssetUseCase {
  constructor(
    private readonly boardAssetsRepository: BoardAssetsRepository,
    private readonly storage: StorageProvider,
  ) {}

  async handle({
    boardId,
    assetId,
    userId,
  }: {
    boardId: string;
    assetId: string;
    userId: string;
  }) {
    const asset = await this.boardAssetsRepository.findById({
      assetId,
      boardId,
      userId,
    });
    if (!asset) {
      throw new ResourceNotFoundError({ resource: 'Asset' });
    }

    const stream = await this.storage.get(asset.storageKey);
    return { asset, stream };
  }
}

import type { StorageProvider } from '@/lib/storage/storage-provider';
import type { BoardAssetsRepository } from '@/repositories/board-assets-repository';
import type { BoardsRepository } from '@/repositories/boards-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

export class DeleteBoardUseCase {
  constructor(
    private readonly boardsRepository: BoardsRepository,
    private readonly boardAssetsRepository: BoardAssetsRepository,
    private readonly storage: StorageProvider,
  ) {}

  async handle({ boardId, userId }: { boardId: string; userId: string }) {
    const board = await this.boardsRepository.findById({ boardId, userId });
    if (!board) {
      throw new ResourceNotFoundError({ resource: 'Board' });
    }

    const assets = await this.boardAssetsRepository.listByBoard({ boardId });
    await this.boardsRepository.delete({ boardId });

    // Rows are gone with the board (cascade); stored files are removed best effort.
    const results = await Promise.allSettled(
      assets.map((asset) => this.storage.delete(asset.storageKey)),
    );
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `Failed to delete stored file ${assets[index].storageKey}`,
          result.reason,
        );
      }
    });
  }
}

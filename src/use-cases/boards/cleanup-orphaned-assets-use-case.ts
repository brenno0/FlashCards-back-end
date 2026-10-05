import type { StorageProvider } from '@/lib/storage/storage-provider';
import type { BoardAssetsRepository } from '@/repositories/board-assets-repository';

export const ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000;
const BATCH_SIZE = 100;

/**
 * Deletes assets unreferenced for longer than the grace period (which keeps
 * undo and in-flight uploads safe). Failures are logged and retried next run.
 */
export class CleanupOrphanedAssetsUseCase {
  constructor(
    private readonly boardAssetsRepository: BoardAssetsRepository,
    private readonly storage: StorageProvider,
  ) {}

  async handle({ now = new Date() }: { now?: Date } = {}) {
    const before = new Date(now.getTime() - ORPHAN_GRACE_MS);
    let deleted = 0;
    let failed = 0;

    const assets = await this.boardAssetsRepository.findOrphanedBefore({
      before,
      limit: BATCH_SIZE,
    });

    for (const asset of assets) {
      try {
        await this.storage.delete(asset.storageKey);
        await this.boardAssetsRepository.deleteById({ assetId: asset.id });
        deleted += 1;
      } catch (error) {
        failed += 1;
        console.error(`Failed to clean up asset ${asset.id}`, error);
      }
    }

    return { deleted, failed };
  }
}

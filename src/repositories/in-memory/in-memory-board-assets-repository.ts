import type { BoardAsset } from 'generated/prisma';

import type {
  BoardAssetsRepository,
  CreateBoardAssetInput,
} from '../board-assets-repository';

export class InMemoryBoardAssetsRepository implements BoardAssetsRepository {
  public items: BoardAsset[] = [];

  async create(data: CreateBoardAssetInput): Promise<BoardAsset> {
    const asset: BoardAsset = { ...data, createdAt: new Date() };
    this.items.push(asset);
    return asset;
  }

  async findById({
    assetId,
    boardId,
    userId,
  }: {
    assetId: string;
    boardId: string;
    userId: string;
  }): Promise<BoardAsset | null> {
    return (
      this.items.find(
        (item) =>
          item.id === assetId &&
          item.boardId === boardId &&
          item.userId === userId,
      ) ?? null
    );
  }

  async listByBoard({ boardId }: { boardId: string }): Promise<BoardAsset[]> {
    return this.items.filter((item) => item.boardId === boardId);
  }

  async syncOrphans({
    boardId,
    referencedIds,
    now,
  }: {
    boardId: string;
    referencedIds: string[];
    now: Date;
  }): Promise<void> {
    for (const item of this.items) {
      if (item.boardId !== boardId) {
        continue;
      }
      if (referencedIds.includes(item.id)) {
        item.orphanedAt = null;
      } else {
        item.orphanedAt ??= now;
      }
    }
  }

  async findOrphanedBefore({
    before,
    limit,
  }: {
    before: Date;
    limit: number;
  }): Promise<BoardAsset[]> {
    return this.items
      .filter((item) => item.orphanedAt && item.orphanedAt < before)
      .slice(0, limit);
  }

  async deleteById({ assetId }: { assetId: string }): Promise<void> {
    this.items = this.items.filter((item) => item.id !== assetId);
  }
}

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
}

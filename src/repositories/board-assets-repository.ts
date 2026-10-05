import type { AssetKind, BoardAsset } from 'generated/prisma';

export interface CreateBoardAssetInput {
  id: string;
  boardId: string;
  userId: string;
  kind: AssetKind;
  storageKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  orphanedAt: Date | null;
}

export interface BoardAssetsRepository {
  create(data: CreateBoardAssetInput): Promise<BoardAsset>;
  findById({
    assetId,
    boardId,
    userId,
  }: {
    assetId: string;
    boardId: string;
    userId: string;
  }): Promise<BoardAsset | null>;
}

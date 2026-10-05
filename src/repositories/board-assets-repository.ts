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
  listByBoard({ boardId }: { boardId: string }): Promise<BoardAsset[]>;
  /** Clears orphanedAt on referenced assets; stamps `now` on unreferenced ones not yet orphaned. */
  syncOrphans({
    boardId,
    referencedIds,
    now,
  }: {
    boardId: string;
    referencedIds: string[];
    now: Date;
  }): Promise<void>;
  findOrphanedBefore({
    before,
    limit,
  }: {
    before: Date;
    limit: number;
  }): Promise<BoardAsset[]>;
  deleteById({ assetId }: { assetId: string }): Promise<void>;
}

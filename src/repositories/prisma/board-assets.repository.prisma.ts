import { prisma } from '@/lib/prisma';
import type { BoardAsset } from 'generated/prisma';

import type {
  BoardAssetsRepository,
  CreateBoardAssetInput,
} from '../board-assets-repository';

export class BoardAssetsPrismaRepository implements BoardAssetsRepository {
  async create(data: CreateBoardAssetInput): Promise<BoardAsset> {
    return prisma.boardAsset.create({ data });
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
    return prisma.boardAsset.findFirst({
      where: { id: assetId, boardId, userId },
    });
  }

  async listByBoard({ boardId }: { boardId: string }): Promise<BoardAsset[]> {
    return prisma.boardAsset.findMany({ where: { boardId } });
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
    await prisma.$transaction([
      prisma.boardAsset.updateMany({
        where: {
          boardId,
          id: { in: referencedIds },
          orphanedAt: { not: null },
        },
        data: { orphanedAt: null },
      }),
      prisma.boardAsset.updateMany({
        where: { boardId, id: { notIn: referencedIds }, orphanedAt: null },
        data: { orphanedAt: now },
      }),
    ]);
  }

  async findOrphanedBefore({
    before,
    limit,
  }: {
    before: Date;
    limit: number;
  }): Promise<BoardAsset[]> {
    return prisma.boardAsset.findMany({
      where: { orphanedAt: { lt: before } },
      orderBy: { orphanedAt: 'asc' },
      take: limit,
    });
  }

  async deleteById({ assetId }: { assetId: string }): Promise<void> {
    await prisma.boardAsset.deleteMany({ where: { id: assetId } });
  }
}

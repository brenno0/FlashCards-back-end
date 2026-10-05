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
}

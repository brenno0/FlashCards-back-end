import { prisma } from '@/lib/prisma';
import type { Board, Prisma } from 'generated/prisma';

import type { BoardsRepository, BoardSummary } from '../boards-repository';

export class BoardsPrismaRepository implements BoardsRepository {
  async create(data: {
    title: string;
    userId: string;
    deckId?: string | null;
    content: Prisma.InputJsonValue;
  }): Promise<Board> {
    return prisma.board.create({ data });
  }

  async listByUser({ userId }: { userId: string }): Promise<BoardSummary[]> {
    return prisma.board.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        deckId: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById({
    boardId,
    userId,
  }: {
    boardId: string;
    userId: string;
  }): Promise<Board | null> {
    return prisma.board.findFirst({ where: { id: boardId, userId } });
  }

  async updateMeta({
    boardId,
    data,
  }: {
    boardId: string;
    data: { title?: string; deckId?: string | null };
  }): Promise<Board> {
    return prisma.board.update({ where: { id: boardId }, data });
  }

  async saveContent({
    boardId,
    userId,
    content,
    expectedVersion,
  }: {
    boardId: string;
    userId: string;
    content: Prisma.InputJsonValue;
    expectedVersion: number;
  }): Promise<number | null> {
    const { count } = await prisma.board.updateMany({
      where: { id: boardId, userId, version: expectedVersion },
      data: { content, version: { increment: 1 } },
    });

    return count === 0 ? null : expectedVersion + 1;
  }

  async delete({ boardId }: { boardId: string }): Promise<void> {
    await prisma.board.delete({ where: { id: boardId } });
  }

  async listAssetIds({ boardId }: { boardId: string }): Promise<string[]> {
    const assets = await prisma.boardAsset.findMany({
      where: { boardId },
      select: { id: true },
    });
    return assets.map((asset) => asset.id);
  }
}

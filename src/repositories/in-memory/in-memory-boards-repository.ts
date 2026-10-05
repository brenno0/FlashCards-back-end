import { randomUUID } from 'node:crypto';

import type { Board, Prisma } from 'generated/prisma';

import type { BoardsRepository, BoardSummary } from '../boards-repository';

export class InMemoryBoardsRepository implements BoardsRepository {
  public items: Board[] = [];
  /** boardId -> asset ids */
  public assets = new Map<string, string[]>();

  async create(data: {
    title: string;
    userId: string;
    deckId?: string | null;
    content: Prisma.InputJsonValue;
  }): Promise<Board> {
    const now = new Date();
    const board: Board = {
      id: randomUUID(),
      title: data.title,
      userId: data.userId,
      deckId: data.deckId ?? null,
      content: data.content as Prisma.JsonValue,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.items.push(board);
    return board;
  }

  async listByUser({ userId }: { userId: string }): Promise<BoardSummary[]> {
    return this.items
      .filter((item) => item.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .map(({ id, title, deckId, version, createdAt, updatedAt }) => ({
        id,
        title,
        deckId,
        version,
        createdAt,
        updatedAt,
      }));
  }

  async findById({
    boardId,
    userId,
  }: {
    boardId: string;
    userId: string;
  }): Promise<Board | null> {
    return (
      this.items.find(
        (item) => item.id === boardId && item.userId === userId,
      ) ?? null
    );
  }

  async updateMeta({
    boardId,
    data,
  }: {
    boardId: string;
    data: { title?: string; deckId?: string | null };
  }): Promise<Board> {
    const board = this.items.find((item) => item.id === boardId);
    if (!board) {
      throw new Error('Board not found');
    }
    if (data.title !== undefined) {
      board.title = data.title;
    }
    if (data.deckId !== undefined) {
      board.deckId = data.deckId;
    }
    board.updatedAt = new Date();
    return board;
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
    const board = this.items.find(
      (item) =>
        item.id === boardId &&
        item.userId === userId &&
        item.version === expectedVersion,
    );
    if (!board) {
      return null;
    }
    board.content = content as Prisma.JsonValue;
    board.version += 1;
    board.updatedAt = new Date();
    return board.version;
  }

  async delete({ boardId }: { boardId: string }): Promise<void> {
    this.items = this.items.filter((item) => item.id !== boardId);
    this.assets.delete(boardId);
  }

  async listAssetIds({ boardId }: { boardId: string }): Promise<string[]> {
    return this.assets.get(boardId) ?? [];
  }
}

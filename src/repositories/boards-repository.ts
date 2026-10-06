import type { Board, Prisma } from 'generated/prisma';

export type BoardSummary = Pick<
  Board,
  'id' | 'title' | 'deckId' | 'folderId' | 'version' | 'createdAt' | 'updatedAt'
>;

export interface BoardsRepository {
  create(data: {
    title: string;
    userId: string;
    deckId?: string | null;
    folderId?: string | null;
    content: Prisma.InputJsonValue;
  }): Promise<Board>;
  listByUser({ userId }: { userId: string }): Promise<BoardSummary[]>;
  findById({
    boardId,
    userId,
  }: {
    boardId: string;
    userId: string;
  }): Promise<Board | null>;
  updateMeta({
    boardId,
    data,
  }: {
    boardId: string;
    data: {
      title?: string;
      deckId?: string | null;
      folderId?: string | null;
    };
  }): Promise<Board>;
  /** Writes content only when stored version equals expectedVersion. Returns new version, or null when no row matched. */
  saveContent({
    boardId,
    userId,
    content,
    expectedVersion,
  }: {
    boardId: string;
    userId: string;
    content: Prisma.InputJsonValue;
    expectedVersion: number;
  }): Promise<number | null>;
  delete({ boardId }: { boardId: string }): Promise<void>;
  listAssetIds({ boardId }: { boardId: string }): Promise<string[]>;
}

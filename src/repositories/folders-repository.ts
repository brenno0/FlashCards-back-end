import type { Folder, FolderKind } from 'generated/prisma';

export interface FoldersRepository {
  create(data: {
    name: string;
    kind: FolderKind;
    userId: string;
    parentId?: string | null;
  }): Promise<Folder>;
  listByUser({
    userId,
    kind,
  }: {
    userId: string;
    kind?: FolderKind;
  }): Promise<Folder[]>;
  findById({
    folderId,
    userId,
  }: {
    folderId: string;
    userId: string;
  }): Promise<Folder | null>;
  update({
    folderId,
    data,
  }: {
    folderId: string;
    data: { name?: string; parentId?: string | null };
  }): Promise<Folder>;
  /** Moves child folders, decks and boards up to `parentId`, then deletes the folder. */
  deleteKeepingContents({
    folderId,
    parentId,
  }: {
    folderId: string;
    parentId: string | null;
  }): Promise<void>;
}

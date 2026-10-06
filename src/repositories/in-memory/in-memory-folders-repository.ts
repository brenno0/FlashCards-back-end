import { randomUUID } from 'node:crypto';

import type { Folder, FolderKind } from 'generated/prisma';

import type { FoldersRepository } from '../folders-repository';

export class InMemoryFoldersRepository implements FoldersRepository {
  public items: Folder[] = [];
  /** Hooks for moving decks/boards when a folder is deleted. */
  public onContentsMoved?: (from: string, to: string | null) => void;

  async create(data: {
    name: string;
    kind: FolderKind;
    userId: string;
    parentId?: string | null;
  }): Promise<Folder> {
    const now = new Date();
    const folder: Folder = {
      id: randomUUID(),
      name: data.name,
      kind: data.kind,
      userId: data.userId,
      parentId: data.parentId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.items.push(folder);
    return folder;
  }

  async listByUser({
    userId,
    kind,
  }: {
    userId: string;
    kind?: FolderKind;
  }): Promise<Folder[]> {
    return this.items
      .filter((item) => item.userId === userId && (!kind || item.kind === kind))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById({
    folderId,
    userId,
  }: {
    folderId: string;
    userId: string;
  }): Promise<Folder | null> {
    return (
      this.items.find(
        (item) => item.id === folderId && item.userId === userId,
      ) ?? null
    );
  }

  async update({
    folderId,
    data,
  }: {
    folderId: string;
    data: { name?: string; parentId?: string | null };
  }): Promise<Folder> {
    const folder = this.items.find((item) => item.id === folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }
    if (data.name !== undefined) {
      folder.name = data.name;
    }
    if (data.parentId !== undefined) {
      folder.parentId = data.parentId;
    }
    folder.updatedAt = new Date();
    return folder;
  }

  async deleteKeepingContents({
    folderId,
    parentId,
  }: {
    folderId: string;
    parentId: string | null;
  }): Promise<void> {
    for (const item of this.items) {
      if (item.parentId === folderId) {
        item.parentId = parentId;
      }
    }
    this.onContentsMoved?.(folderId, parentId);
    this.items = this.items.filter((item) => item.id !== folderId);
  }
}

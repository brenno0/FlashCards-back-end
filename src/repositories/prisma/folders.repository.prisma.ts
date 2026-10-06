import { prisma } from '@/lib/prisma';
import type { Folder, FolderKind } from 'generated/prisma';

import type { FoldersRepository } from '../folders-repository';

export class FoldersPrismaRepository implements FoldersRepository {
  async create(data: {
    name: string;
    kind: FolderKind;
    userId: string;
    parentId?: string | null;
  }): Promise<Folder> {
    return prisma.folder.create({ data });
  }

  async listByUser({
    userId,
    kind,
  }: {
    userId: string;
    kind?: FolderKind;
  }): Promise<Folder[]> {
    return prisma.folder.findMany({
      where: { userId, ...(kind ? { kind } : {}) },
      orderBy: { name: 'asc' },
    });
  }

  async findById({
    folderId,
    userId,
  }: {
    folderId: string;
    userId: string;
  }): Promise<Folder | null> {
    return prisma.folder.findFirst({ where: { id: folderId, userId } });
  }

  async update({
    folderId,
    data,
  }: {
    folderId: string;
    data: { name?: string; parentId?: string | null };
  }): Promise<Folder> {
    return prisma.folder.update({ where: { id: folderId }, data });
  }

  async deleteKeepingContents({
    folderId,
    parentId,
  }: {
    folderId: string;
    parentId: string | null;
  }): Promise<void> {
    await prisma.$transaction([
      prisma.folder.updateMany({
        where: { parentId: folderId },
        data: { parentId },
      }),
      prisma.deck.updateMany({
        where: { folderId },
        data: { folderId: parentId },
      }),
      prisma.board.updateMany({
        where: { folderId },
        data: { folderId: parentId },
      }),
      prisma.folder.delete({ where: { id: folderId } }),
    ]);
  }
}

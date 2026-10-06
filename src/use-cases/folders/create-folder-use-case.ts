import type { FoldersRepository } from '@/repositories/folders-repository';
import type { FolderKind } from 'generated/prisma';

import { assertFolderTarget } from './assert-folder-target';

interface CreateFolderUseCaseRequest {
  name: string;
  kind: FolderKind;
  userId: string;
  parentId?: string | null;
}

export class CreateFolderUseCase {
  constructor(private readonly foldersRepository: FoldersRepository) {}

  async handle({ name, kind, userId, parentId }: CreateFolderUseCaseRequest) {
    await assertFolderTarget(this.foldersRepository, {
      folderId: parentId,
      userId,
      kind,
    });

    const folder = await this.foldersRepository.create({
      name,
      kind,
      userId,
      parentId: parentId ?? null,
    });

    return { folder };
  }
}

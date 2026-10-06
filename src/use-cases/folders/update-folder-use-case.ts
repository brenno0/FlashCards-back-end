import type { FoldersRepository } from '@/repositories/folders-repository';

import { InvalidFolderMoveError } from '../errors/invalidFolderMove';
import { ResourceNotFoundError } from '../errors/resourceNotFound';

import { assertFolderTarget } from './assert-folder-target';

interface UpdateFolderUseCaseRequest {
  folderId: string;
  userId: string;
  name?: string;
  parentId?: string | null;
}

export class UpdateFolderUseCase {
  constructor(private readonly foldersRepository: FoldersRepository) {}

  async handle({
    folderId,
    userId,
    name,
    parentId,
  }: UpdateFolderUseCaseRequest) {
    const folder = await this.foldersRepository.findById({
      folderId,
      userId,
    });
    if (!folder) {
      throw new ResourceNotFoundError({ resource: 'Folder' });
    }

    if (parentId) {
      await assertFolderTarget(this.foldersRepository, {
        folderId: parentId,
        userId,
        kind: folder.kind,
      });
      // Walking up from the new parent must never reach the folder itself.
      const folders = await this.foldersRepository.listByUser({
        userId,
        kind: folder.kind,
      });
      const parentOf = new Map(folders.map((item) => [item.id, item.parentId]));
      let cursor: string | null | undefined = parentId;
      while (cursor) {
        if (cursor === folderId) {
          throw new InvalidFolderMoveError(
            'uma pasta não pode ficar dentro dela mesma',
          );
        }
        cursor = parentOf.get(cursor);
      }
    }

    const updated = await this.foldersRepository.update({
      folderId,
      data: { name, parentId },
    });

    return { folder: updated };
  }
}

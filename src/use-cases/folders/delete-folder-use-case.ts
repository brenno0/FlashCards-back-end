import type { FoldersRepository } from '@/repositories/folders-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

/** Deleting a folder never deletes its decks or boards: they move to the parent folder. */
export class DeleteFolderUseCase {
  constructor(private readonly foldersRepository: FoldersRepository) {}

  async handle({ folderId, userId }: { folderId: string; userId: string }) {
    const folder = await this.foldersRepository.findById({
      folderId,
      userId,
    });
    if (!folder) {
      throw new ResourceNotFoundError({ resource: 'Folder' });
    }

    await this.foldersRepository.deleteKeepingContents({
      folderId,
      parentId: folder.parentId,
    });
  }
}

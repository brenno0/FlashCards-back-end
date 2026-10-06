import type { FoldersRepository } from '@/repositories/folders-repository';
import type { FolderKind } from 'generated/prisma';

import { InvalidFolderMoveError } from '../errors/invalidFolderMove';
import { ResourceNotFoundError } from '../errors/resourceNotFound';

/** A deck or board may only be filed in one of the user's folders of the matching kind. */
export const assertFolderTarget = async (
  foldersRepository: FoldersRepository,
  {
    folderId,
    userId,
    kind,
  }: {
    folderId: string | null | undefined;
    userId: string;
    kind: FolderKind;
  },
) => {
  if (!folderId) {
    return;
  }
  const folder = await foldersRepository.findById({ folderId, userId });
  if (!folder) {
    throw new ResourceNotFoundError({ resource: 'Folder' });
  }
  if (folder.kind !== kind) {
    throw new InvalidFolderMoveError(
      `a pasta não guarda itens do tipo ${kind}`,
    );
  }
};

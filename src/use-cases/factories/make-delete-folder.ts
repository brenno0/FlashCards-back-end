import { FoldersPrismaRepository } from '@/repositories/prisma/folders.repository.prisma';

import { DeleteFolderUseCase } from '../folders/delete-folder-use-case';

export const makeDeleteFolder = () => {
  const foldersRepository = new FoldersPrismaRepository();
  const deleteFolderUseCase = new DeleteFolderUseCase(foldersRepository);
  return { deleteFolderUseCase };
};

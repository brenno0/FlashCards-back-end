import { FoldersPrismaRepository } from '@/repositories/prisma/folders.repository.prisma';

import { UpdateFolderUseCase } from '../folders/update-folder-use-case';

export const makeUpdateFolder = () => {
  const foldersRepository = new FoldersPrismaRepository();
  const updateFolderUseCase = new UpdateFolderUseCase(foldersRepository);
  return { updateFolderUseCase };
};

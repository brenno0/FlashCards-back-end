import { FoldersPrismaRepository } from '@/repositories/prisma/folders.repository.prisma';

import { CreateFolderUseCase } from '../folders/create-folder-use-case';

export const makeCreateFolder = () => {
  const foldersRepository = new FoldersPrismaRepository();
  const createFolderUseCase = new CreateFolderUseCase(foldersRepository);
  return { createFolderUseCase };
};

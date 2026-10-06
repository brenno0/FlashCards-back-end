import { FoldersPrismaRepository } from '@/repositories/prisma/folders.repository.prisma';

import { GetFoldersUseCase } from '../folders/get-folders-use-case';

export const makeGetFolders = () => {
  const foldersRepository = new FoldersPrismaRepository();
  const getFoldersUseCase = new GetFoldersUseCase(foldersRepository);
  return { getFoldersUseCase };
};

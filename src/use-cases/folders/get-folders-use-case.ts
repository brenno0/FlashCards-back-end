import type { FoldersRepository } from '@/repositories/folders-repository';
import type { FolderKind } from 'generated/prisma';

export class GetFoldersUseCase {
  constructor(private readonly foldersRepository: FoldersRepository) {}

  async handle({ userId, kind }: { userId: string; kind?: FolderKind }) {
    const folders = await this.foldersRepository.listByUser({
      userId,
      kind,
    });
    return { folders };
  }
}

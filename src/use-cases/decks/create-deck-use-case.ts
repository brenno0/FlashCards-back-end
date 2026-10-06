import type { DecksRepository } from '@/repositories/decks-repository';
import type { FoldersRepository } from '@/repositories/folders-repository';

import { ResourceAlreadyExists } from '../errors/resourceAlreadyExists';
import { assertFolderTarget } from '../folders/assert-folder-target';

interface CreateDeckUseCaseRequest {
  title: string;
  userId: string;
  description?: string;
  isPublic?: boolean;
  folderId?: string | null;
}

export class CreateDeckUseCase {
  constructor(
    private readonly decksRepository: DecksRepository,
    private readonly foldersRepository: FoldersRepository,
  ) {}

  async handle({
    title,
    userId,
    description,
    isPublic,
    folderId,
  }: CreateDeckUseCaseRequest) {
    const deckTitle = await this.decksRepository.findByTitle(title, userId);

    if (deckTitle) {
      throw new ResourceAlreadyExists({ resource: 'Deck' });
    }

    await assertFolderTarget(this.foldersRepository, {
      folderId,
      userId,
      kind: 'DECK',
    });

    const deck = await this.decksRepository.create({
      title,
      userId,
      description,
      isPublic,
      folderId: folderId ?? null,
    });

    return { deck };
  }
}

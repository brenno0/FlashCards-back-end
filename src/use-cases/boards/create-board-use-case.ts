import type { BoardsRepository } from '@/repositories/boards-repository';
import type { DecksRepository } from '@/repositories/decks-repository';
import type { FoldersRepository } from '@/repositories/folders-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';
import { assertFolderTarget } from '../folders/assert-folder-target';

import { EMPTY_BOARD_DOCUMENT } from './board-document';

interface CreateBoardUseCaseRequest {
  title: string;
  deckId?: string | null;
  folderId?: string | null;
  userId: string;
}

export class CreateBoardUseCase {
  constructor(
    private readonly boardsRepository: BoardsRepository,
    private readonly decksRepository: DecksRepository,
    private readonly foldersRepository: FoldersRepository,
  ) {}

  async handle({ title, deckId, folderId, userId }: CreateBoardUseCaseRequest) {
    if (deckId) {
      const deck = await this.decksRepository.getById({ deckId, userId });
      if (!deck) {
        throw new ResourceNotFoundError({ resource: 'Deck' });
      }
    }

    await assertFolderTarget(this.foldersRepository, {
      folderId,
      userId,
      kind: 'BOARD',
    });

    const board = await this.boardsRepository.create({
      title,
      deckId: deckId ?? null,
      folderId: folderId ?? null,
      userId,
      content: EMPTY_BOARD_DOCUMENT,
    });

    return { board };
  }
}

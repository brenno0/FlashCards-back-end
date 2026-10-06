import type { BoardsRepository } from '@/repositories/boards-repository';
import type { DecksRepository } from '@/repositories/decks-repository';
import type { FoldersRepository } from '@/repositories/folders-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';
import { assertFolderTarget } from '../folders/assert-folder-target';

interface UpdateBoardMetaUseCaseRequest {
  boardId: string;
  userId: string;
  title?: string;
  deckId?: string | null;
  folderId?: string | null;
}

export class UpdateBoardMetaUseCase {
  constructor(
    private readonly boardsRepository: BoardsRepository,
    private readonly decksRepository: DecksRepository,
    private readonly foldersRepository: FoldersRepository,
  ) {}

  async handle({
    boardId,
    userId,
    title,
    deckId,
    folderId,
  }: UpdateBoardMetaUseCaseRequest) {
    const board = await this.boardsRepository.findById({ boardId, userId });
    if (!board) {
      throw new ResourceNotFoundError({ resource: 'Board' });
    }

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

    const updatedBoard = await this.boardsRepository.updateMeta({
      boardId,
      data: { title, deckId, folderId },
    });

    return { board: updatedBoard };
  }
}

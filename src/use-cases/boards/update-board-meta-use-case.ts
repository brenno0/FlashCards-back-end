import type { BoardsRepository } from '@/repositories/boards-repository';
import type { DecksRepository } from '@/repositories/decks-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

interface UpdateBoardMetaUseCaseRequest {
  boardId: string;
  userId: string;
  title?: string;
  deckId?: string | null;
}

export class UpdateBoardMetaUseCase {
  constructor(
    private readonly boardsRepository: BoardsRepository,
    private readonly decksRepository: DecksRepository,
  ) {}

  async handle({
    boardId,
    userId,
    title,
    deckId,
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

    const updatedBoard = await this.boardsRepository.updateMeta({
      boardId,
      data: { title, deckId },
    });

    return { board: updatedBoard };
  }
}

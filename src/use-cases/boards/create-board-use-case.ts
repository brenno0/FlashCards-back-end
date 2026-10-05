import type { BoardsRepository } from '@/repositories/boards-repository';
import type { DecksRepository } from '@/repositories/decks-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

import { EMPTY_BOARD_DOCUMENT } from './board-document';

interface CreateBoardUseCaseRequest {
  title: string;
  deckId?: string | null;
  userId: string;
}

export class CreateBoardUseCase {
  constructor(
    private readonly boardsRepository: BoardsRepository,
    private readonly decksRepository: DecksRepository,
  ) {}

  async handle({ title, deckId, userId }: CreateBoardUseCaseRequest) {
    if (deckId) {
      const deck = await this.decksRepository.getById({ deckId, userId });
      if (!deck) {
        throw new ResourceNotFoundError({ resource: 'Deck' });
      }
    }

    const board = await this.boardsRepository.create({
      title,
      deckId: deckId ?? null,
      userId,
      content: EMPTY_BOARD_DOCUMENT,
    });

    return { board };
  }
}

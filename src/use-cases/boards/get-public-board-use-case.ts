import type { BoardsRepository } from '@/repositories/boards-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

/** Looks a board up by id alone and requires it to be marked public — no owner check. */
export class GetPublicBoardUseCase {
  constructor(private readonly boardsRepository: BoardsRepository) {}

  async handle({ boardId }: { boardId: string }) {
    const board = await this.boardsRepository.findPublicById({ boardId });
    if (!board || !board.isPublic) {
      throw new ResourceNotFoundError({ resource: 'Board' });
    }
    return { board };
  }
}

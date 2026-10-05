import type { BoardsRepository } from '@/repositories/boards-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

export class DeleteBoardUseCase {
  constructor(private readonly boardsRepository: BoardsRepository) {}

  async handle({ boardId, userId }: { boardId: string; userId: string }) {
    const board = await this.boardsRepository.findById({ boardId, userId });
    if (!board) {
      throw new ResourceNotFoundError({ resource: 'Board' });
    }
    await this.boardsRepository.delete({ boardId });
  }
}

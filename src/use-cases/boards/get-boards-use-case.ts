import type { BoardsRepository } from '@/repositories/boards-repository';

export class GetBoardsUseCase {
  constructor(private readonly boardsRepository: BoardsRepository) {}

  async handle({ userId }: { userId: string }) {
    const boards = await this.boardsRepository.listByUser({ userId });
    return { boards };
  }
}

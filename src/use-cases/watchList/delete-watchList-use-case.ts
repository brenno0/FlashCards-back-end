import type { WatchListRepository } from '@/repositories/watchList-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

export class DeleteWatchListUseCase {
  constructor(private readonly watchListRepository: WatchListRepository) {}

  async execute(id: string): Promise<void> {
    const watchList = await this.watchListRepository.findById(id);

    if (!watchList) {
      throw new ResourceNotFoundError({ resource: 'Lista de filmes' });
    }

    await this.watchListRepository.deleteById(id);
  }
}

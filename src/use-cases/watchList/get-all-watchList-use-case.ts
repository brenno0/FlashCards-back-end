import type { WatchListRepository } from '@/repositories/watchList-repository';
import type { Watchlist } from 'generated/prisma';

export class GetAllWatchListUseCase {
  constructor(private readonly watchListRepository: WatchListRepository) {}

  async execute({
    userId,
    limit,
    orderBy,
    page,
    params,
  }: {
    userId: string;
    params?: { title: string };
    orderBy?: {
      field: 'createdAt' | 'title' | 'voteAverage'; // campos para ordenar
      direction: 'asc' | 'desc';
    };
    page?: number;
    limit?: number;
  }): Promise<Watchlist[]> {
    const watchList = await this.watchListRepository.getAll({
      userId,
      limit,
      orderBy,
      page,
      params,
    });
    return watchList;
  }
}

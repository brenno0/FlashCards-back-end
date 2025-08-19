import type { Prisma, Watchlist } from 'generated/prisma';

export interface WatchListRepository {
  create(data: Prisma.WatchlistUncheckedCreateInput): Promise<Watchlist | void>;
  deleteById(id: string): Promise<void>;
  findById(id: string): Promise<Watchlist | null>;
  findMovieByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Watchlist | null | undefined>;
  getAll: ({
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
  }) => Promise<Watchlist[]>;
}

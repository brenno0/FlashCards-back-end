import { randomUUID } from 'crypto';

import type { Movie, Prisma, Watchlist } from 'generated/prisma';

import type { WatchListRepository } from '../watchList-repository';

export type WatchlistWithMovie = Watchlist & { movie: Movie };

interface GetAllParams {
  userId: string;
  params?: { title?: string };
  orderBy?: {
    field: 'createdAt' | 'title' | 'voteAverage';
    direction: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
}

export class InMemoryWatchListRepository implements WatchListRepository {
  public items: WatchlistWithMovie[] = [];

  findMovieByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Watchlist | null | undefined> {
    return Promise.resolve(
      this.items.find((item) => item.movieId === id && item.userId === userId),
    );
  }
  async create(
    data: Prisma.WatchlistUncheckedCreateInput,
  ): Promise<Watchlist | void> {
    const newItem: Watchlist = {
      id: randomUUID(),
      createdAt: new Date(),
      movieId: data.movieId,
      userId: data.userId,
    };

    const itemAlreadyExists = this.items.find(
      (item) => item.movieId === newItem.movieId,
    );
    if (itemAlreadyExists) {
      return this.deleteById(itemAlreadyExists.id);
    }

    this.items.push(newItem as WatchlistWithMovie);

    return newItem;
  }

  async deleteById(id: string): Promise<void> {
    const itemToDelete = this.items.find((item) => item.id === id);
    if (itemToDelete) {
      this.items = this.items.filter((item) => item.id !== id);
    }
  }

  async getAll({
    userId,
    params,
    orderBy,
    page = 1,
    limit = 10,
  }: GetAllParams): Promise<(Watchlist & { movie: Movie })[]> {
    let result = this.items.filter((item) => item.userId === userId);

    // Filtering by movie title
    if (params?.title) {
      result = result.filter((item) =>
        item.movie?.title.toLowerCase().includes(params.title!.toLowerCase()),
      );
    }

    // Order
    if (orderBy) {
      const { field, direction } = orderBy;
      result = result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (field === 'title' || field === 'voteAverage') {
          aValue = a.movie[field];
          bValue = b.movie[field];
        } else {
          aValue = a[field];
          bValue = b[field];
        }

        if (aValue < bValue) {
          return direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    return result.slice(start, end);
  }

  async findById(id: string): Promise<Watchlist | null> {
    const watchList = this.items.find((item) => item.id === id);

    return Promise.resolve(watchList ?? null);
  }
}

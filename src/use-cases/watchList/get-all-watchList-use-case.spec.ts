import { describe, it, expect, beforeEach } from 'vitest';

import type { Movie } from 'generated/prisma';

import type { WatchlistWithMovie } from '../../repositories/in-memory/in-memory-watchList-repository';
import { InMemoryWatchListRepository } from '../../repositories/in-memory/in-memory-watchList-repository';

import { GetAllWatchListUseCase } from './get-all-watchList-use-case';

let repository: InMemoryWatchListRepository;
let sut: GetAllWatchListUseCase;

describe('WatchListRepository - getAll', () => {
  beforeEach(() => {
    repository = new InMemoryWatchListRepository();
    sut = new GetAllWatchListUseCase(repository);

    repository.items = [
      {
        id: '1',
        userId: 'user1',
        movieId: 'movie1',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date(),
        movie: {
          id: 'movie1',
          title: 'Matrix',
          tmdbId: 1,
          voteAverage: 9,
          overview: '',
          posterPath: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Movie,
      },
      {
        id: '2',
        userId: 'user1',
        movieId: 'movie2',
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date(),
        movie: {
          id: 'movie2',
          title: 'Inception',
          tmdbId: 2,
          voteAverage: 8,
          overview: '',
          posterPath: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Movie,
      },
      {
        id: '3',
        userId: 'user2',
        movieId: 'movie3',
        createdAt: new Date('2025-01-03'),
        updatedAt: new Date(),
        movie: {
          id: 'movie3',
          title: 'Interstellar',
          tmdbId: 3,
          voteAverage: 9,
          overview: '',
          posterPath: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Movie,
      },
    ];
  });

  it('should return all watchlist items for a user', async () => {
    const result = await sut.execute({ userId: 'user1' });
    expect(result).toHaveLength(2);
    expect(result.every((item) => item.userId === 'user1')).toBe(true);
  });

  it('should filter watchlist items by movie title', async () => {
    const result = await sut.execute({
      userId: 'user1',
      params: { title: 'Matrix' },
    });
    expect(result).toHaveLength(1);
    expect(result[0].movie.title).toBe('Matrix');
  });

  it('should paginate results', async () => {
    const result = await sut.execute({ userId: 'user1', page: 2, limit: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].movie.title).toBe('Inception');
  });

  it('should order results by createdAt descending', async () => {
    const result = await sut.execute({
      userId: 'user1',
      orderBy: { field: 'createdAt', direction: 'desc' },
    });
    expect(result[0].createdAt.getTime() > result[1].createdAt.getTime()).toBe(
      true,
    );
  });

  it('should order results by movie title ascending', async () => {
    const result: WatchlistWithMovie[] = await sut.execute({
      userId: 'user1',
      orderBy: { field: 'title', direction: 'asc' },
    });
    expect(result[0].movie.title).toBe('Inception');
    expect(result[1].movie.title).toBe('Matrix');
  });
});

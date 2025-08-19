import { expect, describe, it, beforeEach } from 'vitest';

import { InMemoryMoviesRepository } from '@/repositories/in-memory/in-memory-movies-repository';
import type { MoviesRepository } from '@/repositories/movies-repository';
import type { Movie } from 'generated/prisma';

import { InMemoryWatchListRepository } from '../../repositories/in-memory/in-memory-watchList-repository';

import { CreateWatchListUseCase } from './create-watchList-use-case';

let watchListRepository: InMemoryWatchListRepository;
let moviesRepository: MoviesRepository;
let sut: CreateWatchListUseCase;

describe('Register Use Case', () => {
  beforeEach(() => {
    watchListRepository = new InMemoryWatchListRepository();
    moviesRepository = new InMemoryMoviesRepository();
    sut = new CreateWatchListUseCase(watchListRepository, moviesRepository);
  });

  it('Should be able to create a new watchList', async () => {
    const newMovie: Movie = {
      overview: 'test',
      posterPath: 'poster-test',
      id: 'test-id',
      tmdbId: 0,
      title: 'test-movie-title',
      voteAverage: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const movie = await moviesRepository.create(newMovie);

    const { watchList } = await sut.execute({
      movieId: movie.id,
      userId: 'id-test',
    });

    expect(watchList).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        movieId: movie.id,
        userId: 'id-test',
        createdAt: expect.any(Date),
      }),
    );
  });

  it('Should not be able to create a new watchList if another watch list already exists', async () => {
    const newMovie: Movie = {
      overview: 'test',
      posterPath: 'poster-test',
      id: 'test-id',
      tmdbId: 0,
      title: 'test-movie-title',
      voteAverage: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const movie = await moviesRepository.create(newMovie);

    await sut.execute({
      movieId: movie.id,
      userId: 'id-test',
    });

    await expect(() =>
      sut.execute({
        movieId: movie.id,
        userId: 'id-test',
      }),
    ).rejects.toThrow('Filme já existe.');
  });

  it('Should not be able to create a new watchList if movie does not exists', async () => {
    const newMovie: Movie = {
      overview: 'test',
      posterPath: 'poster-test',
      id: 'test-id',
      tmdbId: 0,
      title: 'test-movie-title',
      voteAverage: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await moviesRepository.create(newMovie);

    await expect(() =>
      sut.execute({
        movieId: 'wrong-movie-id',
        userId: 'id-test',
      }),
    ).rejects.toThrow('Filme não encontrado');
  });
});

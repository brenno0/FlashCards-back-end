import { expect, describe, it, beforeEach } from 'vitest';

import { InMemoryMoviesRepository } from '@/repositories/in-memory/in-memory-movies-repository';
import type { Movie } from 'generated/prisma';

import { InMemoryWatchListRepository } from '../../repositories/in-memory/in-memory-watchList-repository';

import {
  CreateWatchListUseCase,
  type CreateWatchListUseCase as ICreateWatchListUseCase,
} from './create-watchList-use-case';
import { DeleteWatchListUseCase } from './delete-watchList-use-case';

let watchListRepository: InMemoryWatchListRepository;
let moviesRepository: InMemoryMoviesRepository;
let createWatchListUseCase: ICreateWatchListUseCase;

let sut: DeleteWatchListUseCase;

describe('Register Use Case', () => {
  beforeEach(() => {
    watchListRepository = new InMemoryWatchListRepository();
    moviesRepository = new InMemoryMoviesRepository();
    createWatchListUseCase = new CreateWatchListUseCase(
      watchListRepository,
      moviesRepository,
    );
    sut = new DeleteWatchListUseCase(watchListRepository);
  });

  it('Should be able to delete an existing watchList', async () => {
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

    const { watchList } = await createWatchListUseCase.execute({
      movieId: movie.id,
      userId: 'id-test',
    });

    if (!watchList) {
      throw new Error('Watchlist não foi criada');
    }

    await sut.execute({ id: watchList.id });
    expect(watchListRepository.items).toEqual([]);
  });

  it('Should not be able to delete an watchList that does not exists', async () => {
    await expect(
      async () => await sut.execute({ id: 'watchList-test-id' }),
    ).rejects.toThrow('Lista de filmes não encontrado');
  });
});

import { randomUUID } from 'crypto';

import type { Movie, Prisma } from 'generated/prisma';

import type { MoviesRepository } from '../movies-repository';

export class InMemoryMoviesRepository implements MoviesRepository {
  public items: Movie[] = [];

  create(data: Prisma.MovieCreateInput): Promise<Movie> {
    const newMovie: Movie = {
      id: randomUUID(),
      tmdbId: data.tmdbId,
      title: data.title,
      overview: data.overview,
      posterPath: data.posterPath,
      voteAverage: data.voteAverage,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.push(newMovie);

    return Promise.resolve(newMovie);
  }
  findByTmdbId(tmdbId: number): Promise<Movie | null> {
    const movie = this.items.find((item) => item.tmdbId === tmdbId);

    return Promise.resolve(movie ?? null);
  }
  findById(id: string): Promise<Movie | null> {
    const movie = this.items.find((item) => item.id === id);

    return Promise.resolve(movie ?? null);
  }
}

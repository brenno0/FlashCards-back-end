import type { Movie, Prisma } from 'generated/prisma';

export interface MoviesRepository {
  create(data: Prisma.MovieCreateInput): Promise<Movie>;
  findByTmdbId(tmdbId: number): Promise<Movie | null>;
  findById(id: string): Promise<Movie | null>;
}

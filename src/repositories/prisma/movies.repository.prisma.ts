import { prisma } from '@/lib/prisma';
import type { Prisma, Movie } from 'generated/prisma';

import type { MoviesRepository } from '../movies-repository';

export class MoviesPrismaRepository implements MoviesRepository {
  async findById(id: string): Promise<Movie | null> {
    const movie = await prisma.movie.findUnique({
      where: {
        id,
      },
    });

    return movie;
  }
  async create(data: Prisma.MovieCreateInput): Promise<Movie> {
    const movie = await prisma.movie.create({
      data,
    });
    return movie;
  }

  async findByTmdbId(tmdbId: number): Promise<Movie | null> {
    const movie = await prisma.movie.findUnique({
      where: {
        tmdbId,
      },
    });

    return movie;
  }
}

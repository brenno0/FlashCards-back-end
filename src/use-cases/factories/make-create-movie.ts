import { MoviesPrismaRepository } from '@/repositories/prisma/movies.repository.prisma';

import { CreateMovieUseCase } from '../movies/create-movie-use-case';

export const makeCreateMovies = () => {
  const moviesRepository = new MoviesPrismaRepository();
  const useCase = new CreateMovieUseCase(moviesRepository);

  return { createMovieUseCase: useCase };
};

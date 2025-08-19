import { MoviesPrismaRepository } from '@/repositories/prisma/movies.repository.prisma';
import { WatchListPrismaRepository } from '@/repositories/prisma/watchList.repository.prisma';

import { CreateWatchListUseCase } from '../watchList/create-watchList-use-case';

export const makeCreateWatchList = () => {
  const watchListRepository = new WatchListPrismaRepository();
  const moviesRepository = new MoviesPrismaRepository();
  const useCase = new CreateWatchListUseCase(
    watchListRepository,
    moviesRepository,
  );

  return { useCase };
};

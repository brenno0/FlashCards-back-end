import { WatchListPrismaRepository } from '@/repositories/prisma/watchList.repository.prisma';

import { GetAllWatchListUseCase } from '../watchList/get-all-watchList-use-case';

export const makeGetAllWatchList = () => {
  const watchListRepository = new WatchListPrismaRepository();

  const useCase = new GetAllWatchListUseCase(watchListRepository);

  return { useCase };
};

import { WatchListPrismaRepository } from '@/repositories/prisma/watchList.repository.prisma';

import { DeleteWatchListUseCase } from '../watchList/delete-watchList-use-case';

export const makeDeleteWatchList = () => {
  const watchListRepository = new WatchListPrismaRepository();
  const useCase = new DeleteWatchListUseCase(watchListRepository);

  return { deleteWatchListUseCase: useCase };
};

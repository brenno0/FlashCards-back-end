import type { MoviesRepository } from '@/repositories/movies-repository';
import type { WatchListRepository } from '@/repositories/watchList-repository';

import { ResourceAlreadyExists } from '../errors/resourceAlreadyExists';
import { ResourceNotFoundError } from '../errors/resourceNotFound';

interface ICreateWatchListRequestDTO {
  userId: string;
  movieId: string;
}

export class CreateWatchListUseCase {
  constructor(
    private readonly watchListRepository: WatchListRepository,
    private readonly movieRepository: MoviesRepository,
  ) {}

  async execute({ userId, movieId }: ICreateWatchListRequestDTO): Promise<{
    watchList: void | {
      userId: string;
      movieId: string;
      id: string;
      createdAt: Date;
    };
  }> {
    const watchListAlreadyExists =
      await this.watchListRepository.findMovieByIdAndUserId(movieId, userId);

    const queryMovie = await this.movieRepository.findById(movieId);

    if (!queryMovie) {
      throw new ResourceNotFoundError({ resource: 'Filme' });
    }

    if (watchListAlreadyExists) {
      throw new ResourceAlreadyExists({ resource: 'Filme' });
    }

    const watchList = await this.watchListRepository.create({
      movieId,
      userId,
    });

    return { watchList };
  }
}

import { MoviesRepository } from '@/repositories/movies-repository';
import { Movie } from 'generated/prisma';

interface CreateMovieRequestDTO {
    title: string;
    overview: string;
    tmdbId: number;
    posterPath: string;
    voteAverage: number;
}

export class CreateMovieUseCase {
    constructor(private readonly moviesRepository: MoviesRepository) {}

    async execute({
        title,
        overview,
        tmdbId,
        posterPath,
        voteAverage,
    }: CreateMovieRequestDTO): Promise<Movie> {
        const existentMovie = await this.moviesRepository.findByTmdbId(tmdbId);

        if (existentMovie) return existentMovie;

        const movie = await this.moviesRepository.create({
            title,
            overview,
            posterPath,
            tmdbId,
            voteAverage,
        });

        return movie;
    }
}

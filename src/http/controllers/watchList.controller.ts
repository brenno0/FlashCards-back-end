import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

import { ResourceAlreadyExists } from '@/use-cases/errors/resourceAlreadyExists';
import { ResourceNotFoundError } from '@/use-cases/errors/resourceNotFound';
import { makeCreateWatchList } from '@/use-cases/factories/make-create-watchlist';
import { makeGetAllWatchList } from '@/use-cases/factories/make-get-all-watchList';

export const getAllWatchLists = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { sub: userId } = request.user as { sub: string };

    const querySchema = z.object({
      page: z
        .string()
        .optional()
        .transform((val) => parseInt(String(val), 10)),
      limit: z
        .string()
        .optional()
        .transform((val) => parseInt(String(val), 10)),
      orderBy: z.enum(['createdAt', 'title', 'voteAverage']).optional(),
      orderDirection: z.enum(['asc', 'desc']).optional().default('asc'),
      title: z.string().optional(),
    });

    const { page, limit, orderBy, orderDirection, title } = querySchema.parse(
      request.query,
    );

    const { useCase: getAllWatchListUseCase } = makeGetAllWatchList();

    const watchList = await getAllWatchListUseCase.execute({
      userId,
      page,
      limit,
      orderBy: orderBy
        ? { field: orderBy, direction: orderDirection }
        : undefined,
      params: title ? { title } : undefined,
    });

    return reply.status(200).send(watchList);
  } catch (err) {
    console.error(err);
    reply.status(500).send({
      message: 'Erro Desconhecido no servidor',
      error: 'UnknownError',
    });
  }
};

export const createWatchList = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { sub: userId } = request.user as { sub: string };

    const bodySchema = z.object({
      movieId: z.string(),
    });

    const { movieId } = bodySchema.parse(request.body);

    const { useCase: createWatchListUseCase } = makeCreateWatchList();

    const { watchList } = await createWatchListUseCase.execute({
      userId,
      movieId,
    });

    return reply.status(201).send(watchList);
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: err.message,
        error: 'ResourceNotFound',
      });
    }

    if (err instanceof ResourceAlreadyExists) {
      return reply.status(400).send({
        message: err.message,
        error: 'ResourceNotFound',
      });
    }
  }
};

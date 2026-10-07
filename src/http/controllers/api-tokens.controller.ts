import type { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';

import { ResourceNotFoundError } from '@/use-cases/errors/resourceNotFound';
import { makeApiTokens } from '@/use-cases/factories/make-api-tokens';

const toDto = (apiToken: {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: Date | null;
  createdAt: Date;
}) => ({
  id: apiToken.id,
  name: apiToken.name,
  prefix: apiToken.prefix,
  lastUsedAt: apiToken.lastUsedAt,
  createdAt: apiToken.createdAt,
});

export const getApiTokens = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { sub: userId } = request.user;
  const { getApiTokensUseCase } = makeApiTokens();
  const { apiTokens } = await getApiTokensUseCase.handle({ userId });
  return reply.status(200).send(apiTokens.map(toDto));
};

export const createApiToken = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { name } = z
    .object({ name: z.string().trim().min(1).max(80) })
    .parse(request.body);
  const { sub: userId } = request.user;
  const { createApiTokenUseCase } = makeApiTokens();
  const { apiToken, token } = await createApiTokenUseCase.handle({
    name,
    userId,
  });
  return reply.status(201).send({ ...toDto(apiToken), token });
};

export const deleteApiToken = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { sub: userId } = request.user;
    const { deleteApiTokenUseCase } = makeApiTokens();
    await deleteApiTokenUseCase.handle({ id, userId });
    return reply.status(204).send();
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply
        .status(404)
        .send({ message: error.message, error: 'ResourceNotFoundError' });
    }
    throw error;
  }
};

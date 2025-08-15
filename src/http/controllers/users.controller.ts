import type { FastifyReply, FastifyRequest } from 'fastify';

import { ResourceNotFoundError } from '@/use-cases/errors/resourceNotFound';
import { makeGetUser } from '@/use-cases/factories/make-get-user';

export const getUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { sub } = request.user;
    const getUserUseCase = makeGetUser();

    const { user } = await getUserUseCase.execute({ userId: sub });

    return reply.status(200).send(user);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      reply.status(400).send({
        message: error.message,
        error: 'ResourceNotFoundError',
      });
    }
  }
};

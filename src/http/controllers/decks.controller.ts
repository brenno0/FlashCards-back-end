import type { FastifyRequest, FastifyReply } from 'fastify';
import z from 'zod';

import { ResourceAlreadyExists } from '@/use-cases/errors/resourceAlreadyExists';
import { makeCreateDeck } from '@/use-cases/factories/make-create-deck';

export const createDeck = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const registerBodySchema = z.object({
      title: z.string(),
      description: z.string().optional(),
      isPublic: z.boolean().optional(),
    });
    const { title, description, isPublic } = registerBodySchema.parse(
      request.body,
    );

    const { sub: userId } = request.user;

    const { createDeckUseCase } = makeCreateDeck();

    const { deck } = await createDeckUseCase.handle({
      title,
      description,
      isPublic,
      userId,
    });

    return reply.status(201).send(deck);
  } catch (error) {
    if (error instanceof ResourceAlreadyExists) {
      reply.status(400).send({
        message: error.message,
        error: 'ResourceAlreadyExistsError',
      });
    }
  }
};

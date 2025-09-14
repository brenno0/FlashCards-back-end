/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

import { ResourceNotFoundError } from '@/use-cases/errors/resourceNotFound';
import { makeCreateFlashCards } from '@/use-cases/factories/make-create-flashcards';

export const createFlashCard = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { createFlashCardUseCase } = makeCreateFlashCards();

    const createFlashCardBodySchema = z.object({
      front: z.string(),
      back: z.string(),
    });

    const createFlashCardParamsSchema = z.object({
      deckId: z.string().uuid(),
    });
    const { deckId } = createFlashCardParamsSchema.parse(request.params);
    const { front, back } = createFlashCardBodySchema.parse(request.body);

    const { flashcard } = await createFlashCardUseCase.execute({
      front,
      back,
      deckId,
    });
    return reply.send(flashcard);
  } catch (error: any) {
    if (error instanceof ResourceNotFoundError) {
      reply.status(404).send({
        message: error.message,
        error: 'ResourceNotFoundError',
      });
    }
  }
};

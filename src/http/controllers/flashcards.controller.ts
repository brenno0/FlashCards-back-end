/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

import { ResourceNotFoundError } from '@/use-cases/errors/resourceNotFound';
import { makeCreateFlashCards } from '@/use-cases/factories/make-create-flashcards';
import { makeGetFlashCard } from '@/use-cases/factories/make-get-flashcard';

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
    return reply.status(201).send(flashcard);
  } catch (error: any) {
    if (error instanceof ResourceNotFoundError) {
      reply.status(404).send({
        message: error.message,
        error: 'ResourceNotFoundError',
      });
    }
  }
};

export const getFlashCardUseCase = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { getFlashCardsUseCase } = makeGetFlashCard();

    const getFlashCardsBodySchema = z.object({
      deckId: z.string().uuid(),
    });
    const { deckId } = getFlashCardsBodySchema.parse(request.params);

    const { flashcards } = await getFlashCardsUseCase.execute({
      deckId,
    });

    console.log(flashcards);

    return reply.status(200).send(flashcards);
  } catch (error: any) {
    if (error instanceof ResourceNotFoundError) {
      reply.status(404).send({
        message: error.message,
        error: 'ResourceNotFoundError',
      });
    }
  }
};

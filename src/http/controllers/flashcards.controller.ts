/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

import { ResourceNotFoundError } from '@/use-cases/errors/resourceNotFound';
import { makeCreateFlashCards } from '@/use-cases/factories/make-create-flashcards';
import { makeDeleteFlashcard } from '@/use-cases/factories/make-delete-flashcard';
import { makeEditFlashCard } from '@/use-cases/factories/make-edit-flashcard';
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

export const getFlashCard = async (
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

export const editFlashCard = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { editFlashCardUseCase } = makeEditFlashCard();

    const editFlashcardsParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const editFlashcardsBodySchema = z.object({
      front: z.string().optional(),
      back: z.string().optional(),
    });
    const { id } = editFlashcardsParamsSchema.parse(request.params);
    const { front, back } = editFlashcardsBodySchema.parse(request.body);
    const { flashcard } = await editFlashCardUseCase.execute({
      flashcardId: id,
      front,
      back,
    });

    return reply.status(200).send(flashcard);
  } catch (error: any) {
    if (error instanceof ResourceNotFoundError) {
      reply.status(404).send({
        message: error.message,
        error: 'ResourceNotFoundError',
      });
    }
  }
};

export const deleteFlashCard = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { deleteFlashcardUseCase } = makeDeleteFlashcard();

    const deleteFlashcardParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = deleteFlashcardParamsSchema.parse(request.params);

    await deleteFlashcardUseCase.handle({ id });

    return reply.status(200);
  } catch (error: any) {
    if (error instanceof ResourceNotFoundError) {
      reply.status(404).send({
        message: error.message,
        error: 'ResourceNotFoundError',
      });
    }
  }
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyRequest, FastifyReply } from 'fastify';
import z from 'zod';

import { ResourceNotFoundError } from '@/use-cases/errors/resourceNotFound';
import { makeFinishStudySession } from '@/use-cases/factories/make-finish-study-session';
import { makeStartStudySession } from '@/use-cases/factories/make-start-study-session';

export const startStudySession = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const createFlashCardParamsSchema = z.object({
      deckId: z.string().uuid(),
    });
    const { deckId } = createFlashCardParamsSchema.parse(request.params);
    const { startStudySessionUsecase } = makeStartStudySession();
    const { sub } = request.user;

    const session = await startStudySessionUsecase.handle({
      userId: sub,
      deckId,
    });
    return reply.status(200).send(session);
  } catch (error: any) {
    if (error instanceof ResourceNotFoundError) {
      reply.status(404).send({
        message: error.message,
        error: 'ResourceNotFoundError',
      });
    }
  }
};

export const finishStudySession = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const createFlashCardParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = createFlashCardParamsSchema.parse(request.params);
    const { finishStudySessionUseCase } = makeFinishStudySession();
    const { sub } = request.user;

    const session = await finishStudySessionUseCase.handle({
      userId: sub,
      sessionId: id,
    });
    return reply.status(200).send(session);
  } catch (error: any) {
    if (error instanceof ResourceNotFoundError) {
      reply.status(404).send({
        message: error.message,
        error: 'ResourceNotFoundError',
      });
    }
  }
};

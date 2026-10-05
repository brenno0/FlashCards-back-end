import type { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';

import { BoardContentTooLargeError } from '@/use-cases/errors/boardContentTooLarge';
import { BoardVersionConflictError } from '@/use-cases/errors/boardVersionConflict';
import { InvalidBoardDocumentError } from '@/use-cases/errors/invalidBoardDocument';
import { ResourceNotFoundError } from '@/use-cases/errors/resourceNotFound';
import { makeCreateBoard } from '@/use-cases/factories/make-create-board';
import { makeDeleteBoard } from '@/use-cases/factories/make-delete-board';
import { makeGetBoardById } from '@/use-cases/factories/make-get-board-by-id';
import { makeGetBoards } from '@/use-cases/factories/make-get-boards';
import { makeSaveBoardContent } from '@/use-cases/factories/make-save-board-content';
import { makeUpdateBoardMeta } from '@/use-cases/factories/make-update-board-meta';

const boardParamsSchema = z.object({ id: z.string().uuid() });

/** Maps known board errors to responses; unknown errors bubble to the global handler. */
const handleBoardError = (error: unknown, reply: FastifyReply) => {
  if (error instanceof ResourceNotFoundError) {
    return reply
      .status(404)
      .send({ message: error.message, error: 'ResourceNotFoundError' });
  }
  if (error instanceof BoardVersionConflictError) {
    return reply.status(409).send({
      message: error.message,
      error: 'BoardVersionConflictError',
      currentVersion: error.currentVersion,
    });
  }
  if (error instanceof InvalidBoardDocumentError) {
    return reply
      .status(400)
      .send({ message: error.message, error: 'InvalidBoardDocumentError' });
  }
  if (error instanceof BoardContentTooLargeError) {
    return reply
      .status(413)
      .send({ message: error.message, error: 'BoardContentTooLargeError' });
  }
  throw error;
};

export const createBoard = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { title, deckId } = z
      .object({
        title: z.string().min(1).max(200),
        deckId: z.string().uuid().nullish(),
      })
      .parse(request.body);
    const { sub: userId } = request.user;

    const { createBoardUseCase } = makeCreateBoard();
    const { board } = await createBoardUseCase.handle({
      title,
      deckId,
      userId,
    });

    return reply.status(201).send(board);
  } catch (error) {
    return handleBoardError(error, reply);
  }
};

export const getBoards = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { sub: userId } = request.user;
  const { getBoardsUseCase } = makeGetBoards();
  const { boards } = await getBoardsUseCase.handle({ userId });
  return reply.status(200).send(boards);
};

export const getBoardById = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = boardParamsSchema.parse(request.params);
    const { sub: userId } = request.user;

    const { getBoardByIdUseCase } = makeGetBoardById();
    const { board } = await getBoardByIdUseCase.handle({ boardId: id, userId });

    return reply.status(200).send(board);
  } catch (error) {
    return handleBoardError(error, reply);
  }
};

export const updateBoardMeta = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = boardParamsSchema.parse(request.params);
    const { title, deckId } = z
      .object({
        title: z.string().min(1).max(200).optional(),
        deckId: z.string().uuid().nullish(),
      })
      .parse(request.body);
    const { sub: userId } = request.user;

    const { updateBoardMetaUseCase } = makeUpdateBoardMeta();
    const { board } = await updateBoardMetaUseCase.handle({
      boardId: id,
      userId,
      title,
      deckId,
    });

    return reply.status(200).send(board);
  } catch (error) {
    return handleBoardError(error, reply);
  }
};

export const saveBoardContent = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = boardParamsSchema.parse(request.params);
    const { content, version } = z
      .object({ content: z.unknown(), version: z.number().int().positive() })
      .parse(request.body);
    const { sub: userId } = request.user;

    const { saveBoardContentUseCase } = makeSaveBoardContent();
    const result = await saveBoardContentUseCase.handle({
      boardId: id,
      userId,
      content,
      version,
    });

    return reply.status(200).send(result);
  } catch (error) {
    return handleBoardError(error, reply);
  }
};

export const deleteBoard = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = boardParamsSchema.parse(request.params);
    const { sub: userId } = request.user;

    const { deleteBoardUseCase } = makeDeleteBoard();
    await deleteBoardUseCase.handle({ boardId: id, userId });

    return reply.status(204).send();
  } catch (error) {
    return handleBoardError(error, reply);
  }
};

import type { FastifyRequest, FastifyReply } from 'fastify';
import z from 'zod';

import { InvalidFolderMoveError } from '@/use-cases/errors/invalidFolderMove';
import { ResourceAlreadyExists } from '@/use-cases/errors/resourceAlreadyExists';
import { ResourceNotFoundError } from '@/use-cases/errors/resourceNotFound';
import { makeCreateDeck } from '@/use-cases/factories/make-create-deck';
import { makeDeleteDeckById } from '@/use-cases/factories/make-delete-deck-by-id';
import { makeGetAllDecks } from '@/use-cases/factories/make-get-all-decks';
import { makeGetDeckById } from '@/use-cases/factories/make-get-deck-by-id';
import { makeUpdateDeckById } from '@/use-cases/factories/make-update-deck-by-id';

export const createDeck = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const registerBodySchema = z.object({
      title: z.string(),
      description: z.string().optional(),
      isPublic: z.boolean().optional(),
      folderId: z.string().uuid().nullish(),
    });
    const { title, description, isPublic, folderId } = registerBodySchema.parse(
      request.body,
    );

    const { sub: userId } = request.user;

    const { createDeckUseCase } = makeCreateDeck();

    const { deck } = await createDeckUseCase.handle({
      title,
      description,
      isPublic,
      folderId,
      userId,
    });

    return reply.status(201).send(deck);
  } catch (error) {
    if (error instanceof ResourceAlreadyExists) {
      return reply.status(400).send({
        message: error.message,
        error: 'ResourceAlreadyExistsError',
      });
    }
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: error.message,
        error: 'ResourceNotFoundError',
      });
    }
    if (error instanceof InvalidFolderMoveError) {
      return reply.status(400).send({
        message: error.message,
        error: 'InvalidFolderMoveError',
      });
    }
    throw error;
  }
};

export const getAllDecks = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { createDeckUseCase } = makeGetAllDecks();

    const registerBodySchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      isPublic: z.boolean().optional(),
      /** A folder id, or `root` for decks outside any folder. Omit to list every deck. */
      folderId: z.union([z.literal('root'), z.string().uuid()]).optional(),
      page: z.coerce.number().optional(),
      pageSize: z.coerce.number().optional(),
    });

    const { title, description, isPublic, folderId, page, pageSize } =
      registerBodySchema.parse(request.query);

    const { sub: userId } = request.user;

    const { decks } = await createDeckUseCase.handle({
      userId,
      title,
      description,
      isPublic,
      folderId: folderId === 'root' ? null : folderId,
      page,
      pageSize,
    });
    return reply.status(200).send(decks);
  } catch (error) {
    if (error instanceof Error || error instanceof ResourceNotFoundError) {
      reply.status(400).send({
        message: error.message,
        error: 'ResourceAlreadyExistsError',
      });
    }
  }
};

export const getDeckById = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { getByIdDeckUseCase } = makeGetDeckById();

    const registerBodySchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = registerBodySchema.parse(request.params);
    const { sub } = request.user;
    const { deck } = await getByIdDeckUseCase.handle({
      deckId: id,
      userId: sub,
    });
    return reply.status(200).send(deck);
  } catch (error) {
    if (error instanceof Error || error instanceof ResourceNotFoundError) {
      reply.status(400).send({
        message: error.message,
        error: 'ResourceAlreadyExistsError',
      });
    }
  }
};

export const updateDeckById = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { updateDeckById } = makeUpdateDeckById();

    const decksParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const decksBodySchema = z.object({
      description: z.string().optional(),
      title: z.string().optional(),
      isPublic: z.boolean().optional(),
      folderId: z.string().uuid().nullish(),
    });

    const { id } = decksParamsSchema.parse(request.params);
    const { description, isPublic, title, folderId } = decksBodySchema.parse(
      request.body,
    );
    const { sub } = request.user;

    const { updatedDeck } = await updateDeckById.handle({
      deckId: id,
      data: {
        description,
        isPublic,
        title,
      },
      folderId,
      userId: sub,
    });
    return reply.status(200).send(updatedDeck);
  } catch (error) {
    if (error instanceof Error || error instanceof ResourceNotFoundError) {
      reply.status(400).send({
        message: error.message,
        error: 'ResourceAlreadyExistsError',
      });
    }
  }
};

export const deleteDeckById = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { deleteDecksByIdUseCase } = makeDeleteDeckById();
    const decksParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = decksParamsSchema.parse(request.params);

    const { sub } = request.user;

    await deleteDecksByIdUseCase.handle({ deckId: id, userId: sub });
    return reply.status(200).send('Deck deletado com sucesso');
  } catch (error) {
    if (error instanceof Error || error instanceof ResourceNotFoundError) {
      reply.status(400).send({
        message: error.message,
        error: 'ResourceNotFoundError',
      });
    }
  }
};

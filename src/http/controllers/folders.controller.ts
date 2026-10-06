import type { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';

import { InvalidFolderMoveError } from '@/use-cases/errors/invalidFolderMove';
import { ResourceNotFoundError } from '@/use-cases/errors/resourceNotFound';
import { makeCreateFolder } from '@/use-cases/factories/make-create-folder';
import { makeDeleteFolder } from '@/use-cases/factories/make-delete-folder';
import { makeGetFolders } from '@/use-cases/factories/make-get-folders';
import { makeUpdateFolder } from '@/use-cases/factories/make-update-folder';

const folderParamsSchema = z.object({ id: z.string().uuid() });
const folderKindSchema = z.enum(['DECK', 'BOARD']);
const folderNameSchema = z.string().trim().min(1).max(120);

/** Maps known folder errors to responses; unknown errors bubble to the global handler. */
export const handleFolderError = (error: unknown, reply: FastifyReply) => {
  if (error instanceof ResourceNotFoundError) {
    return reply
      .status(404)
      .send({ message: error.message, error: 'ResourceNotFoundError' });
  }
  if (error instanceof InvalidFolderMoveError) {
    return reply
      .status(400)
      .send({ message: error.message, error: 'InvalidFolderMoveError' });
  }
  throw error;
};

export const getFolders = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { kind } = z
    .object({ kind: folderKindSchema.optional() })
    .parse(request.query);
  const { sub: userId } = request.user;
  const { getFoldersUseCase } = makeGetFolders();
  const { folders } = await getFoldersUseCase.handle({ userId, kind });
  return reply.status(200).send(folders);
};

export const createFolder = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { name, kind, parentId } = z
      .object({
        name: folderNameSchema,
        kind: folderKindSchema,
        parentId: z.string().uuid().nullish(),
      })
      .parse(request.body);
    const { sub: userId } = request.user;

    const { createFolderUseCase } = makeCreateFolder();
    const { folder } = await createFolderUseCase.handle({
      name,
      kind,
      parentId,
      userId,
    });

    return reply.status(201).send(folder);
  } catch (error) {
    return handleFolderError(error, reply);
  }
};

export const updateFolder = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = folderParamsSchema.parse(request.params);
    const { name, parentId } = z
      .object({
        name: folderNameSchema.optional(),
        parentId: z.string().uuid().nullish(),
      })
      .parse(request.body);
    const { sub: userId } = request.user;

    const { updateFolderUseCase } = makeUpdateFolder();
    const { folder } = await updateFolderUseCase.handle({
      folderId: id,
      userId,
      name,
      parentId,
    });

    return reply.status(200).send(folder);
  } catch (error) {
    return handleFolderError(error, reply);
  }
};

export const deleteFolder = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = folderParamsSchema.parse(request.params);
    const { sub: userId } = request.user;

    const { deleteFolderUseCase } = makeDeleteFolder();
    await deleteFolderUseCase.handle({ folderId: id, userId });

    return reply.status(204).send();
  } catch (error) {
    return handleFolderError(error, reply);
  }
};

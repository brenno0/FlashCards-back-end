import type { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';

import { StorageUnavailableError } from '@/lib/storage/storage-provider';
import {
  FILE_MAX_BYTES,
  IMAGE_MAX_BYTES,
} from '@/use-cases/boards/upload-board-asset-use-case';
import { ResourceNotFoundError } from '@/use-cases/errors/resourceNotFound';
import { UnsupportedAssetTypeError } from '@/use-cases/errors/unsupportedAssetType';
import { makeGetBoardAsset } from '@/use-cases/factories/make-get-board-asset';
import { makeUploadBoardAsset } from '@/use-cases/factories/make-upload-board-asset';

const handleAssetError = (error: unknown, reply: FastifyReply) => {
  if (error instanceof ResourceNotFoundError) {
    return reply
      .status(404)
      .send({ message: error.message, error: 'ResourceNotFoundError' });
  }
  if (error instanceof UnsupportedAssetTypeError) {
    return reply
      .status(415)
      .send({ message: error.message, error: 'UnsupportedAssetTypeError' });
  }
  if (error instanceof StorageUnavailableError) {
    console.error(error, error.cause);
    return reply
      .status(503)
      .send({ message: error.message, error: 'StorageUnavailableError' });
  }
  throw error;
};

/** RFC 6266 filename with ASCII fallback. */
const contentDisposition = (
  type: 'inline' | 'attachment',
  fileName: string,
) => {
  const fallback = fileName
    .replace(/[^\x20-\x7e]/g, '_')
    .replace(/["\\]/g, '_');
  return `${type}; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
};

export const uploadBoardAsset = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { kind } = z
      .object({ kind: z.enum(['image', 'file']) })
      .parse(request.query);
    const { sub: userId } = request.user;

    const data = await request.file({
      limits: {
        files: 1,
        fileSize: kind === 'image' ? IMAGE_MAX_BYTES : FILE_MAX_BYTES,
      },
    });
    if (!data) {
      return reply
        .status(400)
        .send({ message: 'Envie um arquivo', error: 'MissingFileError' });
    }
    const body = await data.toBuffer();

    const { uploadBoardAssetUseCase } = makeUploadBoardAsset();
    const { asset } = await uploadBoardAssetUseCase.handle({
      boardId: id,
      userId,
      kind,
      fileName: data.filename,
      declaredMimeType: data.mimetype,
      body,
    });

    return reply.status(201).send({
      assetId: asset.id,
      kind: asset.kind,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      size: asset.size,
    });
  } catch (error) {
    return handleAssetError(error, reply);
  }
};

export const getBoardAsset = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id, assetId } = z
      .object({ id: z.string().uuid(), assetId: z.string().uuid() })
      .parse(request.params);
    const { sub: userId } = request.user;

    const { getBoardAssetUseCase } = makeGetBoardAsset();
    const { asset, stream } = await getBoardAssetUseCase.handle({
      boardId: id,
      assetId,
      userId,
    });

    const isImage = asset.kind === 'IMAGE';
    return reply
      .header('Content-Type', asset.mimeType)
      .header('Content-Length', asset.size)
      .header('X-Content-Type-Options', 'nosniff')
      .header('Cache-Control', 'private, max-age=31536000, immutable')
      .header(
        'Content-Disposition',
        contentDisposition(isImage ? 'inline' : 'attachment', asset.fileName),
      )
      .header('Content-Security-Policy', "default-src 'none'; sandbox")
      .send(stream);
  } catch (error) {
    return handleAssetError(error, reply);
  }
};

import { randomUUID } from 'node:crypto';

import {
  IMAGE_MIME_TYPES,
  resolveFileMimeType,
  sniffMimeType,
} from '@/lib/storage/sniff-mime-type';
import type { StorageProvider } from '@/lib/storage/storage-provider';
import type { BoardAssetsRepository } from '@/repositories/board-assets-repository';
import type { BoardsRepository } from '@/repositories/boards-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';
import { UnsupportedAssetTypeError } from '../errors/unsupportedAssetType';

export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const FILE_MAX_BYTES = 25 * 1024 * 1024;

interface UploadBoardAssetUseCaseRequest {
  boardId: string;
  userId: string;
  kind: 'image' | 'file';
  fileName: string;
  declaredMimeType?: string;
  body: Buffer;
}

/** Keeps a readable display name; strips path parts and control characters. */
const sanitizeFileName = (fileName: string) => {
  const base = fileName.split(/[\\/]/).pop() ?? '';
  const clean = [...base]
    .filter(
      (char) => char.charCodeAt(0) >= 0x20 && char !== '\u007f' && char !== '"',
    )
    .join('')
    .trim()
    .slice(0, 255);
  return clean || 'arquivo';
};

export class UploadBoardAssetUseCase {
  constructor(
    private readonly boardsRepository: BoardsRepository,
    private readonly boardAssetsRepository: BoardAssetsRepository,
    private readonly storage: StorageProvider,
  ) {}

  async handle({
    boardId,
    userId,
    kind,
    fileName,
    declaredMimeType,
    body,
  }: UploadBoardAssetUseCaseRequest) {
    const board = await this.boardsRepository.findById({ boardId, userId });
    if (!board) {
      throw new ResourceNotFoundError({ resource: 'Board' });
    }

    let mimeType: string;
    if (kind === 'image') {
      const sniffed = sniffMimeType(body);
      if (
        !sniffed ||
        !(IMAGE_MIME_TYPES as readonly string[]).includes(sniffed)
      ) {
        throw new UnsupportedAssetTypeError();
      }
      mimeType = sniffed;
    } else {
      mimeType = resolveFileMimeType(body, declaredMimeType);
    }

    const assetId = randomUUID();
    const storageKey = await this.storage.put({
      key: `boards/${boardId}/${assetId}`,
      body,
      mimeType,
    });

    const asset = await this.boardAssetsRepository.create({
      id: assetId,
      boardId,
      userId,
      kind: kind === 'image' ? 'IMAGE' : 'FILE',
      storageKey,
      fileName: sanitizeFileName(fileName),
      mimeType,
      size: body.length,
      // Orphaned until a save references it, so abandoned uploads get cleaned up.
      orphanedAt: new Date(),
    });

    return { asset };
  }
}

import type { BoardAssetsRepository } from '@/repositories/board-assets-repository';
import type { BoardsRepository } from '@/repositories/boards-repository';

import { BoardContentTooLargeError } from '../errors/boardContentTooLarge';
import { BoardVersionConflictError } from '../errors/boardVersionConflict';
import { InvalidBoardDocumentError } from '../errors/invalidBoardDocument';
import { ResourceNotFoundError } from '../errors/resourceNotFound';

import {
  BOARD_CONTENT_MAX_BYTES,
  boardDocumentSchema,
  collectAssetIds,
  validateBoardGraph,
} from './board-document';

interface SaveBoardContentUseCaseRequest {
  boardId: string;
  userId: string;
  content: unknown;
  version: number;
}

export class SaveBoardContentUseCase {
  constructor(
    private readonly boardsRepository: BoardsRepository,
    private readonly boardAssetsRepository: BoardAssetsRepository,
  ) {}

  async handle({
    boardId,
    userId,
    content,
    version,
  }: SaveBoardContentUseCaseRequest) {
    if (
      Buffer.byteLength(JSON.stringify(content ?? null)) >
      BOARD_CONTENT_MAX_BYTES
    ) {
      throw new BoardContentTooLargeError(BOARD_CONTENT_MAX_BYTES);
    }

    const parsed = boardDocumentSchema.safeParse(content);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new InvalidBoardDocumentError(
        `${issue.path.join('.')}: ${issue.message}`,
      );
    }
    const document = parsed.data;

    const graphError = validateBoardGraph(document);
    if (graphError) {
      throw new InvalidBoardDocumentError(graphError);
    }

    const board = await this.boardsRepository.findById({ boardId, userId });
    if (!board) {
      throw new ResourceNotFoundError({ resource: 'Board' });
    }

    const referencedAssetIds = collectAssetIds(document);
    if (referencedAssetIds.length > 0) {
      const ownedAssetIds = new Set(
        await this.boardsRepository.listAssetIds({ boardId }),
      );
      const unknown = referencedAssetIds.find((id) => !ownedAssetIds.has(id));
      if (unknown) {
        throw new InvalidBoardDocumentError(
          `Asset "${unknown}" does not belong to this board`,
        );
      }
    }

    const newVersion = await this.boardsRepository.saveContent({
      boardId,
      userId,
      content: document,
      expectedVersion: version,
    });

    if (newVersion === null) {
      const current = await this.boardsRepository.findById({ boardId, userId });
      if (!current) {
        throw new ResourceNotFoundError({ resource: 'Board' });
      }
      throw new BoardVersionConflictError(current.version);
    }

    await this.boardAssetsRepository.syncOrphans({
      boardId,
      referencedIds: referencedAssetIds,
      now: new Date(),
    });

    return { version: newVersion };
  }
}

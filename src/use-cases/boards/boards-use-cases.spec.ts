import { randomUUID } from 'node:crypto';

import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryStorageProvider } from '@/lib/storage/in-memory-storage-provider';
import { InMemoryBoardAssetsRepository } from '@/repositories/in-memory/in-memory-board-assets-repository';
import { InMemoryBoardsRepository } from '@/repositories/in-memory/in-memory-boards-repository';
import { InMemoryDecksRepository } from '@/repositories/in-memory/in-memory-decks-repository';

import { BoardContentTooLargeError } from '../errors/boardContentTooLarge';
import { BoardVersionConflictError } from '../errors/boardVersionConflict';
import { InvalidBoardDocumentError } from '../errors/invalidBoardDocument';
import { ResourceNotFoundError } from '../errors/resourceNotFound';

import { EMPTY_BOARD_DOCUMENT } from './board-document';
import { CreateBoardUseCase } from './create-board-use-case';
import { DeleteBoardUseCase } from './delete-board-use-case';
import { GetBoardByIdUseCase } from './get-board-by-id-use-case';
import { GetBoardsUseCase } from './get-boards-use-case';
import { SaveBoardContentUseCase } from './save-board-content-use-case';
import { UpdateBoardMetaUseCase } from './update-board-meta-use-case';

const USER = 'user-1';
const OTHER_USER = 'user-2';

let boards: InMemoryBoardsRepository;
let decks: InMemoryDecksRepository;
let assets: InMemoryBoardAssetsRepository;
let storage: InMemoryStorageProvider;

const sectionDoc = {
  ...EMPTY_BOARD_DOCUMENT,
  nodes: [
    {
      id: 's1',
      type: 'section',
      position: { x: 0, y: 0 },
      data: { title: 'S' },
    },
    {
      id: 'i1',
      type: 'icon',
      position: { x: 5, y: 5 },
      parentId: 's1',
      data: { icon: 'book', label: 'Cell' },
    },
  ],
  edges: [{ id: 'e1', source: 'i1', target: 's1', label: 'in' }],
};

beforeEach(() => {
  boards = new InMemoryBoardsRepository();
  decks = new InMemoryDecksRepository();
  assets = new InMemoryBoardAssetsRepository();
  storage = new InMemoryStorageProvider();
});

const createBoard = (userId = USER, deckId?: string) =>
  new CreateBoardUseCase(boards, decks).handle({
    title: 'Bio',
    userId,
    deckId,
  });

describe('CreateBoardUseCase', () => {
  it('creates board with empty document and version 1', async () => {
    const { board } = await createBoard();
    expect(board.version).toBe(1);
    expect(board.deckId).toBeNull();
    expect(board.content).toEqual(EMPTY_BOARD_DOCUMENT);
  });

  it('links own deck', async () => {
    const deck = await decks.create({ title: 'D', userId: USER });
    const { board } = await createBoard(USER, deck.id);
    expect(board.deckId).toBe(deck.id);
  });

  it('rejects foreign or missing deck without creating board', async () => {
    const foreign = await decks.create({ title: 'D', userId: OTHER_USER });
    await expect(createBoard(USER, foreign.id)).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
    await expect(createBoard(USER, randomUUID())).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
    expect(boards.items).toHaveLength(0);
  });
});

describe('GetBoardsUseCase', () => {
  it('lists only own boards without content, newest first', async () => {
    const { board: first } = await createBoard();
    const { board: second } = await createBoard();
    await createBoard(OTHER_USER);
    second.updatedAt = new Date(first.updatedAt.getTime() + 1000);

    const { boards: list } = await new GetBoardsUseCase(boards).handle({
      userId: USER,
    });

    expect(list.map((b) => b.id)).toEqual([second.id, first.id]);
    expect(list[0]).not.toHaveProperty('content');
  });
});

describe('GetBoardByIdUseCase', () => {
  it('returns 404 error for another user board', async () => {
    const { board } = await createBoard(OTHER_USER);
    await expect(
      new GetBoardByIdUseCase(boards).handle({
        boardId: board.id,
        userId: USER,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

describe('SaveBoardContentUseCase', () => {
  const save = (
    boardId: string,
    content: unknown,
    version: number,
    userId = USER,
  ) =>
    new SaveBoardContentUseCase(boards, assets).handle({
      boardId,
      userId,
      content,
      version,
    });

  it('saves valid content and bumps version', async () => {
    const { board } = await createBoard();
    const result = await save(board.id, sectionDoc, 1);
    expect(result.version).toBe(2);

    const { board: stored } = await new GetBoardByIdUseCase(boards).handle({
      boardId: board.id,
      userId: USER,
    });
    expect(stored.content).toEqual(sectionDoc);
  });

  it('rejects stale version with current version and keeps content', async () => {
    const { board } = await createBoard();
    await save(board.id, sectionDoc, 1);

    const error = await save(board.id, EMPTY_BOARD_DOCUMENT, 1).catch((e) => e);

    expect(error).toBeInstanceOf(BoardVersionConflictError);
    expect((error as BoardVersionConflictError).currentVersion).toBe(2);
    expect(boards.items[0].content).toEqual(sectionDoc);
  });

  it('rejects invalid graph', async () => {
    const { board } = await createBoard();
    const childFirst = {
      ...sectionDoc,
      nodes: [...sectionDoc.nodes].reverse(),
    };
    await expect(save(board.id, childFirst, 1)).rejects.toBeInstanceOf(
      InvalidBoardDocumentError,
    );
    await expect(save(board.id, { nope: true }, 1)).rejects.toBeInstanceOf(
      InvalidBoardDocumentError,
    );
    expect(boards.items[0].version).toBe(1);
  });

  it('rejects asset not belonging to board', async () => {
    const { board } = await createBoard();
    const assetId = randomUUID();
    const withImage = {
      ...EMPTY_BOARD_DOCUMENT,
      nodes: [
        {
          id: 'img',
          type: 'image',
          position: { x: 0, y: 0 },
          data: { assetId, width: 1, height: 1 },
        },
      ],
    };

    await expect(save(board.id, withImage, 1)).rejects.toBeInstanceOf(
      InvalidBoardDocumentError,
    );

    boards.assets.set(board.id, [assetId]);
    await expect(save(board.id, withImage, 1)).resolves.toEqual({ version: 2 });
  });

  it('rejects content over 2 MB', async () => {
    const { board } = await createBoard();
    const huge = {
      ...EMPTY_BOARD_DOCUMENT,
      nodes: [
        {
          id: 't',
          type: 'text',
          position: { x: 0, y: 0 },
          data: { text: 'x'.repeat(2 * 1024 * 1024) },
        },
      ],
    };
    await expect(save(board.id, huge, 1)).rejects.toBeInstanceOf(
      BoardContentTooLargeError,
    );
  });

  it('returns not found for another user board', async () => {
    const { board } = await createBoard(OTHER_USER);
    await expect(save(board.id, sectionDoc, 1)).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});

describe('UpdateBoardMetaUseCase', () => {
  it('renames and unlinks deck without changing version', async () => {
    const deck = await decks.create({ title: 'D', userId: USER });
    const { board } = await createBoard(USER, deck.id);

    const { board: updated } = await new UpdateBoardMetaUseCase(
      boards,
      decks,
    ).handle({
      boardId: board.id,
      userId: USER,
      title: 'X',
      deckId: null,
    });

    expect(updated.title).toBe('X');
    expect(updated.deckId).toBeNull();
    expect(updated.version).toBe(1);
  });

  it('rejects foreign deck', async () => {
    const foreign = await decks.create({ title: 'D', userId: OTHER_USER });
    const { board } = await createBoard();
    await expect(
      new UpdateBoardMetaUseCase(boards, decks).handle({
        boardId: board.id,
        userId: USER,
        deckId: foreign.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

describe('DeleteBoardUseCase', () => {
  it('deletes own board, then it is not found', async () => {
    const { board } = await createBoard();
    await new DeleteBoardUseCase(boards, assets, storage).handle({
      boardId: board.id,
      userId: USER,
    });
    await expect(
      new GetBoardByIdUseCase(boards).handle({
        boardId: board.id,
        userId: USER,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('does not delete another user board', async () => {
    const { board } = await createBoard(OTHER_USER);
    await expect(
      new DeleteBoardUseCase(boards, assets, storage).handle({
        boardId: board.id,
        userId: USER,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
    expect(boards.items).toHaveLength(1);
  });
});

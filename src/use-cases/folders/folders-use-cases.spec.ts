import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryBoardsRepository } from '@/repositories/in-memory/in-memory-boards-repository';
import { InMemoryDecksRepository } from '@/repositories/in-memory/in-memory-decks-repository';
import { InMemoryFoldersRepository } from '@/repositories/in-memory/in-memory-folders-repository';

import { CreateBoardUseCase } from '../boards/create-board-use-case';
import { CreateDeckUseCase } from '../decks/create-deck-use-case';
import { InvalidFolderMoveError } from '../errors/invalidFolderMove';
import { ResourceNotFoundError } from '../errors/resourceNotFound';

import { CreateFolderUseCase } from './create-folder-use-case';
import { DeleteFolderUseCase } from './delete-folder-use-case';
import { GetFoldersUseCase } from './get-folders-use-case';
import { UpdateFolderUseCase } from './update-folder-use-case';

const USER = 'user-1';
const OTHER_USER = 'user-2';

let folders: InMemoryFoldersRepository;
let decks: InMemoryDecksRepository;
let boards: InMemoryBoardsRepository;

beforeEach(() => {
  folders = new InMemoryFoldersRepository();
  decks = new InMemoryDecksRepository();
  boards = new InMemoryBoardsRepository();
  folders.onContentsMoved = (from, to) => {
    decks.items
      .filter((deck) => deck.folderId === from)
      .forEach((deck) => (deck.folderId = to));
    boards.items
      .filter((board) => board.folderId === from)
      .forEach((board) => (board.folderId = to));
  };
});

const createFolder = (
  name: string,
  kind: 'DECK' | 'BOARD' = 'DECK',
  parentId?: string,
  userId = USER,
) =>
  new CreateFolderUseCase(folders)
    .handle({ name, kind, parentId, userId })
    .then(({ folder }) => folder);

describe('CreateFolderUseCase', () => {
  it('creates nested folders of the same kind', async () => {
    const parent = await createFolder('Biology');
    const child = await createFolder('Cells', 'DECK', parent.id);
    expect(child.parentId).toBe(parent.id);
  });

  it('rejects a parent of another kind', async () => {
    const boardFolder = await createFolder('Maps', 'BOARD');
    await expect(
      createFolder('Cells', 'DECK', boardFolder.id),
    ).rejects.toBeInstanceOf(InvalidFolderMoveError);
  });

  it("rejects another user's parent", async () => {
    const foreign = await createFolder('Theirs', 'DECK', undefined, OTHER_USER);
    await expect(
      createFolder('Mine', 'DECK', foreign.id),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

describe('GetFoldersUseCase', () => {
  it('lists only the requested kind for the user', async () => {
    await createFolder('Decks A');
    await createFolder('Boards A', 'BOARD');
    await createFolder('Other', 'DECK', undefined, OTHER_USER);
    const { folders: list } = await new GetFoldersUseCase(folders).handle({
      userId: USER,
      kind: 'DECK',
    });
    expect(list.map((folder) => folder.name)).toEqual(['Decks A']);
  });
});

describe('UpdateFolderUseCase', () => {
  it('renames and moves a folder', async () => {
    const a = await createFolder('A');
    const b = await createFolder('B');
    const { folder } = await new UpdateFolderUseCase(folders).handle({
      folderId: b.id,
      userId: USER,
      name: 'B2',
      parentId: a.id,
    });
    expect(folder).toMatchObject({ name: 'B2', parentId: a.id });
  });

  it('refuses to move a folder inside its own subtree', async () => {
    const a = await createFolder('A');
    const b = await createFolder('B', 'DECK', a.id);
    const c = await createFolder('C', 'DECK', b.id);
    const update = new UpdateFolderUseCase(folders);
    await expect(
      update.handle({ folderId: a.id, userId: USER, parentId: c.id }),
    ).rejects.toBeInstanceOf(InvalidFolderMoveError);
    await expect(
      update.handle({ folderId: a.id, userId: USER, parentId: a.id }),
    ).rejects.toBeInstanceOf(InvalidFolderMoveError);
  });

  it('moves a folder back to the top level with null', async () => {
    const a = await createFolder('A');
    const b = await createFolder('B', 'DECK', a.id);
    const { folder } = await new UpdateFolderUseCase(folders).handle({
      folderId: b.id,
      userId: USER,
      parentId: null,
    });
    expect(folder.parentId).toBeNull();
  });
});

describe('DeleteFolderUseCase', () => {
  it('keeps contents by moving them to the parent folder', async () => {
    const parent = await createFolder('Parent');
    const doomed = await createFolder('Doomed', 'DECK', parent.id);
    const child = await createFolder('Child', 'DECK', doomed.id);
    const { deck } = await new CreateDeckUseCase(decks, folders).handle({
      title: 'Mitosis',
      userId: USER,
      folderId: doomed.id,
    });

    await new DeleteFolderUseCase(folders).handle({
      folderId: doomed.id,
      userId: USER,
    });

    expect(folders.items.find((item) => item.id === doomed.id)).toBeUndefined();
    expect(folders.items.find((item) => item.id === child.id)?.parentId).toBe(
      parent.id,
    );
    expect(decks.items.find((item) => item.id === deck.id)?.folderId).toBe(
      parent.id,
    );
  });

  it("can't delete another user's folder", async () => {
    const foreign = await createFolder('Theirs', 'DECK', undefined, OTHER_USER);
    await expect(
      new DeleteFolderUseCase(folders).handle({
        folderId: foreign.id,
        userId: USER,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

describe('filing decks and boards', () => {
  it('rejects a board in a deck folder', async () => {
    const deckFolder = await createFolder('Decks');
    await expect(
      new CreateBoardUseCase(boards, decks, folders).handle({
        title: 'Map',
        userId: USER,
        folderId: deckFolder.id,
      }),
    ).rejects.toBeInstanceOf(InvalidFolderMoveError);
  });

  it('files a board in a board folder', async () => {
    const boardFolder = await createFolder('Maps', 'BOARD');
    const { board } = await new CreateBoardUseCase(
      boards,
      decks,
      folders,
    ).handle({
      title: 'Map',
      userId: USER,
      folderId: boardFolder.id,
    });
    expect(board.folderId).toBe(boardFolder.id);
  });
});

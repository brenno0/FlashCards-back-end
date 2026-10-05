import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryStorageProvider } from '@/lib/storage/in-memory-storage-provider';
import { InMemoryBoardAssetsRepository } from '@/repositories/in-memory/in-memory-board-assets-repository';
import { InMemoryBoardsRepository } from '@/repositories/in-memory/in-memory-boards-repository';

import { EMPTY_BOARD_DOCUMENT } from './board-document';
import {
  CleanupOrphanedAssetsUseCase,
  ORPHAN_GRACE_MS,
} from './cleanup-orphaned-assets-use-case';
import { DeleteBoardUseCase } from './delete-board-use-case';
import { SaveBoardContentUseCase } from './save-board-content-use-case';
import { UploadBoardAssetUseCase } from './upload-board-asset-use-case';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);
const USER = 'u1';

let boards: InMemoryBoardsRepository;
let assets: InMemoryBoardAssetsRepository;
let storage: InMemoryStorageProvider;
let boardId: string;
let version: number;

const uploadImage = async () => {
  const { asset } = await new UploadBoardAssetUseCase(
    boards,
    assets,
    storage,
  ).handle({
    boardId,
    userId: USER,
    kind: 'image',
    fileName: 'a.png',
    body: PNG,
  });
  // keep BoardsRepository asset ownership view in sync with the assets repo
  boards.assets.set(
    boardId,
    assets.items.map((item) => item.id),
  );
  return asset;
};

const saveWithImages = async (assetIds: string[]) => {
  ({ version } = await new SaveBoardContentUseCase(boards, assets).handle({
    boardId,
    userId: USER,
    version,
    content: {
      ...EMPTY_BOARD_DOCUMENT,
      nodes: assetIds.map((assetId, index) => ({
        id: `img${index}`,
        type: 'image',
        position: { x: 0, y: 0 },
        data: { assetId, width: 1, height: 1 },
      })),
    },
  }));
};

const cleanup = (now: Date) =>
  new CleanupOrphanedAssetsUseCase(assets, storage).handle({ now });

const later = (ms: number) => new Date(Date.now() + ms);

beforeEach(async () => {
  boards = new InMemoryBoardsRepository();
  assets = new InMemoryBoardAssetsRepository();
  storage = new InMemoryStorageProvider();
  ({ id: boardId, version } = await boards.create({
    title: 'B',
    userId: USER,
    content: EMPTY_BOARD_DOCUMENT,
  }));
});

describe('asset orphan lifecycle', () => {
  it('new uploads start orphaned and are cleared by the first save referencing them', async () => {
    const asset = await uploadImage();
    expect(asset.orphanedAt).not.toBeNull();

    await saveWithImages([asset.id]);
    expect(assets.items[0].orphanedAt).toBeNull();
  });

  it('removes an asset unreferenced for more than 24h from storage and DB', async () => {
    const asset = await uploadImage();
    await saveWithImages([asset.id]);
    await saveWithImages([]);

    expect(await cleanup(later(ORPHAN_GRACE_MS - 60_000))).toEqual({
      deleted: 0,
      failed: 0,
    });
    expect(await cleanup(later(ORPHAN_GRACE_MS + 60_000))).toEqual({
      deleted: 1,
      failed: 0,
    });
    expect(storage.objects.size).toBe(0);
    expect(assets.items).toHaveLength(0);
  });

  it('keeps an asset restored by undo within the grace period', async () => {
    const asset = await uploadImage();
    await saveWithImages([asset.id]);
    await saveWithImages([]);
    await saveWithImages([asset.id]);

    expect(await cleanup(later(2 * ORPHAN_GRACE_MS))).toEqual({
      deleted: 0,
      failed: 0,
    });
    expect(storage.objects.size).toBe(1);
  });

  it('cleans uploads that were never saved', async () => {
    await uploadImage();
    expect((await cleanup(later(ORPHAN_GRACE_MS + 1))).deleted).toBe(1);
  });

  it('keeps the row for retry when storage deletion fails', async () => {
    await uploadImage();
    storage.delete = async () => {
      throw new Error('drive down');
    };
    expect(await cleanup(later(ORPHAN_GRACE_MS + 1))).toEqual({
      deleted: 0,
      failed: 1,
    });
    expect(assets.items).toHaveLength(1);
  });

  it('deleting a board removes its stored files', async () => {
    await uploadImage();
    await new DeleteBoardUseCase(boards, assets, storage).handle({
      boardId,
      userId: USER,
    });
    expect(storage.objects.size).toBe(0);
  });
});

import type { Readable } from 'node:stream';

import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryStorageProvider } from '@/lib/storage/in-memory-storage-provider';
import { resolveFileMimeType } from '@/lib/storage/sniff-mime-type';
import { InMemoryBoardAssetsRepository } from '@/repositories/in-memory/in-memory-board-assets-repository';
import { InMemoryBoardsRepository } from '@/repositories/in-memory/in-memory-boards-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';
import { UnsupportedAssetTypeError } from '../errors/unsupportedAssetType';

import { EMPTY_BOARD_DOCUMENT } from './board-document';
import { GetBoardAssetUseCase } from './get-board-asset-use-case';
import { UploadBoardAssetUseCase } from './upload-board-asset-use-case';

const PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3,
]);
const PDF = Buffer.from('%PDF-1.7 hello');

let boards: InMemoryBoardsRepository;
let assets: InMemoryBoardAssetsRepository;
let storage: InMemoryStorageProvider;
let boardId: string;

const upload = (
  input: Partial<Parameters<UploadBoardAssetUseCase['handle']>[0]>,
) =>
  new UploadBoardAssetUseCase(boards, assets, storage).handle({
    boardId,
    userId: 'u1',
    kind: 'image',
    fileName: 'a.png',
    body: PNG,
    ...input,
  });

const readAll = async (stream: Readable) => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

beforeEach(async () => {
  boards = new InMemoryBoardsRepository();
  assets = new InMemoryBoardAssetsRepository();
  storage = new InMemoryStorageProvider();
  ({ id: boardId } = await boards.create({
    title: 'B',
    userId: 'u1',
    content: EMPTY_BOARD_DOCUMENT,
  }));
});

describe('UploadBoardAssetUseCase', () => {
  it('stores image with sniffed mime type and returns byte-identical download', async () => {
    const { asset } = await upload({ declaredMimeType: 'image/gif' });

    expect(asset.kind).toBe('IMAGE');
    expect(asset.mimeType).toBe('image/png');
    expect(asset.size).toBe(PNG.length);

    const { stream } = await new GetBoardAssetUseCase(assets, storage).handle({
      boardId,
      assetId: asset.id,
      userId: 'u1',
    });
    expect(await readAll(stream)).toEqual(PNG);
  });

  it('rejects non-image bytes declared as image', async () => {
    await expect(
      upload({
        body: Buffer.from('<svg onload=alert(1)>'),
        declaredMimeType: 'image/svg+xml',
      }),
    ).rejects.toBeInstanceOf(UnsupportedAssetTypeError);
    expect(storage.objects.size).toBe(0);
  });

  it('stores files with safe mime type and sanitized name', async () => {
    const { asset } = await upload({
      kind: 'file',
      body: PDF,
      fileName: '../../etc/"notes".pdf',
      declaredMimeType: 'text/html',
    });
    expect(asset.kind).toBe('FILE');
    expect(asset.mimeType).toBe('application/pdf');
    expect(asset.fileName).toBe('notes.pdf');
  });

  it('rejects upload to another user board', async () => {
    await expect(upload({ userId: 'u2' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});

describe('GetBoardAssetUseCase', () => {
  it('does not serve another user asset', async () => {
    const { asset } = await upload({});
    await expect(
      new GetBoardAssetUseCase(assets, storage).handle({
        boardId,
        assetId: asset.id,
        userId: 'u2',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});

describe('resolveFileMimeType', () => {
  it('never trusts declared html/js', () => {
    expect(resolveFileMimeType(Buffer.from('<html>'), 'text/html')).toBe(
      'application/octet-stream',
    );
    expect(resolveFileMimeType(Buffer.from('a,b'), 'text/csv')).toBe(
      'text/csv',
    );
    expect(
      resolveFileMimeType(
        Buffer.from([0x50, 0x4b, 0x03, 0x04]),
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ),
    ).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
  });
});

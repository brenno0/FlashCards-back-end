import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { LocalDiskStorageProvider } from './local-disk-storage-provider';

let root: string;
let storage: LocalDiskStorageProvider;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'storage-'));
  storage = new LocalDiskStorageProvider(root);
});

afterEach(() => rm(root, { recursive: true, force: true }));

describe('LocalDiskStorageProvider', () => {
  it('puts, gets and deletes idempotently', async () => {
    const key = await storage.put({
      key: 'boards/b/a',
      body: Buffer.from('hi'),
      mimeType: 'text/plain',
    });
    const chunks: Buffer[] = [];
    for await (const chunk of await storage.get(key)) {
      chunks.push(chunk as Buffer);
    }
    expect(Buffer.concat(chunks).toString()).toBe('hi');
    await storage.delete(key);
    await storage.delete(key);
    await expect(storage.get(key)).rejects.toThrow();
  });

  it('rejects path traversal keys', async () => {
    await expect(
      storage.put({
        key: '../escape',
        body: Buffer.from('x'),
        mimeType: 'text/plain',
      }),
    ).rejects.toThrow(/Invalid storage key/);
  });
});

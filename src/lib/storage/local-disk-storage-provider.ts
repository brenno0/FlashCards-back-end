import { createReadStream } from 'node:fs';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Readable } from 'node:stream';

import type { PutObjectInput, StorageProvider } from './storage-provider';
import { StorageUnavailableError } from './storage-provider';

export class LocalDiskStorageProvider implements StorageProvider {
  private readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
  }

  /** Resolves a key under root; rejects traversal. */
  private resolve(key: string): string {
    if (!/^[A-Za-z0-9/_.-]+$/.test(key) || key.includes('..')) {
      throw new Error(`Invalid storage key "${key}"`);
    }
    const target = path.resolve(this.root, key);
    if (!target.startsWith(this.root + path.sep)) {
      throw new Error(`Invalid storage key "${key}"`);
    }
    return target;
  }

  async put({ key, body }: PutObjectInput): Promise<string> {
    const target = this.resolve(key);
    try {
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, body);
    } catch (error) {
      throw new StorageUnavailableError(error);
    }
    return key;
  }

  async get(key: string): Promise<Readable> {
    const target = this.resolve(key);
    try {
      await stat(target);
    } catch (error) {
      throw new StorageUnavailableError(error);
    }
    return createReadStream(target);
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolve(key), { force: true });
  }
}

import { Readable } from 'node:stream';

import type { PutObjectInput, StorageProvider } from './storage-provider';
import { StorageUnavailableError } from './storage-provider';

export class InMemoryStorageProvider implements StorageProvider {
  public objects = new Map<string, Buffer>();

  async put({ key, body }: PutObjectInput): Promise<string> {
    this.objects.set(key, body);
    return key;
  }

  async get(key: string): Promise<Readable> {
    const body = this.objects.get(key);
    if (!body) {
      throw new StorageUnavailableError();
    }
    return Readable.from(body);
  }

  async delete(key: string): Promise<void> {
    this.objects.delete(key);
  }
}

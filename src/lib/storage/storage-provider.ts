import type { Readable } from 'node:stream';

export interface PutObjectInput {
  /** Suggested key/name; providers may ignore it and return their own. */
  key: string;
  body: Buffer;
  mimeType: string;
}

export interface StorageProvider {
  /** Stores the object and returns the provider key used for later get/delete. */
  put(input: PutObjectInput): Promise<string>;
  get(key: string): Promise<Readable>;
  /** Idempotent: deleting a missing object succeeds. */
  delete(key: string): Promise<void>;
}

export class StorageUnavailableError extends Error {
  constructor(public readonly cause?: unknown) {
    super('Armazenamento de arquivos indisponível');
  }
}

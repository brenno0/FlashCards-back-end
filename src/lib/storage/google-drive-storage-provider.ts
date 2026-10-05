import { Readable } from 'node:stream';

import { auth, drive_v3 } from '@googleapis/drive';

import type { PutObjectInput, StorageProvider } from './storage-provider';
import { StorageUnavailableError } from './storage-provider';

export interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  folderId: string;
}

const RETRY_CONFIG = {
  retry: 3,
  statusCodesToRetry: [
    [429, 429],
    [500, 599],
  ],
};

const statusOf = (error: unknown): number | undefined =>
  (error as { code?: number; status?: number })?.status ??
  (error as { code?: number })?.code;

/**
 * Stores files privately in one app-owned Drive folder of the owner's account
 * (OAuth refresh token, scope drive.file). Files are never shared; the API streams them.
 */
export class GoogleDriveStorageProvider implements StorageProvider {
  private readonly drive: drive_v3.Drive;

  constructor(private readonly config: GoogleDriveConfig) {
    const client = new auth.OAuth2(config.clientId, config.clientSecret);
    client.setCredentials({ refresh_token: config.refreshToken });
    this.drive = new drive_v3.Drive({ auth: client });
  }

  async put({ key, body, mimeType }: PutObjectInput): Promise<string> {
    try {
      const { data } = await this.drive.files.create(
        {
          requestBody: { name: key, parents: [this.config.folderId] },
          media: { mimeType, body: Readable.from(body) },
          fields: 'id',
        },
        { retryConfig: RETRY_CONFIG },
      );
      if (!data.id) {
        throw new Error('Drive returned no file id');
      }
      return data.id;
    } catch (error) {
      throw new StorageUnavailableError(error);
    }
  }

  async get(key: string): Promise<Readable> {
    try {
      const response = await this.drive.files.get(
        { fileId: key, alt: 'media' },
        { responseType: 'stream', retryConfig: RETRY_CONFIG },
      );
      return response.data as unknown as Readable;
    } catch (error) {
      throw new StorageUnavailableError(error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.drive.files.delete(
        { fileId: key },
        { retryConfig: RETRY_CONFIG },
      );
    } catch (error) {
      if (statusOf(error) === 404) {
        return;
      }
      throw new StorageUnavailableError(error);
    }
  }
}

import { env } from '@/env';

import { GoogleDriveStorageProvider } from './google-drive-storage-provider';
import { LocalDiskStorageProvider } from './local-disk-storage-provider';
import type { StorageProvider } from './storage-provider';

let instance: StorageProvider | null = null;

export const getStorageProvider = (): StorageProvider => {
  if (instance) {
    return instance;
  }

  const {
    STORAGE_DRIVER,
    GDRIVE_CLIENT_ID,
    GDRIVE_CLIENT_SECRET,
    GDRIVE_REFRESH_TOKEN,
    GDRIVE_FOLDER_ID,
  } = env;

  // env validation guarantees the GDRIVE_* values when the driver is gdrive
  instance =
    STORAGE_DRIVER === 'gdrive' &&
    GDRIVE_CLIENT_ID &&
    GDRIVE_CLIENT_SECRET &&
    GDRIVE_REFRESH_TOKEN &&
    GDRIVE_FOLDER_ID
      ? new GoogleDriveStorageProvider({
          clientId: GDRIVE_CLIENT_ID,
          clientSecret: GDRIVE_CLIENT_SECRET,
          refreshToken: GDRIVE_REFRESH_TOKEN,
          folderId: GDRIVE_FOLDER_ID,
        })
      : new LocalDiskStorageProvider(env.STORAGE_LOCAL_ROOT);

  return instance;
};

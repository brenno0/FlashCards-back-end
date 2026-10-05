import { app } from './app';
import { env } from './env';
import { startCleanupOrphanedAssetsJob } from './jobs/cleanup-orphaned-assets-job';

app
  .listen({
    port: env.PORT,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('Server is running!');
    startCleanupOrphanedAssetsJob();
    if (env.NODE_ENV === 'production' && env.STORAGE_DRIVER === 'local') {
      console.warn(
        'STORAGE_DRIVER=local in production: board uploads are stored inside the container ' +
          'and lost on redeploy unless STORAGE_LOCAL_ROOT is a mounted volume. Set STORAGE_DRIVER=gdrive.',
      );
    }
  });

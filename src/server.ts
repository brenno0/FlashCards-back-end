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
  });

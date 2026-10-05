import { makeCleanupOrphanedAssets } from '@/use-cases/factories/make-cleanup-orphaned-assets';

const INTERVAL_MS = 60 * 60 * 1000;

/** Hourly in-process cleanup (single back-end instance). Returns a stop function. */
export const startCleanupOrphanedAssetsJob = () => {
  let running = false;

  const run = async () => {
    if (running) {
      return;
    }
    running = true;
    try {
      const { cleanupOrphanedAssetsUseCase } = makeCleanupOrphanedAssets();
      const { deleted, failed } = await cleanupOrphanedAssetsUseCase.handle();
      if (deleted || failed) {
        console.warn(
          `Orphaned assets cleanup: ${deleted} deleted, ${failed} failed`,
        );
      }
    } catch (error) {
      console.error('Orphaned assets cleanup failed', error);
    } finally {
      running = false;
    }
  };

  const timer = setInterval(run, INTERVAL_MS);
  timer.unref();
  return () => clearInterval(timer);
};

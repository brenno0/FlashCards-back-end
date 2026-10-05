import { parseMetadata } from '@/lib/link-preview/parse-metadata';
import { safeFetch } from '@/lib/link-preview/safe-fetch';

import { GetLinkPreviewUseCase } from '../link-preview/get-link-preview-use-case';

// Singleton: the use-case holds the in-memory cache and rate-limit state.
let instance: GetLinkPreviewUseCase | null = null;

export const makeGetLinkPreview = () => {
  instance ??= new GetLinkPreviewUseCase(async (url) => {
    const page = await safeFetch(url);
    return parseMetadata(page.body, page.url);
  });
  return { getLinkPreviewUseCase: instance };
};

import type { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';

import { RateLimitedError } from '@/use-cases/errors/rateLimited';
import { makeGetLinkPreview } from '@/use-cases/factories/make-get-link-preview';

export const getLinkPreview = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { url } = z.object({ url: z.string().url() }).parse(request.body);
    const { sub: userId } = request.user;

    const { getLinkPreviewUseCase } = makeGetLinkPreview();
    const preview = await getLinkPreviewUseCase.handle({ url, userId });

    return reply.status(200).send(preview);
  } catch (error) {
    if (error instanceof RateLimitedError) {
      return reply
        .status(429)
        .send({ message: error.message, error: 'RateLimitedError' });
    }
    throw error;
  }
};

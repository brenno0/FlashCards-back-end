import type { FastifyReply, FastifyRequest } from 'fastify';

import { isApiToken } from '@/use-cases/api-tokens/api-token-secret';
import { makeApiTokens } from '@/use-cases/factories/make-api-tokens';

const bearerToken = (request: FastifyRequest) => {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
  return scheme === 'Bearer' && token ? token : null;
};

/** Accepts a session JWT or a personal access token (`fct_...`). */
export const verifyJWT = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const token = bearerToken(request);
  if (token && isApiToken(token)) {
    const { authenticateApiTokenUseCase } = makeApiTokens();
    const result = await authenticateApiTokenUseCase.handle({ token });
    if (!result) {
      return reply.status(401).send({ message: 'Unauthorized.' });
    }
    request.user = { sub: result.userId };
    return;
  }
  return verifySessionJWT(request, reply);
};

/** Session JWT only, so a leaked access token cannot mint or revoke other tokens. */
export const verifySessionJWT = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    return await request.jwtVerify();
  } catch {
    reply.status(401).send({ message: 'Unauthorized.' });
  }
};

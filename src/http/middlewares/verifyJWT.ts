import type { FastifyReply, FastifyRequest } from 'fastify';

export const verifyJWT = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    return await request.jwtVerify();
  } catch {
    reply.status(401).send({ message: 'Unauthorized.' });
  }
};

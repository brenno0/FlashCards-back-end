import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { InvalidCredentialsError } from '@/use-cases/errors/invalidCretendials';
import { UserAlreadyExistsError } from '@/use-cases/errors/userAlreadyExists';
import { makeAuthenticateUser } from '@/use-cases/factories/make-authenticate-user';
import { makeCreateUser } from '@/use-cases/factories/make-create-user';

export const createUser = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const registerBodySchema = z.object({
      name: z.string(),
      email: z.string().email('Please insert an valid e-mail.'),
      password: z.string().min(6),
    });
    const { name, email, password } = registerBodySchema.parse(request.body);

    const { createUserUseCase } = makeCreateUser();

    const { user } = await createUserUseCase.execute({
      name,
      email,
      password,
    });

    return reply.status(201).send(user);
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      reply.status(400).send({
        message: error.message,
        error: 'UserAlreadyExistsErrortest',
      });
    }
  }
};

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const authenticateBodySchema = z.object({
      email: z.string().email('Por favor insira um e-mail válido'),
      password: z.string().min(6),
    });

    const { email, password } = authenticateBodySchema.parse(request.body);
    const { authenticateUseCase } = makeAuthenticateUser();

    const { user } = await authenticateUseCase.handle({
      email,
      password,
    });

    const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
        },
      },
    );

    return reply.status(200).send({ token });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      reply.status(401).send({
        message: err.message,
        error: 'InvalidCredentialsError',
      });
    }
    throw err;
  }
};

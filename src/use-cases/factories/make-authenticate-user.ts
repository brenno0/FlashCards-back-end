import { UsersPrismaRepository } from '@/repositories/prisma/users.repository.prisma';

import { AuthenticateUseCase } from '../users/authenticate';

export const makeAuthenticateUser = () => {
  const usersRepository = new UsersPrismaRepository();
  const authenticateUseCase = new AuthenticateUseCase(usersRepository);

  return { authenticateUseCase };
};

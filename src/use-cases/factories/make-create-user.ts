import { UsersPrismaRepository } from '@/repositories/prisma/users.repository.prisma';

import { CreateUsersUseCase } from '../users/createUsersUseCase';

export const makeCreateUser = () => {
  const usersRepository = new UsersPrismaRepository();
  const createUserUseCase = new CreateUsersUseCase(usersRepository);

  return { createUserUseCase };
};

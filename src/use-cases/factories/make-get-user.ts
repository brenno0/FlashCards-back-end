import { UsersPrismaRepository } from '@/repositories/prisma/users.repository.prisma';
import { GetUserUseCase } from '../users/getUser';

export const makeGetUser = () => {
    const userRepository = new UsersPrismaRepository();
    const useCase = new GetUserUseCase(userRepository);

    return useCase;
};

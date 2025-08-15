/* eslint-disable @typescript-eslint/no-unused-vars */
import { ResourceNotFoundError } from '../errors/resourceNotFound';

import type { UsersRepository } from '@/repositories/users-repository';

export class GetUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute({ userId }: { userId: string }) {
    const user = await this.usersRepository.getUserById(userId);

    if (!user) {
      throw new ResourceNotFoundError({ resource: 'User' });
    }

    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword };
  }
}

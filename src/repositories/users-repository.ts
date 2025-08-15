import type { Prisma, User } from 'generated/prisma';

export interface UsersRepository {
  create(data: Prisma.UserCreateInput): Promise<User>;
  getUserById(userId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

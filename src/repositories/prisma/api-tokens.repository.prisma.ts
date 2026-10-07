import { prisma } from '@/lib/prisma';
import type { ApiToken } from 'generated/prisma';

import type { ApiTokensRepository } from '../api-tokens-repository';

export class ApiTokensPrismaRepository implements ApiTokensRepository {
  async create(data: {
    name: string;
    tokenHash: string;
    prefix: string;
    userId: string;
  }): Promise<ApiToken> {
    return prisma.apiToken.create({ data });
  }

  async listByUser({ userId }: { userId: string }): Promise<ApiToken[]> {
    return prisma.apiToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByHash({
    tokenHash,
  }: {
    tokenHash: string;
  }): Promise<ApiToken | null> {
    return prisma.apiToken.findUnique({ where: { tokenHash } });
  }

  async touch({ id, at }: { id: string; at: Date }): Promise<void> {
    await prisma.apiToken.updateMany({
      where: { id },
      data: { lastUsedAt: at },
    });
  }

  async delete({ id, userId }: { id: string; userId: string }) {
    const { count } = await prisma.apiToken.deleteMany({
      where: { id, userId },
    });
    return count > 0;
  }
}

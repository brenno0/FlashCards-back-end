import { randomUUID } from 'node:crypto';

import type { ApiToken } from 'generated/prisma';

import type { ApiTokensRepository } from '../api-tokens-repository';

export class InMemoryApiTokensRepository implements ApiTokensRepository {
  public items: ApiToken[] = [];

  async create(data: {
    name: string;
    tokenHash: string;
    prefix: string;
    userId: string;
  }): Promise<ApiToken> {
    const token: ApiToken = {
      id: randomUUID(),
      ...data,
      lastUsedAt: null,
      createdAt: new Date(),
    };
    this.items.push(token);
    return token;
  }

  async listByUser({ userId }: { userId: string }): Promise<ApiToken[]> {
    return this.items.filter((item) => item.userId === userId);
  }

  async findByHash({
    tokenHash,
  }: {
    tokenHash: string;
  }): Promise<ApiToken | null> {
    return this.items.find((item) => item.tokenHash === tokenHash) ?? null;
  }

  async touch({ id, at }: { id: string; at: Date }): Promise<void> {
    const token = this.items.find((item) => item.id === id);
    if (token) {
      token.lastUsedAt = at;
    }
  }

  async delete({ id, userId }: { id: string; userId: string }) {
    const before = this.items.length;
    this.items = this.items.filter(
      (item) => !(item.id === id && item.userId === userId),
    );
    return this.items.length < before;
  }
}

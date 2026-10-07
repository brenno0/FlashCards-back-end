import type { ApiToken } from 'generated/prisma';

export interface ApiTokensRepository {
  create(data: {
    name: string;
    tokenHash: string;
    prefix: string;
    userId: string;
  }): Promise<ApiToken>;
  listByUser({ userId }: { userId: string }): Promise<ApiToken[]>;
  findByHash({ tokenHash }: { tokenHash: string }): Promise<ApiToken | null>;
  touch({ id, at }: { id: string; at: Date }): Promise<void>;
  /** Returns false when the token does not exist or belongs to another user. */
  delete({ id, userId }: { id: string; userId: string }): Promise<boolean>;
}

import type { Deck, Prisma } from 'generated/prisma';

export interface DecksRepository {
  create(data: Prisma.DeckUncheckedCreateInput): Promise<Omit<Deck, 'userId'>>;
  findByTitle(title: string): Promise<Deck | null>;
}

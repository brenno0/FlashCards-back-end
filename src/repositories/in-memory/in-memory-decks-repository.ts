import { randomUUID } from 'node:crypto';

import type { Deck, Prisma } from 'generated/prisma';

import type {
  DecksRepository,
  GetAllFilters,
  GetAllResponse,
} from '../decks-repository';

export class InMemoryDecksRepository implements DecksRepository {
  public items: Deck[] = [];

  async create(
    data: Prisma.DeckUncheckedCreateInput,
  ): Promise<Omit<Deck, 'userId'>> {
    const now = new Date();
    const deck: Deck = {
      id: data.id ?? randomUUID(),
      title: data.title,
      description: data.description ?? null,
      isPublic: data.isPublic ?? false,
      userId: data.userId,
      createdAt: now,
      updatedAt: now,
    };
    this.items.push(deck);
    return deck;
  }

  async findByTitle(title: string, userId: string): Promise<Deck | null> {
    return (
      this.items.find(
        (item) => item.title === title && item.userId === userId,
      ) ?? null
    );
  }

  async getAll({
    userId,
    page = 1,
    pageSize = 20,
  }: {
    userId: string;
    filters: GetAllFilters;
    page?: number;
    pageSize?: number;
  }): Promise<GetAllResponse> {
    const data = this.items
      .filter((item) => item.userId === userId)
      .slice((page - 1) * pageSize, page * pageSize);
    return { data, count: data.length, page, pageSize };
  }

  async getById({
    deckId,
    userId,
  }: {
    deckId: string;
    userId: string;
  }): Promise<Omit<Deck, 'userId'> | null> {
    return (
      this.items.find((item) => item.id === deckId && item.userId === userId) ??
      null
    );
  }

  async update(): Promise<Omit<Deck, 'userId'> | null> {
    throw new Error('Not implemented');
  }

  async delete({ deckId }: { deckId: string }): Promise<void> {
    this.items = this.items.filter((item) => item.id !== deckId);
  }
}

import type { Deck, Prisma } from 'generated/prisma';

export interface GetAllFilters {
  description?: string | null;
  isPublic?: boolean;
  title?: string;
}

export interface GetAllResponse {
  data: Deck[];
  count: number;
  page: number;
  pageSize: number;
}

export interface DecksRepository {
  create(data: Prisma.DeckUncheckedCreateInput): Promise<Omit<Deck, 'userId'>>;
  findByTitle(title: string, userId: string): Promise<Deck | null>;
  getAll({
    userId,
    page,
    pageSize,
    filters,
  }: {
    userId: string;
    filters: GetAllFilters;
    page?: number;
    pageSize?: number;
  }): Promise<GetAllResponse>;
  getById({
    deckId,
    userId,
  }: {
    deckId: string;
    userId: string;
  }): Promise<Omit<Deck, 'userId'> | null>;
}

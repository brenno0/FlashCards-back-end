/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';
import type { Deck, Prisma } from 'generated/prisma';

import type {
  DecksRepository,
  GetAllFilters,
  GetAllResponse,
} from '../decks-repository';

export class DecksPrismaRepository implements DecksRepository {
  async getById({
    deckId,
    userId,
  }: {
    deckId: string;
    userId: string;
  }): Promise<Omit<Deck, 'userId'> | null> {
    const deck = await prisma.deck.findUnique({
      where: {
        id: deckId,
        userId,
      },
      include: {
        flashcards: true,
        tags: true,
        studySessions: true,
      },
      omit: {
        userId: true,
      },
    });

    return deck;
  }

  async getAll({
    userId,
    filters,
    page = 1,
    pageSize = 20,
  }: {
    userId: string;
    filters: GetAllFilters;
    page?: number;
    pageSize?: number;
  }): Promise<GetAllResponse> {
    const where: any = { userId };

    if (filters.description) {
      where.description = {
        contains: filters.description,
        mode: 'insensitive',
      };
    }

    if (filters.title) {
      where.title = { contains: filters.title, mode: 'insensitive' };
    }

    if (typeof filters.isPublic === 'boolean') {
      where.isPublic = filters.isPublic;
    }

    const decks = await prisma.deck.findMany({
      where,
      include: {
        _count: true,
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    return {
      data: decks,
      count: decks.length,
      page,
      pageSize,
    };
  }

  async findByTitle(title: string, userId: string): Promise<Deck | null> {
    const deck = await prisma.deck.findFirst({
      where: {
        userId,
        title,
      },
    });
    return deck;
  }
  async create(
    data: Prisma.DeckUncheckedCreateInput,
  ): Promise<Omit<Deck, 'userId'>> {
    const deck = await prisma.deck.create({
      data,
      select: {
        _count: true,
        createdAt: true,
        description: true,
        id: true,
        isPublic: true,
        title: true,
        updatedAt: true,
      },
    });

    return deck;
  }
  async update({
    data,
    deckId,
  }: {
    data: Prisma.DeckUpdateInput;
    deckId: string;
    userId: string;
  }): Promise<Omit<Deck, 'userId'> | null> {
    const deck = await prisma.deck.update({
      data,
      where: {
        id: deckId,
      },
    });

    return deck;
  }

  async delete({ deckId }: { deckId: string }): Promise<void> {
    await prisma.deck.delete({
      where: {
        id: deckId,
      },
    });
  }
}

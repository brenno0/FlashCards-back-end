import { prisma } from '@/lib/prisma';
import type { Deck, Prisma } from 'generated/prisma';

import type { DecksRepository } from '../decks-repository';

export class DecksPrismaRepository implements DecksRepository {
  async findByTitle(title: string): Promise<Deck | null> {
    const deck = await prisma.deck.findFirst({
      where: {
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
}

import { prisma } from '@/lib/prisma';
import type { Prisma, Flashcard } from 'generated/prisma';

import type { FlashCardsRepository } from '../flashcards-repository';

export class PrismaFlashCardsRepository implements FlashCardsRepository {
  async getByDeckId({
    deckId,
  }: {
    deckId: string;
  }): Promise<Flashcard[] | null> {
    const flashcards = prisma.flashcard.findMany({
      where: {
        deckId,
      },
    });

    return flashcards;
  }
  async create(data: Prisma.FlashcardUncheckedCreateInput): Promise<Flashcard> {
    const flashcard = await prisma.flashcard.create({
      data,
    });

    return flashcard;
  }
}

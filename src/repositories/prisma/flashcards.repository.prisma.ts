import { prisma } from '@/lib/prisma';
import type { Prisma, Flashcard } from 'generated/prisma';

import type { FlashCardsRepository } from '../flashcards-repository';

export class PrismaFlashCardsRepository implements FlashCardsRepository {
  async create(data: Prisma.FlashcardUncheckedCreateInput): Promise<Flashcard> {
    const flashcard = await prisma.flashcard.create({
      data,
    });

    return flashcard;
  }
}

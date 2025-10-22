/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';
import type { Prisma, Flashcard } from 'generated/prisma';

import type { FlashCardsRepository } from '../flashcards-repository';

export class PrismaFlashCardsRepository implements FlashCardsRepository {
  async getById({
    flashcardId,
  }: {
    flashcardId: string;
  }): Promise<Flashcard | null> {
    const flashcard = await prisma.flashcard.findUnique({
      where: {
        id: flashcardId,
      },
    });

    return flashcard;
  }
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

  async edit({
    flashcardId,
    back,
    front,
  }: {
    flashcardId: string;
    back?: string | null;
    front?: string | null;
  }): Promise<Flashcard | null> {
    const data: any = {};

    if (front !== undefined) {
      data.front = front;
    }

    if (back !== undefined) {
      data.back = back;
    }

    const flashcard = await prisma.flashcard.update({
      where: {
        id: flashcardId,
      },
      data,
      select: {
        front: true,
        back: true,
        deckId: true,
        id: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return flashcard;
  }

  async deleteFlashcardById({ id }: { id: string }): Promise<void> {
    await prisma.flashcard.delete({
      where: {
        id,
      },
    });
  }
}

import { prisma } from '@/lib/prisma';
import type { FlashcardProgress, Prisma } from 'generated/prisma';

import type {
  FlashcardProgressWithFlashcard,
  FlashcardsProgressRepository,
} from '../flashcard-progress-repository';

export class FlashcardsProgressPrismaRepository
  implements FlashcardsProgressRepository
{
  async findMany({
    userId,
    deckId,
    nextReviewAt,
    take,
  }: {
    userId: string;
    deckId: string;
    nextReviewAt: Date;
    take: number;
  }): Promise<FlashcardProgressWithFlashcard[]> {
    const progress = await prisma.flashcardProgress.findMany({
      where: {
        userId,
        flashcard: {
          deckId,
        },
        nextReviewAt: {
          lte: nextReviewAt,
        },
      },
      include: {
        flashcard: true,
      },
      orderBy: {
        nextReviewAt: 'asc',
      },
      take,
    });

    return progress;
  }

  async findUnique({
    userId,
    flashcardId,
  }: {
    userId: string;
    flashcardId: string;
  }): Promise<FlashcardProgress | null> {
    const flashcardProgress = await prisma.flashcardProgress.findUnique({
      where: {
        userId_flashcardId: {
          userId,
          flashcardId,
        },
      },
    });

    return flashcardProgress;
  }
  async create(
    data: Prisma.FlashcardProgressUncheckedCreateInput,
  ): Promise<FlashcardProgress> {
    const createdProgress = await prisma.flashcardProgress.create({ data });

    return createdProgress;
  }
  async update(
    id: string,
    data: Prisma.FlashcardProgressUncheckedUpdateInput,
  ): Promise<FlashcardProgress> {
    const updatedProgress = await prisma.flashcardProgress.update({
      where: { id },
      data,
    });

    return updatedProgress;
  }
}

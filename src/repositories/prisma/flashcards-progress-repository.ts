import { prisma } from '@/lib/prisma';
import type { FlashcardProgress, Prisma } from 'generated/prisma';

import type { FlashcardsProgressRepository } from '../flashcard-progress-repository';

export class FlashcardsProgressPrismaRepository
  implements FlashcardsProgressRepository {
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
    const createdProgress = await prisma.flashcardProgress.create({
      data: {
        userId: data.userId,
        flashcardId: data.flashcardId,
        status: 'NEW',
        nextReviewAt: data.nextReviewAt,
        interval: 0,
        repetitions: 0,
        easeFactor: 2.5,
        lastStudiedAt: null,
      },
    });

    return createdProgress;
  }
  async update(
    id: string,
    data: Prisma.FlashcardProgressUncheckedUpdateInput,
  ): Promise<FlashcardProgress> {
    const updatedProgress = await prisma.flashcardProgress.update({
      where: { id },
      data: {
        status: data.status,
        lastStudiedAt: data.lastStudiedAt,
        nextReviewAt: data.nextReviewAt,
        repetitions: data.repetitions,
        interval: data.interval,
        easeFactor: data.easeFactor,
      },
    });

    return updatedProgress;
  }
}

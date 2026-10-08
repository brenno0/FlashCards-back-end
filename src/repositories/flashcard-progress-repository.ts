import type { FlashcardProgress, Prisma } from 'generated/prisma';

export type FlashcardProgressWithFlashcard =
  Prisma.FlashcardProgressGetPayload<{
    include: { flashcard: true };
  }>;

export interface FlashcardsProgressRepository {
  findUnique({
    userId,
    flashcardId,
  }: {
    userId: string;
    flashcardId: string;
  }): Promise<FlashcardProgress | null>;

  /** Progress due at or before `nextReviewAt`, most overdue first. */
  findMany({
    userId,
    deckId,
    nextReviewAt,
    take,
  }: {
    userId: string;
    deckId: string;
    nextReviewAt: Date;
    take: number;
  }): Promise<FlashcardProgressWithFlashcard[]>;
  create(
    data: Prisma.FlashcardProgressUncheckedCreateInput,
  ): Promise<FlashcardProgress>;

  update(
    id: string,
    data: Prisma.FlashcardProgressUncheckedUpdateInput,
  ): Promise<FlashcardProgress>;
}

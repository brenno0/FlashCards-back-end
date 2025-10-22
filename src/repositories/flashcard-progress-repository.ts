import type { FlashcardProgress, Prisma } from 'generated/prisma';

export interface FlashcardsProgressRepository {
  findUnique({
    userId,
    flashcardId,
  }: {
    userId: string;
    flashcardId: string;
  }): Promise<FlashcardProgress | null>;
  create(
    data: Prisma.FlashcardProgressUncheckedCreateInput,
  ): Promise<FlashcardProgress>;

  update(
    id: string,
    data: Prisma.FlashcardProgressUncheckedUpdateInput,
  ): Promise<FlashcardProgress>;
}

import type { Flashcard, Prisma } from 'generated/prisma';

export interface FlashCardsRepository {
  findManyWithNoProgress({
    deckId,
    userId,
    take,
    existingFlashcardIds,
  }: {
    deckId: string;
    userId: string;
    take: number;
    existingFlashcardIds: string[];
  }): Promise<Flashcard[]>;
  create(data: Prisma.FlashcardUncheckedCreateInput): Promise<Flashcard>;
  /** Returns how many cards were inserted. */
  createMany(data: Prisma.FlashcardCreateManyInput[]): Promise<number>;
  getByDeckId({ deckId }: { deckId: string }): Promise<Flashcard[] | null>;
  getById({ flashcardId }: { flashcardId: string }): Promise<Flashcard | null>;

  edit({
    flashcardId,
    back,
    front,
  }: {
    flashcardId: string;
    back?: string | null;
    front?: string | null;
  }): Promise<Flashcard | null>;

  deleteFlashcardById({ id }: { id: string }): Promise<void>;
}

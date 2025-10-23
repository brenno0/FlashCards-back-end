import type { Flashcard, Prisma } from 'generated/prisma';

export interface FlashCardsRepository {
  findManyWithNoProgress({
    deckId,
    userId,
    quantityOfCardsToTake,
    existingFlashcardIds,
  }: {
    deckId: string;
    userId: string;
    quantityOfCardsToTake: number;
    existingFlashcardIds: string[];
  }): Promise<Flashcard[]>;
  create(data: Prisma.FlashcardUncheckedCreateInput): Promise<Flashcard>;
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

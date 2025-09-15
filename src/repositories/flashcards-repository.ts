import type { Flashcard, Prisma } from 'generated/prisma';

export interface FlashCardsRepository {
  create(data: Prisma.FlashcardUncheckedCreateInput): Promise<Flashcard>;
  getByDeckId({ deckId }: { deckId: string }): Promise<Flashcard[] | null>;
}

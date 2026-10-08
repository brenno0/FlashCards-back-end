import { review } from '@/lib/fsrs/scheduler';
import type { FlashcardsProgressRepository } from '@/repositories/flashcard-progress-repository';
import type { FlashcardProgress } from 'generated/prisma';

export interface FlashcardProgressIdentifier {
  flashcardId: string;
  userId: string;
}

export interface UpdateFlashcardProgressRequest
  extends FlashcardProgressIdentifier {
  quality: number;
}

/** Records one answer and reschedules the card with FSRS. */
export class UpdateFlashcardProgressUseCase {
  constructor(
    private readonly flashcardProgressRepository: FlashcardsProgressRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async handle({
    flashcardId,
    userId,
    quality,
  }: UpdateFlashcardProgressRequest): Promise<FlashcardProgress> {
    const now = this.now();
    const existing = await this.flashcardProgressRepository.findUnique({
      flashcardId,
      userId,
    });

    const next = review(existing, quality, now);

    if (existing) {
      return this.flashcardProgressRepository.update(existing.id, next);
    }
    return this.flashcardProgressRepository.create({
      ...next,
      flashcardId,
      userId,
    });
  }
}

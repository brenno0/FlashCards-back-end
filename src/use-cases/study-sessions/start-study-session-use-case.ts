import type { DecksRepository } from '@/repositories/decks-repository';
import type { FlashcardsProgressRepository } from '@/repositories/flashcard-progress-repository';
import type { FlashCardsRepository } from '@/repositories/flashcards-repository';
import type { StudySessionsRepository } from '@/repositories/study-sessions-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

interface StartStudySessionRequest {
  userId: string;
  deckId: string;
}

/** Due cards per session, most overdue first. */
export const MAX_REVIEWS_PER_SESSION = 50;
/** New cards only top a session up to this size, so a review backlog is cleared before adding more. */
export const SESSION_TARGET_SIZE = 20;
export const MAX_NEW_PER_SESSION = 10;

export class StartStudySessionUseCase {
  constructor(
    private readonly studySessionsRepository: StudySessionsRepository,
    private readonly decksRepository: DecksRepository,
    private readonly flashcardsProgressRepository: FlashcardsProgressRepository,
    private readonly flashcardsRepository: FlashCardsRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  public async handle({ deckId, userId }: StartStudySessionRequest) {
    const now = this.now();
    const deck = await this.decksRepository.getById({ deckId, userId });

    if (!deck) {
      throw new ResourceNotFoundError({ resource: 'Deck' });
    }

    const due = await this.flashcardsProgressRepository.findMany({
      deckId,
      userId,
      nextReviewAt: now,
      take: MAX_REVIEWS_PER_SESSION,
    });
    const reviewCards = due.map((progress) => progress.flashcard);

    const newLimit = Math.min(
      MAX_NEW_PER_SESSION,
      Math.max(0, SESSION_TARGET_SIZE - reviewCards.length),
    );
    // New cards get progress on their first answer, so leaving a session early keeps them new.
    const newCards = newLimit
      ? await this.flashcardsRepository.findManyWithNoProgress({
          deckId,
          userId,
          take: newLimit,
          existingFlashcardIds: reviewCards.map((card) => card.id),
        })
      : [];

    const studySession = await this.studySessionsRepository.create({
      deckId,
      userId,
      startedAt: now,
    });

    return {
      ...studySession,
      flashcards: [...reviewCards, ...newCards].map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
      })),
    };
  }
}

import type { DecksRepository } from '@/repositories/decks-repository';
import type { FlashcardsProgressRepository } from '@/repositories/flashcard-progress-repository';
import type { FlashCardsRepository } from '@/repositories/flashcards-repository';
import type { StudySessionsRepository } from '@/repositories/study-sessions-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

interface StartStudySessionRequest {
  userId: string;
  deckId: string;
}
interface GetFlashcardsForTodaysReviewProps extends StartStudySessionRequest {
  nextReviewAt: Date;
}
interface SessionFlashcards {
  deckId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  front: string;
  back: string;
}
interface PushNewCardsIfSessionHasntEnoughProps
  extends StartStudySessionRequest {
  sessionFlashcards: SessionFlashcards[];
  existingFlashcardIds: string[];
}
interface NewCards {
  deckId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  front: string;
  back: string;
}
interface CreateProgressToNewCardsProps
  extends Omit<StartStudySessionRequest, 'deckId'> {
  newCards: NewCards[];
}

export class StartStudySessionUseCase {
  constructor(
    private readonly studySessionsRepository: StudySessionsRepository,
    private readonly decksRepository: DecksRepository,
    private readonly flashcardsProgressRepository: FlashcardsProgressRepository,
    private readonly flashcardsRepository: FlashCardsRepository,
  ) {}

  public async handle({ deckId, userId }: StartStudySessionRequest) {
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    const deck = await this.decksRepository.getById({ deckId, userId });

    if (!deck) {
      throw new ResourceNotFoundError({ resource: 'Deck' });
    }

    const { existingFlashcardIds, sessionFlashcards } =
      await this.getFlashcardsForTodaysReview({
        userId,
        deckId,
        nextReviewAt: today,
      });

    if (sessionFlashcards.length < 20) {
      await this.pushNewCardsIfSessionHasntEnough({
        deckId,
        existingFlashcardIds,
        sessionFlashcards,
        userId,
      });
    }

    const studySession = this.studySessionsRepository.create({
      deckId,
      userId,
      startedAt: new Date(),
    });

    return studySession;
  }

  private async getFlashcardsForTodaysReview({
    userId,
    deckId,
    nextReviewAt,
  }: GetFlashcardsForTodaysReviewProps) {
    const cardsToReviewProgress =
      await this.flashcardsProgressRepository.findMany({
        deckId,
        nextReviewAt,
        userId,
      });

    const sessionFlashcards = cardsToReviewProgress.map((p) => p.flashcard);
    const existingFlashcardIds = sessionFlashcards.map((card) => card.id);

    return { sessionFlashcards, existingFlashcardIds };
  }

  private async pushNewCardsIfSessionHasntEnough({
    sessionFlashcards,
    existingFlashcardIds,
    deckId,
    userId,
  }: PushNewCardsIfSessionHasntEnoughProps) {
    if (sessionFlashcards.length < 20) {
      const newCards = await this.flashcardsRepository.findManyWithNoProgress({
        deckId,
        existingFlashcardIds,
        quantityOfCardsToTake: sessionFlashcards.length,
        userId,
      });
      sessionFlashcards.push(...newCards);
      this.createProgressToNewCards({ newCards, userId });
    }
  }

  private async createProgressToNewCards({
    newCards,
    userId,
  }: CreateProgressToNewCardsProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const newCard of newCards) {
      await this.flashcardsProgressRepository.create({
        userId,
        flashcardId: newCard.id,
        status: 'NEW',
        nextReviewAt: today,
        interval: 0,
        repetitions: 0,
        easeFactor: 2.5,
        lastStudiedAt: null,
      });
    }
  }
}

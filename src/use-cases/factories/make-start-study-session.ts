import { DecksPrismaRepository } from '@/repositories/prisma/decks.repository.prisma';
import { FlashcardsProgressPrismaRepository } from '@/repositories/prisma/flashcards-progress-repository';
import { PrismaFlashCardsRepository } from '@/repositories/prisma/flashcards.repository.prisma';
import { StudySessionsPrismaRepository } from '@/repositories/prisma/study-sessions.repository.prisma';

import { StartStudySessionUseCase } from '../study-sessions/start-study-session-use-case';

export const makeStartStudySession = () => {
  const studySessionsRepository = new StudySessionsPrismaRepository();
  const decksRepository = new DecksPrismaRepository();
  const flashcardsProgressRepository = new FlashcardsProgressPrismaRepository();
  const flashcardsRepository = new PrismaFlashCardsRepository();

  const useCase = new StartStudySessionUseCase(
    studySessionsRepository,
    decksRepository,
    flashcardsProgressRepository,
    flashcardsRepository,
  );

  return { startStudySessionUsecase: useCase };
};

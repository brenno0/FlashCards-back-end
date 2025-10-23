import { StudySessionsPrismaRepository } from '@/repositories/prisma/study-sessions.repository.prisma';

import { FinishStudySessionUseCase } from '../study-sessions/finish-study-session-use-case';

export const makeFinishStudySession = () => {
  const studySessionRepository = new StudySessionsPrismaRepository();
  const useCase = new FinishStudySessionUseCase(studySessionRepository);

  return { finishStudySessionUseCase: useCase };
};

import type { StudySessionsRepository } from '@/repositories/study-sessions-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

interface EndStudySessionRequest {
  userId: string;
  sessionId: string;
}

export class FinishStudySessionUseCase {
  constructor(
    private readonly studySessionRepository: StudySessionsRepository,
  ) {}

  async handle({ userId, sessionId }: EndStudySessionRequest) {
    const studySession = await this.studySessionRepository.findUnique({
      userId,
      sessionId,
    });

    if (!studySession) {
      throw new ResourceNotFoundError({ resource: 'Sessão de estudo' });
    }

    const updatedStudySession = await this.studySessionRepository.update({
      sessionId,
      userId,
    });

    return updatedStudySession;
  }
}

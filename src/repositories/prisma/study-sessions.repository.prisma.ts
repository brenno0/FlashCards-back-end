import { prisma } from '@/lib/prisma';
import type { Prisma, StudySession } from 'generated/prisma';

import type { StudySessionsRepository } from '../study-sessions-repository';

export class StudySessionsPrismaRepository implements StudySessionsRepository {
  async update({
    userId,
    sessionId,
  }: {
    userId: string;
    sessionId: string;
  }): Promise<StudySession> {
    const studySession = await prisma.studySession.update({
      where: {
        id: sessionId,
        userId,
      },
      data: {
        finishedAt: new Date(),
      },
    });

    return studySession;
  }
  async findUnique({
    userId,
    sessionId,
  }: {
    userId: string;
    sessionId: string;
  }): Promise<StudySession | null> {
    const studySession = await prisma.studySession.findUnique({
      where: {
        userId,
        id: sessionId,
      },
    });

    return studySession;
  }
  async create(
    data: Prisma.StudySessionUncheckedCreateInput,
  ): Promise<StudySession> {
    const studySession = await prisma.studySession.create({
      data,
    });

    return studySession;
  }
}

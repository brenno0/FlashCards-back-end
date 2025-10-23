import { prisma } from '@/lib/prisma';
import type { Prisma, StudySession } from 'generated/prisma';

import type { StudySessionsRepository } from '../study-sessions-repository';

export class StudySessionsPrismaRepository implements StudySessionsRepository {
  async create(
    data: Prisma.StudySessionUncheckedCreateInput,
  ): Promise<StudySession> {
    const studySession = await prisma.studySession.create({
      data,
    });

    return studySession;
  }
}

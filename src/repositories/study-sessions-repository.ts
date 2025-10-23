import type { Prisma, StudySession } from 'generated/prisma';

export interface StudySessionsRepository {
  create(data: Prisma.StudySessionUncheckedCreateInput): Promise<StudySession>;
}

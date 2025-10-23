import type { Prisma, StudySession } from 'generated/prisma';

export interface StudySessionsRepository {
  create(data: Prisma.StudySessionUncheckedCreateInput): Promise<StudySession>;
  findUnique({
    userId,
    sessionId,
  }: {
    userId: string;
    sessionId: string;
  }): Promise<StudySession | null>;

  update({
    userId,
    sessionId,
  }: {
    userId: string;
    sessionId: string;
  }): Promise<StudySession>;
}

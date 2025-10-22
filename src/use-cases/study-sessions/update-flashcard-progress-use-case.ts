import type { $Enums, FlashcardProgress, Prisma } from 'generated/prisma'; // Importando os tipos necessários

export interface FlashcardProgressIdentifier {
  flashcardId: string;
  userId: string;
}

export interface UpdateFlashcardProgressRequest
  extends FlashcardProgressIdentifier {
  quality: number; // Qualidade da resposta do usuário (0-5)
}

type CalculatedFlashcardProgressValues = Pick<
  FlashcardProgress,
  'interval' | 'repetitions' | 'easeFactor' | 'status'
>;

export class UpdateFlashcardProgressUseCase {
  constructor(
    private readonly flashcardProgressRepository: FlashcardsProgressRepository,
  ) {}

  async handle({
    flashcardId,
    userId,
    quality,
  }: UpdateFlashcardProgressRequest): Promise<FlashcardProgress> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const flashcardProgress = await this.getOrCreateFlashcardProgress(
      { flashcardId, userId },
      today,
    );

    const { easeFactor, interval, repetitions, status } =
      UpdateFlashcardProgressUseCase.calculateAlgorithmValues(
        flashcardProgress,
        quality,
      );

    const nextReviewAt = new Date(today);
    nextReviewAt.setDate(today.getDate() + interval);

    const progress = await this.flashcardProgressRepository.update(
      flashcardProgress.id,
      {
        status,
        lastStudiedAt: today,
        nextReviewAt,
        repetitions,
        interval,
        easeFactor,
      },
    );

    return progress;
  }

  private async getOrCreateFlashcardProgress(
    identifier: FlashcardProgressIdentifier,
    today: Date,
  ): Promise<FlashcardProgress> {
    const { flashcardId, userId } = identifier;

    const existingProgress = await this.flashcardProgressRepository.findUnique({
      flashcardId,
      userId,
    });

    return (
      existingProgress ??
      (await this.createBrandNewFlashcardProgress(identifier, today))
    );
  }

  private async createBrandNewFlashcardProgress(
    { userId, flashcardId }: FlashcardProgressIdentifier,
    today: Date,
  ): Promise<FlashcardProgress> {
    const createdFlashcardProgress =
      await this.flashcardProgressRepository.create({
        userId,
        flashcardId,
        status: 'NEW',
        nextReviewAt: today,
        interval: 0,
        repetitions: 0,
        easeFactor: 2.5,
        lastStudiedAt: null,
      });
    return createdFlashcardProgress;
  }

  private static calculateInterval(
    currentInterval: number,
    newRepetitions: number,
    currentEaseFactor: number,
  ): number {
    if (newRepetitions === 1) {
      return 1;
    }
    if (newRepetitions === 2) {
      return 6;
    }
    if (newRepetitions > 2) {
      return Math.round(currentInterval + currentEaseFactor);
    }
    return 1;
  }

  private static calculateEaseFactor(
    currentEaseFactor: number,
    quality: number,
  ): number {
    let newEaseFactor = currentEaseFactor;

    if (quality >= 3) {
      newEaseFactor += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
    } else {
      newEaseFactor = newEaseFactor - 0.8 + 0.2 * quality;
    }

    return Math.max(1.3, newEaseFactor);
  }

  private static calculateAlgorithmValues(
    flashcardProgress: FlashcardProgress,
    quality: number,
  ): CalculatedFlashcardProgressValues {
    const {
      interval: currentInterval,
      repetitions: currentRepetitions,
      easeFactor: currentEaseFactor,
    } = flashcardProgress;

    let newRepetitions: number;
    let newStatus: $Enums.ProgressStatus;

    if (quality >= 3) {
      newRepetitions = currentRepetitions + 1;
      newStatus = 'REVIEW';
    } else {
      newRepetitions = 0;
      newStatus = 'AGAIN';
    }

    const newInterval = this.calculateInterval(
      currentInterval,
      newRepetitions,
      currentEaseFactor,
    );

    const newEaseFactor = this.calculateEaseFactor(currentEaseFactor, quality);

    return {
      interval: newInterval,
      repetitions: newRepetitions,
      easeFactor: newEaseFactor,
      status: newStatus,
    };
  }
}

export interface FlashcardsProgressRepository {
  findUnique({
    userId,
    flashcardId,
  }: FlashcardProgressIdentifier): Promise<FlashcardProgress | null>;
  create(
    data: Prisma.FlashcardProgressUncheckedCreateInput,
  ): Promise<FlashcardProgress>;
  update(
    id: string,
    data: Prisma.FlashcardProgressUncheckedUpdateInput,
  ): Promise<FlashcardProgress>;
}

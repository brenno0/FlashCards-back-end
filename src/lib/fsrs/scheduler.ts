import {
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card,
  type Grade,
} from 'ts-fsrs';

import type { $Enums, FlashcardProgress } from 'generated/prisma';

/**
 * FSRS scheduler (same algorithm as Anki >= 23.10). Targets 90% recall at review time; short-term
 * learning steps (1m, 10m; relearning 10m) keep a missed card in the current session.
 */
const scheduler = fsrs(
  generatorParameters({
    request_retention: 0.9,
    maximum_interval: 36500,
    enable_fuzz: true,
    enable_short_term: true,
  }),
);

/** Fields of FlashcardProgress that hold the FSRS card. */
export type FsrsProgressFields = Pick<
  FlashcardProgress,
  | 'state'
  | 'stability'
  | 'difficulty'
  | 'lapses'
  | 'learningSteps'
  | 'interval'
  | 'repetitions'
  | 'nextReviewAt'
  | 'lastStudiedAt'
  | 'status'
>;

/**
 * Answer quality from the API. 1 Again, 2 Hard, 3 Good, 4 Easy; 5 is kept as Easy for clients
 * still sending the old five-point scale. Hard is a pass, not a reset.
 */
export const gradeFromQuality = (quality: number): Grade => {
  if (quality <= 1) {
    return Rating.Again;
  }
  if (quality === 2) {
    return Rating.Hard;
  }
  if (quality === 3) {
    return Rating.Good;
  }
  return Rating.Easy;
};

const toCard = (progress: FsrsProgressFields | null, now: Date): Card => {
  if (!progress || progress.state === State.New) {
    return {
      due: now,
      stability: 0,
      difficulty: 0,
      elapsed_days: 0,
      scheduled_days: 0,
      learning_steps: 0,
      reps: 0,
      lapses: 0,
      state: State.New,
    };
  }
  return {
    due: progress.nextReviewAt,
    stability: progress.stability,
    difficulty: progress.difficulty,
    elapsed_days: 0,
    scheduled_days: progress.interval,
    learning_steps: progress.learningSteps,
    reps: progress.repetitions,
    lapses: progress.lapses,
    state: progress.state as State,
    last_review: progress.lastStudiedAt ?? undefined,
  };
};

const statusFor = (state: State): $Enums.ProgressStatus => {
  if (state === State.Review) {
    return 'REVIEW';
  }
  if (state === State.New) {
    return 'NEW';
  }
  return 'AGAIN';
};

/** Applies one answer and returns the new progress fields. */
export const review = (
  progress: FsrsProgressFields | null,
  quality: number,
  now: Date,
): FsrsProgressFields => {
  const { card } = scheduler.next(
    toCard(progress, now),
    now,
    gradeFromQuality(quality),
  );
  return {
    state: card.state,
    stability: card.stability,
    difficulty: card.difficulty,
    lapses: card.lapses,
    learningSteps: card.learning_steps,
    interval: card.scheduled_days,
    repetitions: card.reps,
    nextReviewAt: card.due,
    lastStudiedAt: now,
    status: statusFor(card.state),
  };
};

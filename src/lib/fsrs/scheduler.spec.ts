import { describe, expect, it } from 'vitest';

import { review, type FsrsProgressFields } from './scheduler';

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const start = new Date('2026-10-08T12:00:00Z');

const at = (progress: FsrsProgressFields) => progress.nextReviewAt;
const daysFrom = (from: Date, to: Date) =>
  (to.getTime() - from.getTime()) / DAY;

/** Answers a card at its due time with the same quality, `times` times. */
const reviewAtDue = (
  quality: number,
  times: number,
  first = review(null, 3, start),
) => {
  let progress = first;
  for (let i = 0; i < times; i++) {
    progress = review(progress, quality, at(progress));
  }
  return progress;
};

describe('FSRS scheduler', () => {
  it('keeps a new card in the session with short learning steps', () => {
    const again = review(null, 1, start);
    const good = review(null, 3, start);
    expect(again.status).toBe('AGAIN');
    expect(at(again).getTime() - start.getTime()).toBe(1 * MINUTE);
    expect(at(good).getTime() - start.getTime()).toBe(10 * MINUTE);
  });

  it('graduates a new card straight to days when it is easy', () => {
    const easy = review(null, 4, start);
    expect(easy.status).toBe('REVIEW');
    expect(daysFrom(start, at(easy))).toBeGreaterThanOrEqual(1);
  });

  it('grows intervals multiplicatively on successful reviews', () => {
    const intervals: number[] = [];
    let progress = reviewAtDue(3, 1); // graduate from learning
    for (let i = 0; i < 5; i++) {
      const next = review(progress, 3, at(progress));
      intervals.push(next.interval);
      progress = next;
    }
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThan(intervals[i - 1] * 1.5);
    }
    expect(intervals.at(-1)).toBeGreaterThan(60);
  });

  it('treats Hard as a pass with a shorter interval than Good', () => {
    const graduated = reviewAtDue(3, 3);
    const hard = review(graduated, 2, at(graduated));
    const good = review(graduated, 3, at(graduated));
    expect(hard.status).toBe('REVIEW');
    expect(hard.lapses).toBe(graduated.lapses);
    expect(hard.interval).toBeGreaterThan(0);
    expect(hard.interval).toBeLessThan(good.interval);
  });

  it('counts a lapse and relearns within minutes when a review card is forgotten', () => {
    const graduated = reviewAtDue(3, 3);
    const forgot = review(graduated, 1, at(graduated));
    expect(forgot.lapses).toBe(graduated.lapses + 1);
    expect(forgot.status).toBe('AGAIN');
    expect(at(forgot).getTime() - at(graduated).getTime()).toBe(10 * MINUTE);
    expect(forgot.stability).toBeLessThan(graduated.stability);
  });

  it('accepts the legacy five-point scale (5 = Easy)', () => {
    const legacy = review(null, 5, start);
    const easy = review(null, 4, start);
    expect(legacy.state).toBe(easy.state);
    expect(legacy.stability).toBe(easy.stability);
  });

  it('schedules a card migrated from SM-2 as a review card', () => {
    const migrated: FsrsProgressFields = {
      state: 2,
      stability: 15,
      difficulty: 5,
      lapses: 0,
      learningSteps: 0,
      interval: 15,
      repetitions: 4,
      nextReviewAt: start,
      lastStudiedAt: new Date(start.getTime() - 15 * DAY),
      status: 'REVIEW',
    };
    const good = review(migrated, 3, start);
    expect(good.status).toBe('REVIEW');
    expect(good.interval).toBeGreaterThan(15);
  });
});

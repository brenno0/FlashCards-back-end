import { describe, expect, it } from 'vitest';

import type { FlashcardsProgressRepository } from '@/repositories/flashcard-progress-repository';
import type { FlashCardsRepository } from '@/repositories/flashcards-repository';
import { InMemoryDecksRepository } from '@/repositories/in-memory/in-memory-decks-repository';
import type { StudySessionsRepository } from '@/repositories/study-sessions-repository';

import {
  MAX_NEW_PER_SESSION,
  StartStudySessionUseCase,
} from './start-study-session-use-case';

const USER = 'user-1';
const card = (id: string) => ({
  id,
  front: `front ${id}`,
  back: `back ${id}`,
  deckId: 'deck',
  createdAt: new Date(),
  updatedAt: new Date(),
});

const setup = async (dueCount: number, newCount: number) => {
  const decks = new InMemoryDecksRepository();
  const deck = await decks.create({ title: 'Deck', userId: USER });
  const asked: { take?: number; dueTake?: number } = {};
  const progress = {
    findMany: async ({ take }: { take: number }) => {
      asked.dueTake = take;
      return Array.from({ length: Math.min(dueCount, take) }, (_, i) => ({
        flashcard: card(`due-${i}`),
      }));
    },
  } as unknown as FlashcardsProgressRepository;
  const flashcards = {
    findManyWithNoProgress: async ({ take }: { take: number }) => {
      asked.take = take;
      return Array.from({ length: Math.min(newCount, take) }, (_, i) =>
        card(`new-${i}`),
      );
    },
  } as unknown as FlashCardsRepository;
  const sessions = {
    create: async (data: object) => ({
      id: 'session',
      finishedAt: null,
      ...data,
    }),
  } as unknown as StudySessionsRepository;
  const sut = new StartStudySessionUseCase(
    sessions,
    decks,
    progress,
    flashcards,
  );
  return { sut, deckId: deck.id, asked };
};

describe('StartStudySessionUseCase', () => {
  it('fills a light session with a capped number of new cards after the due ones', async () => {
    const { sut, deckId } = await setup(3, 50);
    const { flashcards } = await sut.handle({ deckId, userId: USER });
    expect(flashcards.slice(0, 3).map((c) => c.id)).toEqual([
      'due-0',
      'due-1',
      'due-2',
    ]);
    expect(flashcards).toHaveLength(3 + MAX_NEW_PER_SESSION);
  });

  it('adds no new cards while the review backlog fills the session', async () => {
    const { sut, deckId, asked } = await setup(80, 50);
    const { flashcards } = await sut.handle({ deckId, userId: USER });
    expect(asked.dueTake).toBe(50);
    expect(asked.take).toBeUndefined();
    expect(flashcards).toHaveLength(50);
    expect(flashcards.every((c) => c.id.startsWith('due-'))).toBe(true);
  });
});

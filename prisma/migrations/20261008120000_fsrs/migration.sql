-- AlterTable
ALTER TABLE "FlashcardProgress" ADD COLUMN     "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lapses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "learningSteps" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "state" INTEGER NOT NULL DEFAULT 0;

-- Data: SM-2 -> FSRS.
-- Rows created when a session started but never answered carry no memory data; drop them so
-- those cards are simply new again.
DELETE FROM "FlashcardProgress" WHERE "lastStudiedAt" IS NULL;

-- Answered cards become FSRS Review cards. Stability ~= the current interval in days (the
-- interval at which recall was last expected); difficulty maps ease 2.5 -> 5 and 1.3 -> 10.
-- Cards whose last answer was a failure (repetitions = 0) start from stability 1 with one lapse.
UPDATE "FlashcardProgress"
SET "state" = 2,
    "stability" = GREATEST("interval", 1),
    "difficulty" = LEAST(10, GREATEST(1, 5 + (2.5 - "easeFactor") * 5 / 1.2)),
    "lapses" = CASE WHEN "repetitions" = 0 THEN 1 ELSE 0 END;

/*
  Warnings:

  - A unique constraint covering the columns `[userId,flashcardId]` on the table `FlashcardProgress` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nextReviewAt` on table `FlashcardProgress` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FlashcardProgress" ADD COLUMN     "interval" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "nextReviewAt" SET NOT NULL,
ALTER COLUMN "nextReviewAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "FlashcardProgress_userId_flashcardId_key" ON "FlashcardProgress"("userId", "flashcardId");

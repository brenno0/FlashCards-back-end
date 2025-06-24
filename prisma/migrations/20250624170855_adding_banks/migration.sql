/*
  Warnings:

  - You are about to drop the column `bank` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "bank";

-- CreateTable
CREATE TABLE "Bank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AccountToBank" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AccountToBank_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bank_name_key" ON "Bank"("name");

-- CreateIndex
CREATE INDEX "_AccountToBank_B_index" ON "_AccountToBank"("B");

-- AddForeignKey
ALTER TABLE "_AccountToBank" ADD CONSTRAINT "_AccountToBank_A_fkey" FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToBank" ADD CONSTRAINT "_AccountToBank_B_fkey" FOREIGN KEY ("B") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

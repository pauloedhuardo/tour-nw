/*
  Warnings:

  - A unique constraint covering the columns `[eventId,userId]` on the table `Inscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Inscription_eventId_userId_key" ON "Inscription"("eventId", "userId");

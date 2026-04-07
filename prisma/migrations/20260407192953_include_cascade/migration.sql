-- DropForeignKey
ALTER TABLE "Inscription" DROP CONSTRAINT "Inscription_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Race" DROP CONSTRAINT "Race_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_raceId_fkey";

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create enum for race result modality
CREATE TYPE "ResultType" AS ENUM ('FINISH', 'SPRINT', 'CLIMB');

-- Add modality in existing Result rows (legacy data becomes FINISH)
ALTER TABLE "Result"
ADD COLUMN "type" "ResultType" NOT NULL DEFAULT 'FINISH';

-- Ensure only one result per athlete/race/modality
CREATE UNIQUE INDEX "Result_raceId_userId_type_key" ON "Result"("raceId", "userId", "type");

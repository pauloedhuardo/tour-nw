-- Recreate enum to support two sprints and two climbs per race.
CREATE TYPE "ResultType_new" AS ENUM (
  'FINISH',
  'SPRINT_1',
  'SPRINT_2',
  'CLIMB_1',
  'CLIMB_2'
);

-- Keep existing data by mapping old values.
ALTER TABLE "Result"
ALTER COLUMN "type" DROP DEFAULT;

ALTER TABLE "Result"
ALTER COLUMN "type" TYPE "ResultType_new"
USING (
  CASE "type"::text
    WHEN 'SPRINT' THEN 'SPRINT_1'
    WHEN 'CLIMB' THEN 'CLIMB_1'
    ELSE "type"::text
  END
)::"ResultType_new";

DROP TYPE "ResultType";
ALTER TYPE "ResultType_new" RENAME TO "ResultType";

ALTER TABLE "Result"
ALTER COLUMN "type" SET DEFAULT 'FINISH';

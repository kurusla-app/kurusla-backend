-- CreateEnum
CREATE TYPE "PotRequestType" AS ENUM ('CONTRIBUTION', 'WITHDRAWAL');

-- AlterTable Pot
ALTER TABLE "Pot" ADD COLUMN "description" TEXT,
ADD COLUMN "createdById" INTEGER;

-- AlterTable PotParticipant
ALTER TABLE "PotParticipant" ADD COLUMN "totalContributed" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable PotRequest: String -> enum
ALTER TABLE "PotRequest" ALTER COLUMN "type" TYPE "PotRequestType" USING (
  CASE
    WHEN UPPER("type"::text) = 'WITHDRAWAL' THEN 'WITHDRAWAL'::"PotRequestType"
    ELSE 'CONTRIBUTION'::"PotRequestType"
  END
);

-- CreateIndex
CREATE INDEX "Pot_groupId_idx" ON "Pot"("groupId");
CREATE INDEX "PotParticipant_userId_idx" ON "PotParticipant"("userId");
CREATE INDEX "PotParticipant_potId_idx" ON "PotParticipant"("potId");
CREATE INDEX "PotRequest_potId_idx" ON "PotRequest"("potId");
CREATE INDEX "PotRequest_userId_idx" ON "PotRequest"("userId");

-- AddForeignKey
ALTER TABLE "Pot" ADD CONSTRAINT "Pot_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PotParticipant" ADD CONSTRAINT "PotParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

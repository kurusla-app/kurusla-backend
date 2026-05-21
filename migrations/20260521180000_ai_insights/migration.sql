-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('SPENDING', 'SAVING', 'CATEGORY', 'GENERAL');

-- CreateTable
CREATE TABLE "AIInsight" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "InsightType" NOT NULL DEFAULT 'GENERAL',
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" JSONB,
    "source" TEXT NOT NULL DEFAULT 'kurusla-ai',
    "transactionId" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIInsight_userId_idx" ON "AIInsight"("userId");
CREATE INDEX "AIInsight_userId_isRead_idx" ON "AIInsight"("userId", "isRead");
CREATE INDEX "AIInsight_userId_createdAt_idx" ON "AIInsight"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "AIInsight" ADD CONSTRAINT "AIInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

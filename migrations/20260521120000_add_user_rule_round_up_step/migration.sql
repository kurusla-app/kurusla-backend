-- CreateEnum
CREATE TYPE "RoundUpStep" AS ENUM ('STEP_5', 'STEP_10', 'STEP_50');

-- CreateTable
CREATE TABLE "UserRule" (
    "id" SERIAL NOT NULL,
    "roundUpStep" "RoundUpStep" NOT NULL DEFAULT 'STEP_10',
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRule_userId_key" ON "UserRule"("userId");

-- AddForeignKey
ALTER TABLE "UserRule" ADD CONSTRAINT "UserRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

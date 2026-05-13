/*
  Warnings:

  - You are about to drop the column `timestamp` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Saving` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Saving" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Saving" ADD CONSTRAINT "Saving_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

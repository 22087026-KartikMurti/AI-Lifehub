/*
  Warnings:

  - You are about to drop the column `password_reset_token` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id,userId]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[password_reset_code]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_password_reset_token_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password_reset_token",
ADD COLUMN     "password_reset_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Task_id_userId_key" ON "Task"("id", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_password_reset_code_key" ON "User"("password_reset_code");

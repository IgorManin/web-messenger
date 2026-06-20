/*
  Warnings:

  - A unique constraint covering the columns `[directChatKey]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "directChatKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_directChatKey_key" ON "Chat"("directChatKey");

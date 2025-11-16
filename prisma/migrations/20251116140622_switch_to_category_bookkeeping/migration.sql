/*
  Warnings:

  - You are about to drop the column `accountId` on the `BookkeepingEntry` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `BookkeepingEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `BookkeepingEntry` DROP FOREIGN KEY `BookkeepingEntry_accountId_fkey`;

-- DropIndex
DROP INDEX `BookkeepingEntry_accountId_fkey` ON `BookkeepingEntry`;

-- AlterTable
ALTER TABLE `BookkeepingEntry` DROP COLUMN `accountId`,
    ADD COLUMN `categoryId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `BookkeepingEntry` ADD CONSTRAINT `BookkeepingEntry_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

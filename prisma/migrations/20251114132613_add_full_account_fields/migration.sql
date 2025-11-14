/*
  Warnings:

  - You are about to drop the column `description` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Account` DROP COLUMN `description`,
    ADD COLUMN `instruction` VARCHAR(191) NULL,
    ADD COLUMN `number` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `openingBalance` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `vatHandling` VARCHAR(191) NOT NULL DEFAULT 'Kotimaan verollinen myynti',
    ADD COLUMN `vatRate` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `type` VARCHAR(191) NOT NULL DEFAULT 'tulo';

/*
  Warnings:

  - You are about to drop the column `unit` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Product` DROP COLUMN `unit`,
    ADD COLUMN `hours` INTEGER NULL,
    ADD COLUMN `minutes` INTEGER NULL,
    ADD COLUMN `quantity` INTEGER NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Contact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `customerCode` VARCHAR(191) NULL,
    `enableBilling` BOOLEAN NOT NULL DEFAULT false,
    `notes` VARCHAR(191) NULL,
    `altNames` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

/*
  Warnings:

  - You are about to alter the column `invoiceNumber` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Invoice` MODIFY `invoiceNumber` INTEGER NULL;

-- CreateTable
CREATE TABLE `InvoiceCounter` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `current` INTEGER NOT NULL DEFAULT 100,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

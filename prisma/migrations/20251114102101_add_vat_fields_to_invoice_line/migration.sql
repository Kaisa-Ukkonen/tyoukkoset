-- AlterTable
ALTER TABLE `InvoiceLine` ADD COLUMN `vatCode` VARCHAR(191) NULL,
    ADD COLUMN `vatHandling` VARCHAR(191) NULL;

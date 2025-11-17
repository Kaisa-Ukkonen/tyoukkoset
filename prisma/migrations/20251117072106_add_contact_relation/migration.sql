-- AlterTable
ALTER TABLE `BookkeepingEntry` ADD COLUMN `contactId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `BookkeepingEntry` ADD CONSTRAINT `BookkeepingEntry_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `city` on the `StandupGig` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `StandupGig` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `StandupGig` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `StandupGig` table. All the data in the column will be lost.
  - You are about to drop the column `venue` on the `StandupGig` table. All the data in the column will be lost.
  - Made the column `address` on table `StandupGig` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `StandupGig` DROP COLUMN `city`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `venue`,
    MODIFY `address` VARCHAR(191) NOT NULL;

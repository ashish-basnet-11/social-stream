/*
  Warnings:

  - You are about to drop the column `content` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Post` DROP COLUMN `content`,
    DROP COLUMN `title`,
    ADD COLUMN `caption` TEXT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL;

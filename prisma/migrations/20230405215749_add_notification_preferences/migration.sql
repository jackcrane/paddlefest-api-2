-- AlterTable
ALTER TABLE `NotificationTokens` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `NotificationConnections` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `notificationTokensId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NotificationConnections` ADD CONSTRAINT `NotificationConnections_notificationTokensId_fkey` FOREIGN KEY (`notificationTokensId`) REFERENCES `NotificationTokens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

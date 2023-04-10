/*
  Warnings:

  - Added the required column `tier` to the `NotificationConnections` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `NotificationConnections` ADD COLUMN `tier` ENUM('ALL', 'SAFETY', 'EVENTS', 'RACES') NOT NULL;

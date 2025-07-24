/*
  Warnings:

  - You are about to drop the `sub_missions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_sub_mission_progress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sub_missions" DROP CONSTRAINT "sub_missions_missionId_fkey";

-- DropForeignKey
ALTER TABLE "user_sub_mission_progress" DROP CONSTRAINT "user_sub_mission_progress_subMissionId_fkey";

-- DropForeignKey
ALTER TABLE "user_sub_mission_progress" DROP CONSTRAINT "user_sub_mission_progress_userId_fkey";

-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "subMissions" TEXT[];

-- AlterTable
ALTER TABLE "user_mission_progress" ADD COLUMN     "checked_at" TIMESTAMP(3),
ADD COLUMN     "contents_date" TIMESTAMP(3),
ADD COLUMN     "is_checked" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "sub_missions";

-- DropTable
DROP TABLE "user_sub_mission_progress";

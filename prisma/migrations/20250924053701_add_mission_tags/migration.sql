/*
  Warnings:

  - You are about to drop the column `subMissions` on the `missions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MissionType" AS ENUM ('ACTION', 'CONTENTS');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "missionCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "missions" DROP COLUMN "subMissions",
ADD COLUMN     "mission_type" "MissionType" NOT NULL DEFAULT 'ACTION',
ADD COLUMN     "sub_description" TEXT[];

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_tags" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mission_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_courseId_key" ON "tags"("name", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "mission_tags_missionId_tagId_key" ON "mission_tags"("missionId", "tagId");

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_tags" ADD CONSTRAINT "mission_tags_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_tags" ADD CONSTRAINT "mission_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

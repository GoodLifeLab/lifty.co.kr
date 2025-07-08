/*
  Warnings:

  - The `role` column on the `group_members` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "GroupMemberRole" AS ENUM ('MEMBER', 'ADMIN');

-- AlterTable
ALTER TABLE "group_members" DROP COLUMN "role",
ADD COLUMN     "role" "GroupMemberRole" NOT NULL DEFAULT 'MEMBER';

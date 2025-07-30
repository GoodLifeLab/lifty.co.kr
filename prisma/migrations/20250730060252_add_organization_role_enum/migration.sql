/*
  Warnings:

  - The `role` column on the `user_organizations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('MEMBER', 'LEADER', 'ADMIN');

-- AlterTable
ALTER TABLE "user_organizations" DROP COLUMN "role",
ADD COLUMN     "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER';

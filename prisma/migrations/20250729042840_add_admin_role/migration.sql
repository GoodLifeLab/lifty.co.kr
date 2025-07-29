-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('USER', 'COACH', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'USER';

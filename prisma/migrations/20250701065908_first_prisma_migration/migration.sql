-- DropIndex
DROP INDEX "idx_email_verification_codes_expires_at";

-- DropIndex
DROP INDEX "idx_users_disabled";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_login_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "profileImage" TEXT;

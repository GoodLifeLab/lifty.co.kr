/*
  Warnings:

  - You are about to drop the column `sub_description` on the `missions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "missions" DROP COLUMN "sub_description",
ADD COLUMN     "sub_descriptions" TEXT[];

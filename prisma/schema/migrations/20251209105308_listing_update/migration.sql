/*
  Warnings:

  - The `status` column on the `listings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "listings" DROP COLUMN "status",
ADD COLUMN     "status" TEXT DEFAULT 'Active';

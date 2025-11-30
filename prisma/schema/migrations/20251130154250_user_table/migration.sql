-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authProvider" TEXT,
ADD COLUMN     "isVerified" BOOLEAN DEFAULT false,
ADD COLUMN     "providerId" TEXT;

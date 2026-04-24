/*
  Warnings:

  - You are about to drop the column `email_verification_code` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email_verification_expires` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password_reset_code` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password_reset_expires` on the `users` table. All the data in the column will be lost.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'STAFF', 'ADMIN');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email_verification_code",
DROP COLUMN "email_verification_expires",
DROP COLUMN "password_reset_code",
DROP COLUMN "password_reset_expires",
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CUSTOMER';

-- Allow OAuth users without password hash
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- Apply Profile Gig Migration
-- This script adds the necessary columns to the Gigs table
-- to support the profile gig feature

-- Add isProfileGig column
ALTER TABLE "Gigs" ADD COLUMN IF NOT EXISTS "isProfileGig" BOOLEAN NOT NULL DEFAULT false;

-- Add skills column
ALTER TABLE "Gigs" ADD COLUMN IF NOT EXISTS "skills" TEXT[];

-- Add codingLanguages column
ALTER TABLE "Gigs" ADD COLUMN IF NOT EXISTS "codingLanguages" TEXT[];

-- Add yearsOfExperience column
ALTER TABLE "Gigs" ADD COLUMN IF NOT EXISTS "yearsOfExperience" INTEGER NOT NULL DEFAULT 0;

-- Add certificates column
ALTER TABLE "Gigs" ADD COLUMN IF NOT EXISTS "certificates" TEXT[];

-- Verify the changes
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Gigs'
ORDER BY ordinal_position; 
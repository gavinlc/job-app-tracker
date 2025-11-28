-- Migration: Add is_starred column to applications table
-- Run this SQL in your database to add the star/favourite functionality

ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE NOT NULL;

-- Optional: Create an index for faster queries when filtering by starred status
CREATE INDEX IF NOT EXISTS idx_applications_is_starred ON applications(is_starred);


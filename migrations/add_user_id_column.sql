-- Migration: Add user_id column to applications table
-- Run this SQL in your database to add user-specific filtering

ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Create an index for faster queries when filtering by user_id
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);

-- Optional: Set a default or migrate existing data
-- If you have existing applications, you may want to assign them to a default user
-- UPDATE applications SET user_id = 'default-user-id' WHERE user_id IS NULL;


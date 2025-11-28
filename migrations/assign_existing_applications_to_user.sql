-- Migration: Assign existing applications to a specific user
-- Run this SQL in your database to assign all existing applications (where user_id IS NULL) to your user ID
-- 
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with your actual user ID from Stack Auth
-- You can find your user ID by checking the user object in the browser console:
--   - Open browser console
--   - Check the user object: it should have an 'id' property
--   - Or check the Network tab when making API calls to see the userId being sent

-- Option 1: Assign all NULL user_id applications to a specific user
-- UPDATE applications 
-- SET user_id = 'YOUR_USER_ID_HERE' 
-- WHERE user_id IS NULL;

-- Option 2: If you want to see which applications would be affected first, run this:
-- SELECT id, company, position, created_at 
-- FROM applications 
-- WHERE user_id IS NULL;

-- Option 3: If you have multiple users and want to delete orphaned applications instead:
-- DELETE FROM applications WHERE user_id IS NULL;


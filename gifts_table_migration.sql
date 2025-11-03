-- Migration script to add from/to fields to gifts table
-- Run this SQL in your Supabase SQL Editor

-- Add new columns for sender and recipient tracking
ALTER TABLE gifts 
ADD COLUMN IF NOT EXISTS from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS to_email TEXT,
ADD COLUMN IF NOT EXISTS to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gifts_from_user_id ON gifts(from_user_id);
CREATE INDEX IF NOT EXISTS idx_gifts_to_user_id ON gifts(to_user_id);
CREATE INDEX IF NOT EXISTS idx_gifts_to_email ON gifts(to_email);

-- Add comment to document the fields
COMMENT ON COLUMN gifts.from_user_id IS 'User ID of the person sending the gift';
COMMENT ON COLUMN gifts.to_email IS 'Email address of the recipient';
COMMENT ON COLUMN gifts.to_user_id IS 'User ID of the recipient (if they exist in the system)';

-- Update Row Level Security (RLS) policies if needed
-- Users can view gifts they sent (from_user_id = their id)
-- Users can view gifts they received (to_email = their email OR to_user_id = their id)

-- Note: You may need to update your RLS policies depending on your security requirements
-- Example policy for viewing received gifts:
-- CREATE POLICY "Users can view received gifts" ON gifts
--   FOR SELECT USING (
--     to_user_id = auth.uid() OR 
--     to_email = (SELECT email FROM auth.users WHERE id = auth.uid())
--   );


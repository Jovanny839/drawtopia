-- Migration script to add checked field to gifts table
-- Run this SQL in your Supabase SQL Editor

-- Add checked column to gifts table
ALTER TABLE gifts 
ADD COLUMN IF NOT EXISTS checked BOOLEAN DEFAULT FALSE;

-- Add comment to document the field
COMMENT ON COLUMN gifts.checked IS 'Whether the gift notification has been viewed/checked by the recipient';

-- Add index for better query performance when filtering checked gifts
CREATE INDEX IF NOT EXISTS idx_gifts_checked ON gifts(checked);

-- Update existing gifts to have checked = false by default (optional, if you want to reset)
-- UPDATE gifts SET checked = false WHERE checked IS NULL;


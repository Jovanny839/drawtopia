-- Update existing stories table to add story_title and cover_design columns
-- Run this SQL in your Supabase SQL Editor if you already have the stories table

-- Add story_title column
ALTER TABLE stories ADD COLUMN IF NOT EXISTS story_title VARCHAR;

-- Add cover_design column  
ALTER TABLE stories ADD COLUMN IF NOT EXISTS cover_design VARCHAR;

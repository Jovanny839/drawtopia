-- Stories Table Setup for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create the stories table
CREATE TABLE IF NOT EXISTS stories (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    child_profile_id BIGINT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
    character_name VARCHAR NOT NULL,
    character_type VARCHAR CHECK (character_type IN ('person', 'animal', 'magical_creature')) NOT NULL,
    special_ability TEXT,
    character_style VARCHAR CHECK (character_style IN ('3d', 'cartoon', 'anime')) NOT NULL,
    story_world VARCHAR CHECK (story_world IN ('forest', 'space', 'underwater')) NOT NULL,
    adventure_type VARCHAR CHECK (adventure_type IN ('treasure_hunt', 'helping_friend')) NOT NULL,
    original_image_url TEXT NOT NULL,
    enhanced_images JSONB DEFAULT '[]'::jsonb,
    story_title VARCHAR,
    cover_design VARCHAR,
    status VARCHAR DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed'))
);

-- Enable Row Level Security (RLS)
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Policy: Users can only see stories for their own child profiles
CREATE POLICY "Users can view own stories" ON stories
    FOR SELECT USING (
        child_profile_id IN (
            SELECT id FROM child_profiles WHERE parent_id = auth.uid()
        )
    );

-- Policy: Users can only insert stories for their own child profiles
CREATE POLICY "Users can insert own stories" ON stories
    FOR INSERT WITH CHECK (
        child_profile_id IN (
            SELECT id FROM child_profiles WHERE parent_id = auth.uid()
        )
    );

-- Policy: Users can only update stories for their own child profiles
CREATE POLICY "Users can update own stories" ON stories
    FOR UPDATE USING (
        child_profile_id IN (
            SELECT id FROM child_profiles WHERE parent_id = auth.uid()
        )
    );

-- Policy: Users can only delete stories for their own child profiles
CREATE POLICY "Users can delete own stories" ON stories
    FOR DELETE USING (
        child_profile_id IN (
            SELECT id FROM child_profiles WHERE parent_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_child_profile_id ON stories(child_profile_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at);

-- Grant permissions to authenticated users
GRANT ALL ON stories TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stories_id_seq TO authenticated;

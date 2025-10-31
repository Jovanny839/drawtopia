-- Child Profiles Table Setup for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create the child_profiles table
CREATE TABLE IF NOT EXISTS child_profiles (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_name TEXT NOT NULL,
    age_group TEXT NOT NULL,
    relationship TEXT NOT NULL,
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    avatar_url TEXT NOT NULL DEFAULT 'https://placehold.co/40x40'
);

-- Enable Row Level Security (RLS)
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Policy: Users can only see their own child profiles
CREATE POLICY "Users can view own child profiles" ON child_profiles
    FOR SELECT USING (auth.uid() = parent_id);

-- Policy: Users can only insert child profiles for themselves
CREATE POLICY "Users can insert own child profiles" ON child_profiles
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Policy: Users can only update their own child profiles
CREATE POLICY "Users can update own child profiles" ON child_profiles
    FOR UPDATE USING (auth.uid() = parent_id);

-- Policy: Users can only delete their own child profiles
CREATE POLICY "Users can delete own child profiles" ON child_profiles
    FOR DELETE USING (auth.uid() = parent_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_child_profiles_parent_id ON child_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_child_profiles_created_at ON child_profiles(created_at);

-- Grant permissions to authenticated users
GRANT ALL ON child_profiles TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE child_profiles_id_seq TO authenticated;

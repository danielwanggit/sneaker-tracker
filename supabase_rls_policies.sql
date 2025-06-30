-- Supabase RLS Policies for Sneaker Tracker
-- Run these commands in your Supabase SQL Editor

-- ===========================================
-- PROFILES TABLE POLICIES
-- ===========================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all profiles (for community directory)
CREATE POLICY "Allow public read access to profiles" ON profiles
FOR SELECT USING (true);

-- Policy: Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Policy: Allow users to insert their own profile (during signup)
CREATE POLICY "Allow users to insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- ===========================================
-- SNEAKERS TABLE POLICIES
-- ===========================================

-- Enable RLS on sneakers table
ALTER TABLE sneakers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all sneakers (for community viewing)
CREATE POLICY "Allow public read access to sneakers" ON sneakers
FOR SELECT USING (true);

-- Policy: Allow users to insert their own sneakers
CREATE POLICY "Allow users to insert own sneakers" ON sneakers
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own sneakers
CREATE POLICY "Allow users to update own sneakers" ON sneakers
FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Allow users to delete their own sneakers
CREATE POLICY "Allow users to delete own sneakers" ON sneakers
FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- NOTES
-- ===========================================

-- These policies ensure:
-- 1. Anyone can view user profiles and sneaker collections (public read access)
-- 2. Users can only modify their own data (write access restricted to owner)
-- 3. Security is maintained while enabling community features
-- 4. RLS remains enabled for all security benefits 
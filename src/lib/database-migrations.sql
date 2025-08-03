-- Add role column to profiles table
-- Run this in your Supabase SQL editor

-- Add role column with default value 'user'
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' NOT NULL;

-- Create an index on the role column for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Add a check constraint to ensure only valid roles
ALTER TABLE profiles 
ADD CONSTRAINT check_valid_role 
CHECK (role IN ('user', 'admin', 'super_admin'));

-- Update existing users to have 'user' role if they don't have one
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL OR role = '';

-- Set your email as super admin (replace with your actual email)
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'your-email@gmail.com';

-- Optional: Set specific emails as regular admins
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE email IN ('admin1@gmail.com', 'admin2@gmail.com');

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user can create articles
CREATE OR REPLACE FUNCTION can_create_articles(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

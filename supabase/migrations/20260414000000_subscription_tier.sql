-- Add subscription columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

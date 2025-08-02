# Supabase Integration Setup Guide

This guide will help you set up Supabase for user authentication and points system in your Morph's Corner application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and pnpm installed
3. Your Next.js application ready

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in your project details:
   - Name: `morphs-corner` (or your preferred name)
   - Database Password: Generate a strong password and save it
   - Region: Choose the closest to your users
5. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Project API Key** (anon/public key)

## Step 3: Set Up Environment Variables

Create a `.env.local` file in your project root and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase credentials.

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content from `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- `profiles` table for user information
- `user_points` table for points and levels
- `daily_tasks` table for task tracking
- `point_transactions` table for points history
- Row Level Security policies
- Triggers for automatic user setup

## Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** > **Settings**
2. Under **Site URL**, add your development URL: `http://localhost:3000`
3. Under **Redirect URLs**, add: `http://localhost:3000/auth/callback`

### Enable Social Providers (Optional)

To enable Google and Twitter login:

1. Go to **Authentication** > **Providers**
2. Enable **Google**:
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
   - Add your Client ID and Client Secret
3. Enable **Twitter**:
   - Get credentials from [Twitter Developer Portal](https://developer.twitter.com/)
   - Add your API Key and API Secret

## Step 6: Test the Integration

1. Start your development server: `pnpm dev`
2. Go to `http://localhost:3000`
3. Click the "Login" button
4. Try creating a new account
5. Check your Supabase dashboard to see the new user and profile

## Step 7: Test the Dashboard

1. After logging in, go to `http://localhost:3000/dashboard`
2. You should see:
   - Your user information
   - Points system (starting at 0)
   - Daily claim functionality
   - Task completion system

## Database Tables Overview

### `profiles`
- Stores user profile information
- Automatically created when user signs up
- Links to Supabase Auth users

### `user_points`
- Tracks total points, daily streak, and level
- One record per user
- Updated when points are earned

### `daily_tasks`
- Tracks daily task completions
- Prevents duplicate completions per day
- Records points earned per task

### `point_transactions`
- Complete history of all point changes
- Useful for analytics and debugging
- Includes transaction type and description

## Features Included

### Authentication
- ✅ Email/password signup and login
- ✅ Social login (Google, Twitter) - if configured
- ✅ Automatic profile creation
- ✅ Protected routes
- ✅ User session management

### Points System
- ✅ Daily points claiming (24-hour cooldown)
- ✅ Streak bonuses for consecutive days
- ✅ Task completion rewards
- ✅ Automatic level calculation
- ✅ Points transaction history
- ✅ Real-time updates

### Dashboard
- ✅ User profile display
- ✅ Points and level tracking
- ✅ Daily streak counter
- ✅ Task completion interface
- ✅ Responsive design

## Troubleshooting

### Common Issues

1. **"Invalid JWT" errors**
   - Check your environment variables
   - Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct

2. **Database connection errors**
   - Verify your project URL is correct
   - Check if your database is active in Supabase dashboard

3. **RLS policy errors**
   - Ensure the SQL schema was executed completely
   - Check that RLS policies are enabled

4. **User not found errors**
   - Make sure the trigger for user creation is working
   - Check if profiles and user_points records are created

### Development Tips

1. **Check Supabase logs**: Go to **Logs** in your dashboard to see real-time errors
2. **Use SQL Editor**: Test queries directly in Supabase
3. **Monitor Auth**: Check **Authentication** > **Users** to see registered users
4. **Database browser**: Use **Table Editor** to view and edit data

## Production Deployment

When deploying to production:

1. Update your **Site URL** in Supabase Auth settings
2. Add production **Redirect URLs**
3. Update environment variables in your hosting platform
4. Consider enabling additional security features in Supabase

## Next Steps

- Add email verification
- Implement password reset
- Add more task types
- Create leaderboards
- Add point redemption features
- Implement push notifications

Your Supabase integration is now complete! Users can sign up, earn points, and track their progress in the dashboard.

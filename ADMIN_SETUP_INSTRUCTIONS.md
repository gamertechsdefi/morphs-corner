# Admin Dashboard Setup Instructions

## Overview
This document outlines the admin system implementation that restricts article creation to admin users only. Regular users can no longer create articles - only designated admin users can.

## 🔧 Database Setup Required

### Step 1: Run Database Migration
Execute the SQL commands in `src/lib/database-migrations.sql` in your Supabase SQL editor:

```sql
-- Add role column to profiles table
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
```

### Step 2: Set Super Admin User
Set yourself as super admin by running this SQL (replace with your actual email):

```sql
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'your-actual-email@gmail.com';
```

**Important:** Replace `'your-actual-email@gmail.com'` with your real email address!

## 🔐 Super Admin Authentication System

### How It Works
Instead of hardcoded email lists, the system now uses **Super Admin Authentication**:

1. **Super Admin Role**: Set in database with `role = 'super_admin'`
2. **Authentication Modal**: Appears when trying to promote/demote users
3. **Secure Login**: Requires your actual login credentials
4. **Temporary Elevation**: Grants permission for that specific action

### No More Email Hardcoding
- ✅ **Removed** hardcoded admin email lists
- ✅ **Dynamic authentication** through login modal
- ✅ **Database-driven** role management
- ✅ **Secure credential verification**

## 🚀 Features Implemented

### 1. Admin Role System
- ✅ **Database schema** updated with role column
- ✅ **Role validation** with check constraints
- ✅ **Admin service** for role management
- ✅ **AuthContext** integration with admin status

### 2. Article Creation Restrictions
- ✅ **Create Article buttons** hidden for non-admin users
- ✅ **Create Article page** redirects non-admin users
- ✅ **My Articles page** restricted to admin users only
- ✅ **API protection** (existing routes already check authentication)

### 3. Admin Dashboard
- ✅ **Private admin dashboard** at `/admin` (no public links)
- ✅ **User management** - promote/demote users
- ✅ **Platform statistics** - user counts, article counts
- ✅ **Quick actions** - create articles, manage users

## 🔐 Access Control

### Regular Users
- ❌ **Cannot create articles**
- ❌ **Cannot access admin dashboard**
- ❌ **Cannot see create article buttons**
- ✅ **Can view and read articles**
- ✅ **Can like articles**
- ✅ **Can use points system**

### Admin Users
- ✅ **Can create articles**
- ✅ **Can access admin dashboard** at `/admin`
- ✅ **Can manage other users**
- ✅ **Can promote/demote users**
- ✅ **All regular user features**

## 🛡️ Security Features

### 1. Database Level
- ✅ **Role constraints** prevent invalid roles
- ✅ **Database functions** for admin checks
- ✅ **Indexed role column** for performance

### 2. Application Level
- ✅ **AuthContext integration** with real-time admin status
- ✅ **Route protection** for admin pages
- ✅ **Component-level** permission checks
- ✅ **API route protection** (existing auth system)

### 3. UI/UX Level
- ✅ **Hidden admin features** for non-admin users
- ✅ **Graceful redirects** for unauthorized access
- ✅ **No public admin links** (private access only)

## 📱 How to Access Admin Dashboard

### For Admin Users:
1. **Direct URL**: Navigate to `/admin` in your browser
2. **Bookmark**: Save the admin URL for quick access
3. **Type in address bar**: `yourdomain.com/admin`

### Admin Dashboard Features:
- **Overview Tab**: Platform statistics and quick actions
- **Users Tab**: Manage all users, promote/demote roles
- **Articles Tab**: Article management (basic for now)

## 🔄 User Role Management

### Promote User to Admin:
1. Go to `/admin`
2. Click "Users" tab
3. Find the user
4. Click "Make Admin"
5. **Super Admin Modal appears**
6. Enter your email and password
7. Click "Authenticate"
8. User is promoted to admin

### Demote Admin to User:
1. Go to `/admin`
2. Click "Users" tab
3. Find the admin user
4. Click "Remove Admin"
5. **Super Admin Modal appears**
6. Enter your email and password
7. Click "Authenticate"
8. User is demoted to regular user

### Super Admin Authentication:
- **Required for**: All role changes (promote/demote)
- **Credentials**: Your actual login email and password
- **Security**: Verifies you have `super_admin` role in database
- **Temporary**: Authentication is only for that specific action

## 🎨 What Changed for Users

### Before:
- All logged-in users could create articles
- "Create Article" button visible to everyone
- "My Articles" accessible to all users

### After:
- Only admin users can create articles
- "Create Article" button only visible to admins
- "My Articles" only accessible to admins
- Regular users see clean interface without article creation options

## 🚨 Important Notes

1. **No Public Admin Links**: The admin dashboard is not linked anywhere in the UI for privacy
2. **Direct Access Only**: Admins must navigate to `/admin` directly
3. **Database Migration Required**: Must run the SQL migration before the system works
4. **Email Configuration**: Update the admin email list in the service
5. **Existing Articles**: All existing articles remain unchanged

## 🔧 Troubleshooting

### If Admin Dashboard Shows "Unauthorized":
1. Check if your email is in the admin list in `adminService.ts`
2. Verify the database migration was run
3. Check if your profile has the correct role in the database

### If Create Article Button Still Shows:
1. Clear browser cache
2. Check if the user's role is properly set in the database
3. Verify the AuthContext is loading the role correctly

## 🎯 Next Steps

1. **Run the database migration**
2. **Update admin emails in the service**
3. **Test with admin and regular user accounts**
4. **Bookmark the admin dashboard URL**
5. **Promote initial admin users**

The system is now ready and secure! Only designated admin users can create articles while maintaining all other functionality for regular users.

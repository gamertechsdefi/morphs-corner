import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current user (must be authenticated)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in first.' },
        { status: 401 }
      );
    }

    const results = [];

    // Create profiles table
    try {
      const { error: profilesError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT NOT NULL,
            full_name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      if (profilesError) {
        results.push({ table: 'profiles', status: 'error', error: profilesError.message });
      } else {
        results.push({ table: 'profiles', status: 'success' });
      }
    } catch (error) {
      results.push({ table: 'profiles', status: 'error', error: 'Failed to create profiles table' });
    }

    // Create user_points table
    try {
      const { error: pointsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_points (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            total_points INTEGER DEFAULT 0,
            daily_streak INTEGER DEFAULT 0,
            last_claim_date TIMESTAMP WITH TIME ZONE,
            level TEXT DEFAULT 'Bronze',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
          );
        `
      });

      if (pointsError) {
        results.push({ table: 'user_points', status: 'error', error: pointsError.message });
      } else {
        results.push({ table: 'user_points', status: 'success' });
      }
    } catch (error) {
      results.push({ table: 'user_points', status: 'error', error: 'Failed to create user_points table' });
    }

    // Create daily_tasks table
    try {
      const { error: tasksError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.daily_tasks (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            task_type TEXT NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            points_earned INTEGER DEFAULT 0,
            completed_at TIMESTAMP WITH TIME ZONE,
            date DATE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, task_type, date)
          );
        `
      });

      if (tasksError) {
        results.push({ table: 'daily_tasks', status: 'error', error: tasksError.message });
      } else {
        results.push({ table: 'daily_tasks', status: 'success' });
      }
    } catch (error) {
      results.push({ table: 'daily_tasks', status: 'error', error: 'Failed to create daily_tasks table' });
    }

    // Create point_transactions table
    try {
      const { error: transactionsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.point_transactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            points INTEGER NOT NULL,
            transaction_type TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      if (transactionsError) {
        results.push({ table: 'point_transactions', status: 'error', error: transactionsError.message });
      } else {
        results.push({ table: 'point_transactions', status: 'success' });
      }
    } catch (error) {
      results.push({ table: 'point_transactions', status: 'error', error: 'Failed to create point_transactions table' });
    }

    // Create user's profile and points records
    try {
      // Create profile
      const { error: profileInsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || '',
        }, {
          onConflict: 'id'
        });

      if (profileInsertError) {
        results.push({ table: 'user_profile', status: 'error', error: profileInsertError.message });
      } else {
        results.push({ table: 'user_profile', status: 'success' });
      }

      // Create user points
      const { error: pointsInsertError } = await supabase
        .from('user_points')
        .upsert({
          user_id: user.id,
          total_points: 0,
          daily_streak: 0,
          level: 'Bronze',
        }, {
          onConflict: 'user_id'
        });

      if (pointsInsertError) {
        results.push({ table: 'user_points_record', status: 'error', error: pointsInsertError.message });
      } else {
        results.push({ table: 'user_points_record', status: 'success' });
      }
    } catch (error) {
      results.push({ table: 'user_records', status: 'error', error: 'Failed to create user records' });
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const totalCount = results.length;

    return NextResponse.json({
      message: `Database setup completed. ${successCount}/${totalCount} operations successful.`,
      results,
      success: successCount === totalCount
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error during database setup' },
      { status: 500 }
    );
  }
}

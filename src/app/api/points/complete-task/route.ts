import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Calculate user level based on points
function calculateLevel(points: number): string {
  if (points >= 10000) return 'Diamond';
  if (points >= 5000) return 'Platinum';
  if (points >= 2500) return 'Gold';
  if (points >= 1000) return 'Silver';
  return 'Bronze';
}

export async function POST(request: NextRequest) {
  try {
    const { taskType, points } = await request.json();

    if (!taskType || !points) {
      return NextResponse.json(
        { error: 'Task type and points are required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Check if task already completed today
    const { data: existingTask, error: taskCheckError } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('task_type', taskType)
      .eq('date', today)
      .eq('completed', true)
      .single();

    if (taskCheckError && taskCheckError.code === '42P01') {
      // Table doesn't exist, that's okay for now
      console.log('Daily tasks table does not exist yet.');
    } else if (existingTask) {
      return NextResponse.json(
        { error: 'Task already completed today' },
        { status: 400 }
      );
    }

    // Insert or update task (skip if table doesn't exist)
    const { error: taskError } = await supabase
      .from('daily_tasks')
      .upsert({
        user_id: user.id,
        task_type: taskType,
        completed: true,
        points_earned: points,
        completed_at: new Date().toISOString(),
        date: today
      });

    if (taskError && taskError.code !== '42P01') {
      console.error('Error updating task:', taskError);
      return NextResponse.json(
        { error: 'Failed to complete task' },
        { status: 500 }
      );
    }

    // Get current user points
    const { data: initialUserPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let userPoints = initialUserPoints;

    // Handle missing table or missing user points
    if (pointsError) {
      if (pointsError.code === '42P01') {
        // Table doesn't exist
        console.log('User points table does not exist yet.');
        return NextResponse.json(
          { error: 'Points system not initialized. Please set up the database first.' },
          { status: 503 }
        );
      } else if (pointsError.code === 'PGRST116') {
        // User points don't exist, create them
        const { data: newUserPoints, error: createError } = await supabase
          .from('user_points')
          .insert({
            user_id: user.id,
            total_points: 0,
            daily_streak: 0,
            level: 'Bronze',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user points:', createError);
          return NextResponse.json(
            { error: 'Failed to initialize user points' },
            { status: 500 }
          );
        }

        userPoints = newUserPoints;
      } else {
        console.error('Error fetching user points:', pointsError);
        return NextResponse.json(
          { error: 'Failed to fetch user points' },
          { status: 500 }
        );
      }
    }

    const newTotalPoints = userPoints.total_points + points;
    const newLevel = calculateLevel(newTotalPoints);

    // Update user points
    const { error: updateError } = await supabase
      .from('user_points')
      .update({
        total_points: newTotalPoints,
        level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating user points:', updateError);
      return NextResponse.json(
        { error: 'Failed to update points' },
        { status: 500 }
      );
    }

    // Record transaction
    await supabase
      .from('point_transactions')
      .insert({
        user_id: user.id,
        points: points,
        transaction_type: 'task_completion',
        description: `Completed task: ${taskType}`
      });

    return NextResponse.json({
      success: true,
      points: points,
      newTotal: newTotalPoints,
      newLevel: newLevel
    });

  } catch (error) {
    console.error('Complete task API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

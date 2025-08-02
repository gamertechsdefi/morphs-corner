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
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user points
    let { data: userPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .single();

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
        // User points don't exist, try to create them
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

    // Check if user can claim daily points
    if (userPoints.last_claim_date) {
      const lastClaimDate = new Date(userPoints.last_claim_date);
      const now = new Date();
      const timeDiff = now.getTime() - lastClaimDate.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);

      if (hoursDiff < 24) {
        return NextResponse.json(
          { error: 'Cannot claim yet', canClaim: false },
          { status: 400 }
        );
      }
    }

    const basePoints = 50;
    const streakBonus = userPoints.daily_streak * 5;
    const totalPoints = basePoints + streakBonus;

    // Check if this is a consecutive day
    const lastClaimDate = userPoints.last_claim_date ? new Date(userPoints.last_claim_date) : null;
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 1;
    if (lastClaimDate) {
      const lastClaimDay = lastClaimDate.toDateString();
      const yesterdayDay = yesterday.toDateString();
      
      if (lastClaimDay === yesterdayDay) {
        newStreak = userPoints.daily_streak + 1;
      }
    }

    const newTotalPoints = userPoints.total_points + totalPoints;
    const newLevel = calculateLevel(newTotalPoints);

    // Update user points
    const { error: updateError } = await supabase
      .from('user_points')
      .update({
        total_points: newTotalPoints,
        daily_streak: newStreak,
        last_claim_date: now.toISOString(),
        level: newLevel,
        updated_at: now.toISOString()
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
        points: totalPoints,
        transaction_type: 'daily_claim',
        description: `Daily claim: ${basePoints} base + ${streakBonus} streak bonus`
      });

    return NextResponse.json({
      success: true,
      points: totalPoints,
      newTotal: newTotalPoints,
      newStreak: newStreak,
      newLevel: newLevel
    });

  } catch (error) {
    console.error('Daily claim API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user points
    const { data: initialUserPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let userPoints = initialUserPoints;

    // Handle missing table or missing user points
    if (pointsError) {
      if (pointsError.code === '42P01') {
        // Table doesn't exist - return default values
        console.log('User points table does not exist yet. Returning default values.');
        return NextResponse.json({
          userPoints: {
            id: 'temp',
            user_id: user.id,
            total_points: 0,
            daily_streak: 0,
            last_claim_date: null,
            level: 'Bronze',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          canClaim: true,
          timeUntilNextClaim: ''
        });
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
    let canClaim = true;
    let timeUntilNextClaim = '';

    if (userPoints.last_claim_date) {
      const lastClaimDate = new Date(userPoints.last_claim_date);
      const now = new Date();
      const timeDiff = now.getTime() - lastClaimDate.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);

      if (hoursDiff < 24) {
        canClaim = false;
        const hoursLeft = 24 - hoursDiff;
        const hours = Math.floor(hoursLeft);
        const minutes = Math.floor((hoursLeft - hours) * 60);
        timeUntilNextClaim = `${hours}h ${minutes}m`;
      }
    }

    return NextResponse.json({
      userPoints,
      canClaim,
      timeUntilNextClaim
    });

  } catch (error) {
    console.error('User points API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

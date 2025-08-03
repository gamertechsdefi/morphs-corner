import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // First, try to authenticate the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if the authenticated user has super_admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to verify admin status' },
        { status: 500 }
      );
    }

    if (!profile || profile.role !== 'super_admin') {
      // Sign out the user since they're not a super admin
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'Access denied. Super admin privileges required.' },
        { status: 403 }
      );
    }

    // Store super admin session in a temporary way (you could use a more secure method)
    // For now, we'll just return success and let the client handle the temporary elevation
    return NextResponse.json({
      success: true,
      message: 'Super admin authenticated successfully',
      userId: authData.user.id,
      email: authData.user.email
    });

  } catch (error) {
    console.error('Super admin auth API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

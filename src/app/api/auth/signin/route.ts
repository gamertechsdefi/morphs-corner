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

    // Sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Signin error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to sign in' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Signed in successfully',
      user: data.user,
    });

  } catch (error) {
    console.error('Signin API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

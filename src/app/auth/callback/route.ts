import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  console.log('🔐 Auth callback triggered:', {
    origin: requestUrl.origin,
    hasCode: !!code,
    next: next
  })

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('❌ Error exchanging code for session:', error)
        return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error&message=${encodeURIComponent(error.message)}`)
      }

      if (data.user) {
        console.log('✅ User authenticated successfully:', data.user.email)

        // Create profile record if it doesn't exist (skip if table doesn't exist)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
            role: 'user', // Default role for new users
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (profileError && profileError.code !== '42P01') {
          console.error('❌ Profile creation error:', profileError);
        } else if (profileError?.code === '42P01') {
          console.log('⚠️ Profiles table does not exist yet. Skipping profile creation.');
        } else {
          console.log('✅ Profile created/updated for:', data.user.email)
        }

        // Initialize user points if they don't exist (skip if table doesn't exist)
        const { error: pointsError } = await supabase
          .from('user_points')
          .upsert({
            user_id: data.user.id,
            total_points: 0,
            daily_streak: 0,
            level: 'Bronze',
          }, {
            onConflict: 'user_id'
          });

        if (pointsError && pointsError.code !== '42P01') {
          console.error('Points initialization error:', pointsError);
        } else if (pointsError?.code === '42P01') {
          console.log('User points table does not exist yet. Skipping points initialization.');
        }
      }
    } catch (error) {
      console.error('💥 Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error&message=${encodeURIComponent('Authentication failed')}`)
    }
  }

  // URL to redirect to after sign in process completes
  console.log('🏠 Redirecting to:', next)
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}

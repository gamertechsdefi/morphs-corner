import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  context: unknown
) {
  try {
    // Type the context parameters within the function
    const params = (context as { params: { id: string } }).params;

    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ isLiked: false });
    }

    // Check if user has liked this article
    const { data: like, error } = await supabase
      .from('article_likes')
      .select('id')
      .eq('article_id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to check like status' }, { status: 500 });
    }

    return NextResponse.json({ isLiked: !!like });

  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

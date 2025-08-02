import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies: cookies });

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if article exists
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id')
      .eq('id', params.id)
      .eq('status', 'published')
      .single();

    if (articleError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Add like
    const { error } = await supabase
      .from('article_likes')
      .insert({
        article_id: params.id,
        user_id: session.user.id
      });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Already liked' }, { status: 400 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to like article' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Article liked successfully' });

  } catch (error) {
    console.error('Error liking article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies: cookies });

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove like
    const { error } = await supabase
      .from('article_likes')
      .delete()
      .eq('article_id', params.id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to unlike article' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Article unliked successfully' });

  } catch (error) {
    console.error('Error unliking article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

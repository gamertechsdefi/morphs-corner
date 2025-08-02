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

    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        content,
        html_content,
        category,
        tags,
        featured_image_url,
        additional_images,
        author_id,
        author_email,
        published_at,
        views_count,
        likes_count,
        created_at
      `)
      .eq('id', params.id)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('Database error:', error);
      
      if (error.code === '42P01') {
        return NextResponse.json({ 
          error: 'Articles table not found. Please set up the database first.',
          needsSetup: true 
        }, { status: 400 });
      }
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      
      return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
    }

    // Increment view count
    await supabase.rpc('increment_article_views', { article_uuid: params.id });

    return NextResponse.json({ article });

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, category, tags } = body;

    // Check if user owns the article
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('author_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (article.author_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the article
    const { data: updatedArticle, error } = await supabase
      .from('articles')
      .update({
        title,
        content,
        category,
        tags,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Article updated successfully',
      article: updatedArticle 
    });

  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user owns the article
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('author_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (article.author_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the article
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Article deleted successfully' });

  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies: cookies });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const author = searchParams.get('author');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        content,
        html_content,
        category,
        tags,
        featured_image_url,
        author_id,
        author_email,
        published_at,
        views_count,
        likes_count,
        created_at
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (author) {
      query = query.eq('author_id', author);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error('Database error:', error);
      
      // Handle case where articles table doesn't exist
      if (error.code === '42P01') {
        return NextResponse.json({ 
          articles: [],
          message: 'Articles table not found. No articles available yet.',
          needsSetup: true 
        });
      }
      
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published');

    if (category) {
      countQuery = countQuery.eq('category', category);
    }

    if (author) {
      countQuery = countQuery.eq('author_id', author);
    }

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      articles: articles || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({
      cookies: cookies
    });

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const htmlContent = formData.get('htmlContent') as string;
    const category = formData.get('category') as string;
    const tagsString = formData.get('tags') as string;
    const featuredImage = formData.get('featuredImage') as File | null;
    
    // Parse tags
    let tags: string[] = [];
    try {
      tags = JSON.parse(tagsString || '[]');
    } catch (error) {
      console.error('Error parsing tags:', error);
    }

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Handle image uploads (for now, we'll store them as base64 or file paths)
    let featuredImageUrl = null;
    let additionalImageUrls: string[] = [];

    if (featuredImage) {
      // In a real application, you would upload to a storage service like Supabase Storage, AWS S3, etc.
      // For now, we'll convert to base64 for demonstration
      const bytes = await featuredImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      featuredImageUrl = `data:${featuredImage.type};base64,${buffer.toString('base64')}`;
    }

    // Handle additional images
    const additionalImages: File[] = [];
    const inlineImages: { [key: string]: File } = {};

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('additionalImage_') && value instanceof File) {
        additionalImages.push(value);
      } else if (key.startsWith('inlineImage_') && value instanceof File) {
        const imageId = key.replace('inlineImage_', '');
        inlineImages[imageId] = value;
      }
    }

    for (const image of additionalImages) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const imageUrl = `data:${image.type};base64,${buffer.toString('base64')}`;
      additionalImageUrls.push(imageUrl);
    }

    // Process inline images and update HTML content
    let processedHtmlContent = htmlContent;
    const inlineImageUrls: { [key: string]: string } = {};

    for (const [imageId, file] of Object.entries(inlineImages)) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const imageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
      inlineImageUrls[imageId] = imageUrl;

      // Replace the temporary image src with the actual base64 data
      processedHtmlContent = processedHtmlContent.replace(
        new RegExp(`data-image-id="${imageId}"[^>]*src="[^"]*"`, 'g'),
        `data-image-id="${imageId}" src="${imageUrl}"`
      );
    }

    // Create the article in the database
    // First, try with html_content, if it fails, try without it
    let article, error;

    try {
      const result = await supabase
        .from('articles')
        .insert({
          title,
          content,
          html_content: processedHtmlContent,
          category,
          tags,
          featured_image_url: featuredImageUrl,
          additional_images: additionalImageUrls,
          author_id: session.user.id,
          author_email: session.user.email,
          published_at: new Date().toISOString(),
          status: 'published'
        })
        .select()
        .single();

      article = result.data;
      error = result.error;
    } catch (insertError) {
      // If html_content column doesn't exist, try without it
      console.log('Trying without html_content column...');
      const result = await supabase
        .from('articles')
        .insert({
          title,
          content,
          category,
          tags,
          featured_image_url: featuredImageUrl,
          additional_images: additionalImageUrls,
          author_id: session.user.id,
          author_email: session.user.email,
          published_at: new Date().toISOString(),
          status: 'published'
        })
        .select()
        .single();

      article = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Database error:', error);
      
      // Handle case where articles table doesn't exist
      if (error.code === '42P01') {
        return NextResponse.json({ 
          error: 'Articles table not found. Please set up the database first.',
          needsSetup: true 
        }, { status: 400 });
      }
      
      return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Article created successfully',
      id: article.id,
      article 
    });

  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

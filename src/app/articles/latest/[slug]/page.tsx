"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { createClient } from '@supabase/supabase-js';

type SupabaseArticle = {
  id: string;
  title?: string;
  description?: string;
  content?: string;
  author?: string;
  date?: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  readTime?: number;
  featured?: boolean;
  trending?: boolean;
  onboarding?: boolean;
  difficulty?: string;
  likes?: number;
  comments?: number;
  content_type?: string;
  status?: string;
};

import { useParams } from 'next/navigation';
import XPost from '@/components/XPost';

export default function LatestArticlePage() {
  const [article, setArticle] = useState<SupabaseArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    async function fetchArticle() {
      setLoading(true);
      // Robustly handle slug param
      let slugStr = '';
      if (typeof params.slug === 'string') {
        slugStr = params.slug;
      } else if (Array.isArray(params.slug)) {
        slugStr = params.slug.join('-');
      }
      // Query by slug field for robust matching
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .eq('content_type', 'latest')
        .eq('slug', slugStr)
        .limit(1);
      if (data && data.length > 0) {
        setArticle(data[0]);
      } else {
        setArticle(null);
      }
      setLoading(false);
    }
    fetchArticle();
  }, [params.slug]);

  useEffect(() => {
    if (!loading && !article) {
      router.push('/articles/latest');
    }
  }, [loading, article, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto py-12 px-4">
          <p className="text-gray-600">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto py-12 px-4">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {article.imageUrl && (
            <div className="w-full h-[400px] relative">
              <Image 
                src={article.imageUrl} 
                alt={article.title || ''} 
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          
          <div className="p-8">
            {/* Article header */}
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {article.category || "General"}
                </span>
                {article.date && (
                  <time dateTime={article.date} className="text-gray-500">
                    {new Date(article.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
              
              {/* Author info */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="inline-block h-12 w-12 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-lg font-medium">
                    {(article.author || "?")[0].toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">{article.author || "Unknown Author"}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{article.readTime || 5} min read</span>
                    {article.likes !== undefined && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{article.likes} likes</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* Article content */}
            <div className="prose prose-lg max-w-none">
              {article.content?.split(/(<blockquote class="twitter-tweet"[\s\S]*?<\/blockquote>)/).map((part, index) => {
                if (part.startsWith('<blockquote class="twitter-tweet"')) {
                  // Clean up the embed code
                  const cleanedHtml = part
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/\s+/g, ' ')
                    .trim();

                  return (
                    <div key={index} className="my-8 flex justify-center">
                      <div dangerouslySetInnerHTML={{ __html: cleanedHtml }} />
                    </div>
                  );
                }
                // Regular content
                return (
                  <div key={index} dangerouslySetInnerHTML={{ __html: part }} />
                );
              })}
            </div>
            {/* Load Twitter widgets script */}
            <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8" />
            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-sm font-medium text-gray-500 mb-3">Tagged with</h2>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

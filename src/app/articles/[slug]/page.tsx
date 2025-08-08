"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function ArticlePage() {
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
      // Try to fetch by slug (title slug)
      let slugStr = '';
      if (typeof params.slug === 'string') {
        slugStr = params.slug;
      } else if (Array.isArray(params.slug)) {
        slugStr = params.slug.join('-');
      }
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .ilike('title', slugStr ? slugStr.replace(/-/g, ' ') : '')
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
      <main className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <div className="text-gray-500 mb-2">{article.author} • {article.date}</div>
        {article.imageUrl && (
          <div className="mb-6">
            <Image src={article.imageUrl} alt={article.title || ''} width={800} height={400} className="rounded" />
          </div>
        )}
        <div className="prose max-w-none">
          <MarkdownRenderer content={article.content || ''} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

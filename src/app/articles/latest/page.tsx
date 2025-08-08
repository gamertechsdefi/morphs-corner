"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

import { SupabaseArticle } from '@/types/article';

export default function LatestArticlesPage() {
  const [articles, setArticles] = useState<SupabaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    async function fetchLatest() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("content_type", "latest")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(20);
      if (error) {
        setError(error.message);
        setArticles([]);
      } else {
        setArticles(data || []);
      }
      setLoading(false);
    }
    fetchLatest();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main content */}
          <main className="lg:col-span-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest News & Articles</h1>
              <p className="text-xl text-gray-500">Stay up to date with the latest developments in crypto and DeFi</p>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-lg shadow p-6">
                    <div className="flex space-x-4">
                      <div className="bg-gray-200 rounded w-48 h-32"></div>
                      <div className="flex-1 space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Empty state */}
            {articles.length === 0 && !loading && !error && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <p className="mt-4 text-lg text-gray-600">No articles published yet.</p>
                <p className="mt-2 text-sm text-gray-500">Check back soon for new content!</p>
              </div>
            )}

            {/* Articles list */}
            <div className="space-y-6">
              {articles.map((article) => {
                const slug = article.title ? article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '';
                return (
                  <Link
                    key={article.id}
                    href={slug ? `/articles/latest/${slug}` : "#"}
                    className="block bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row">
                      {article.imageUrl && (
                        <div className="md:w-72 flex-shrink-0">
                          <img
                            src={article.imageUrl}
                            alt={article.title || "Article image"}
                            className="h-48 md:h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                            {article.category || "General"}
                          </span>
                          {article.date && (
                            <time dateTime={article.date}>
                              {new Date(article.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </time>
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {article.title || "Untitled"}
                        </h2>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {article.description || "No description available."}
                        </p>
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {/* Author avatar placeholder */}
                            <span className="inline-block h-8 w-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                              {(article.author || "?")[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{article.author || "Unknown Author"}</p>
                            <div className="flex space-x-1 text-sm text-gray-500">
                              <span>{article.readTime || 5} min read</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-4 space-y-4">
              {/* Categories */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Categories</h2>
                <div className="space-y-2">
                  {['Crypto', 'DeFi', 'NFTs', 'Trading', 'Technology'].map((category) => (
                    <button
                      key={category}
                      className="block w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Popular Tags */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Popular Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {['Bitcoin', 'Ethereum', 'Web3', 'Blockchain', 'Metaverse'].map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}

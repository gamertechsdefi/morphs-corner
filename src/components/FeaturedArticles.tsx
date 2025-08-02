'use client';

import { useState, useEffect } from 'react';
import { FiCalendar, FiUser, FiEye, FiHeart, FiArrowRight } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  featured_image_url: string | null;
  author_id: string;
  author_email: string;
  published_at: string;
  views_count: number;
  likes_count: number;
}

export default function FeaturedArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedArticles();
  }, []);

  const fetchFeaturedArticles = async () => {
    try {
      const response = await fetch('/api/articles?limit=6');
      const data = await response.json();

      if (response.ok) {
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching featured articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className="bg-white py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Articles</h2>
            <div className="w-16 h-1 bg-green-500 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="bg-white py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Articles</h2>
          <div className="w-16 h-1 bg-green-500 mx-auto mb-8"></div>
          <p className="text-gray-600 mb-8">No articles published yet. Check back soon!</p>
          <Link
            href="/post-article"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Write First Article
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Articles</h2>
          <div className="w-16 h-1 bg-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the latest insights, tutorials, and analysis from our Web3 experts
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((article) => (
            <article key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              {/* Featured Image */}
              {article.featured_image_url ? (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={article.featured_image_url}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <div className="text-white text-4xl font-bold opacity-30">
                    {article.category.charAt(0)}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Category Badge */}
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mb-3">
                  {article.category}
                </span>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  <Link 
                    href={`/article/${article.id}`}
                    className="hover:text-green-600 transition-colors"
                  >
                    {article.title}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {truncateContent(article.content)}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <FiUser className="w-4 h-4" />
                      <span>{article.author_email.split('@')[0]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>{formatDate(article.published_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <FiEye className="w-4 h-4" />
                      <span>{article.views_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiHeart className="w-4 h-4" />
                      <span>{article.likes_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Articles Button */}
        <div className="text-center">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            View All Articles
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

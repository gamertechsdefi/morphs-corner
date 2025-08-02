'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FiArrowLeft, FiEdit, FiTrash2, FiEye, FiHeart, FiPlus, FiCalendar } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

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
  created_at: string;
}

export default function MyArticlesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/articles');
    } else if (user) {
      fetchMyArticles();
    }
  }, [user, authLoading, router]);

  const fetchMyArticles = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/articles?author=${user?.id}`);
      const data = await response.json();

      if (response.ok) {
        setArticles(data.articles || []);
      } else {
        setError(data.error || 'Failed to load articles');
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setArticles(articles.filter(article => article.id !== articleId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your articles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="px-4 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Articles
            </Link>
          </div>

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Articles</h1>
              <p className="text-gray-600">Manage your published articles</p>
            </div>
            
            <Link
              href="/articles/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Create Article
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Articles List */}
          {articles.length > 0 ? (
            <div className="space-y-6">
              {articles.map((article) => (
                <article key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="md:flex">
                    {/* Featured Image */}
                    <div className="md:w-48 h-48 md:h-auto">
                      {article.featured_image_url ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={article.featured_image_url}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                          <div className="text-white text-4xl font-bold opacity-80">
                            {article.category.charAt(0)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {/* Category Badge */}
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mb-2">
                            {article.category}
                          </span>

                          {/* Title */}
                          <h2 className="text-xl font-bold text-gray-900 mb-2">
                            <Link 
                              href={`/articles/${article.id}`}
                              className="hover:text-green-600 transition-colors"
                            >
                              {article.title}
                            </Link>
                          </h2>

                          {/* Excerpt */}
                          <p className="text-gray-600 mb-4">
                            {truncateContent(article.content)}
                          </p>

                          {/* Meta Info */}
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <FiCalendar className="w-4 h-4" />
                              <span>{formatDate(article.published_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiEye className="w-4 h-4" />
                              <span>{article.views_count} views</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiHeart className="w-4 h-4" />
                              <span>{article.likes_count} likes</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-4">
                          <Link
                            href={`/articles/${article.id}/edit`}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit article"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete article"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiEdit className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't published any articles yet. Start sharing your knowledge with the community!
              </p>
              <Link
                href="/articles/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Create Your First Article
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FiArrowLeft, FiCalendar, FiUser, FiEye, FiHeart, FiTag, FiShare2, FiClock } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getArticleById, getArticleByTitle, getArticleBySlug } from '@/data/articles';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface Article {
  id: string;
  title: string;
  content: string;
  html_content?: string;
  category: string;
  tags: string[];
  featured_image_url: string | null;
  additional_images?: string[];
  author_id: string;
  author_email: string;
  published_at: string;
  views_count: number;
  likes_count: number;
  created_at: string;
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchArticle(params.id as string);
      if (user) {
        checkLikeStatus(params.id as string);
      }
    }
  }, [params.id, user]);

  const fetchArticle = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      // First, try to find the article in our local data
      let localArticle = null;

      // Try to find by slug first (most common case now)
      localArticle = getArticleBySlug(id);

      // If not found by slug, try by numeric ID (backward compatibility)
      if (!localArticle) {
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          localArticle = getArticleById(numericId);
        }
      }

      // If still not found, try by title (backward compatibility)
      if (!localArticle) {
        localArticle = getArticleByTitle(decodeURIComponent(id));
      }

      if (localArticle) {
        // Convert local article format to expected format
        const convertedArticle = {
          id: localArticle.id.toString(),
          title: localArticle.title,
          content: localArticle.content,
          html_content: localArticle.content, // Use content as HTML
          category: localArticle.category,
          tags: localArticle.tags,
          featured_image_url: localArticle.imageUrl,
          author_id: '1',
          author_email: localArticle.author,
          published_at: localArticle.date,
          views_count: Math.floor(Math.random() * 1000) + 100, // Random views for demo
          likes_count: localArticle.likes,
          created_at: localArticle.date
        };

        setArticle(convertedArticle);
        setLikesCount(localArticle.likes);
        setLoading(false);
        return;
      }

      // If not found locally, try API
      const response = await fetch(`/api/articles/${id}`);
      const data = await response.json();

      if (response.ok) {
        setArticle(data.article);
        setLikesCount(data.article.likes_count || 0);
      } else {
        setError(data.error || 'Article not found');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const checkLikeStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}/like-status`);
      const data = await response.json();
      
      if (response.ok) {
        setIsLiked(data.isLiked);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!user || isLiking) return;

    setIsLiking(true);
    
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/articles/${params.id}/like`, {
        method,
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.content.substring(0, 200) + '...',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Article not found'}</p>
            <button 
              onClick={() => router.push('/articles')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Articles
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="px-4 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
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

          {/* Article Header */}
          <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Featured Image */}
            {article.featured_image_url && (
              <div className="relative h-64 md:h-96">
                <Image
                  src={article.featured_image_url}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="p-6 md:p-8">
              {/* Category Badge */}
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-4">
                {article.category}
              </span>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FiUser className="w-4 h-4" />
                  <span>By {article.author_email.split('@')[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  <span>{formatDate(article.published_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  <span>{getReadingTime(article.content)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiEye className="w-4 h-4" />
                  <span>{article.views_count} views</span>
                </div>
              </div>

              {/* Article Content */}
              <div className="mb-8">
                <MarkdownRenderer
                  content={article.content}
                  className="prose prose-lg max-w-none"
                />
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FiTag className="w-4 h-4" />
                    Tags:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  {user && (
                    <button
                      onClick={handleLike}
                      disabled={isLiking}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isLiked
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{likesCount}</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FiShare2 className="w-4 h-4" />
                    Share
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  Published {formatDate(article.published_at)}
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}

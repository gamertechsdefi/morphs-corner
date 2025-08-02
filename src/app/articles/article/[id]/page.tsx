'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FiHeart, FiEye, FiCalendar, FiUser, FiTag } from 'react-icons/fi';
import Image from 'next/image';

interface Article {
  id: string;
  title: string;
  content: string;
  html_content?: string;
  category: string;
  tags: string[];
  featured_image_url: string | null;
  additional_images: string[];
  author_id: string;
  author_email: string;
  published_at: string;
  views_count: number;
  likes_count: number;
  created_at: string;
}

export default function ArticlePage() {
  const params = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchArticle(params.id as string);
    }
  }, [params.id]);

  const fetchArticle = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`);
      const data = await response.json();

      if (response.ok) {
        setArticle(data.article);
        setLikesCount(data.article.likes_count);
        
        // Check if user has liked this article
        if (user) {
          checkIfLiked(articleId);
        }
      } else {
        setError(data.error || 'Failed to load article');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/like-status`);
      const data = await response.json();
      if (response.ok) {
        setIsLiked(data.isLiked);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like articles');
      return;
    }

    try {
      const response = await fetch(`/api/articles/${params.id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
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
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go Back
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
        <div className=" mx-auto">
          {/* Article Header */}
          <div className="bg-white p-8 mb-8">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-4">
                {article.category}
              </span>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>
              
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-2">
                  <FiUser className="w-4 h-4" />
                  <span>{article.author_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  <span>{new Date(article.published_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiEye className="w-4 h-4" />
                  <span>{article.views_count} views</span>
                </div>
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
                    isLiked 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likesCount}</span>
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {article.featured_image_url && (
              <div className="mb-8">
                <Image
                  src={article.featured_image_url}
                  alt={article.title}
                  width={800}
                  height={400}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="prose max-w-none">
              <div
                className="text-gray-800 leading-relaxed text-lg"
                dangerouslySetInnerHTML={{
                  __html: article.html_content || article.content
                }}
              />
            </div>

            {/* Additional Images */}
            {article.additional_images && article.additional_images.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {article.additional_images.map((imageUrl, index) => (
                    <Image
                      key={index}
                      src={imageUrl}
                      alt={`Additional image ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <FiTag className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-700">Tags:</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Articles
            </button>
            <button
              onClick={() => window.location.href = '/home'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

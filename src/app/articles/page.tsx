'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FiSearch, FiFilter, FiCalendar, FiUser, FiEye, FiHeart, FiTag, FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ArticlesPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'All',
    'Cryptocurrency',
    'DeFi',
    'NFTs',
    'Blockchain',
    'Web3',
    'Trading',
    'Analysis',
    'News',
    'Tutorial',
    'Opinion'
  ];

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    
    setSelectedCategory(category);
    setSearchQuery(search);
    setPagination(prev => ({ ...prev, page }));
    
    fetchArticles(page, category, search);
  }, [searchParams]);

  const fetchArticles = async (page: number = 1, category: string = '', search: string = '') => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (category && category !== 'All') {
        params.append('category', category);
      }

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();

      if (response.ok) {
        setArticles(data.articles || []);
        setPagination(data.pagination || pagination);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL(1, selectedCategory, searchQuery);
  };

  const handleCategoryChange = (category: string) => {
    const newCategory = category === 'All' ? '' : category;
    setSelectedCategory(newCategory);
    updateURL(1, newCategory, searchQuery);
  };

  const updateURL = (page: number, category: string, search: string) => {
    const params = new URLSearchParams();
    
    if (page > 1) params.set('page', page.toString());
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    
    const newURL = `/articles${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.pushState({}, '', newURL);
    
    fetchArticles(page, category, search);
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

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="px-4 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-between mb-6">
              <div></div>
              {user && (
                <div className="flex items-center gap-3">
                  <Link
                    href="/articles/my-articles"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    My Articles
                  </Link>
                  <Link
                    href="/articles/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    Create Article
                  </Link>
                </div>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Latest Articles
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover insights, tutorials, and analysis from our team of Web3 experts
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </form>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FiFilter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Category Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Categories:</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        (category === 'All' && !selectedCategory) || selectedCategory === category
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {pagination.total > 0 ? (
                <>
                  Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} articles
                </>
              ) : (
                'No articles found'
              )}
            </p>
            
            {(selectedCategory || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSearchQuery('');
                  updateURL(1, '', '');
                }}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Articles Grid */}
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {articles.map((article) => (
                <article key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Featured Image */}
                  {article.featured_image_url ? (
                    <div className="relative h-48">
                      <Image
                        src={article.featured_image_url}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      <div className="text-white text-6xl font-bold opacity-20">
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
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      <Link
                        href={`/articles/${article.id}`}
                        className="hover:text-green-600 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {truncateContent(article.content)}
                    </p>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                          >
                            <FiTag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{article.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
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
          ) : !loading && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "No articles have been published yet. Check back soon!"
                }
              </p>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSearchQuery('');
                    updateURL(1, '', '');
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => updateURL(pagination.page - 1, selectedCategory, searchQuery)}
                disabled={pagination.page <= 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  pagination.page <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <FiChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateURL(pageNum, selectedCategory, searchQuery)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        pageNum === pagination.page
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => updateURL(pagination.page + 1, selectedCategory, searchQuery)}
                disabled={pagination.page >= pagination.totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  pagination.page >= pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Next
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FiArrowLeft, FiX, FiSave, FiTag, FiEye, FiEdit3, FiUpload } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import RichTextEditor from '@/components/RichTextEditor';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function CreateArticlePage() {
  // Content type state
  const [contentType, setContentType] = useState<'featured' | 'latest' | 'article'>('article');
  const router = useRouter();
  const { user, loading: authLoading, canCreateArticles } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [readTime, setReadTime] = useState(5);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const categories = [
    'ARTICLE',
    'GUIDES',
    'ANALYSIS',
    'NEWS',
    'EDUCATION',
    'SECURITY',
    'TRADING',
    'DEFI',
    'NFT',
    'BLOCKCHAIN'
  ];

  // Auto-calculate read time based on content
  useEffect(() => {
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute
    setReadTime(estimatedReadTime);
  }, [content]);

  // Tag management functions
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || !canCreateArticles)) {
      router.push('/articles');
    }
  }, [user, authLoading, canCreateArticles, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // const removeImage = () => {
  //   setFeaturedImage(null);
  //   setImagePreview(null);
  // };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !category) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('category', category);
      formData.append('tags', JSON.stringify(tags));
      formData.append('contentType', contentType);
      if (featuredImage) {
        formData.append('featuredImage', featuredImage);
      }

      const response = await fetch('/api/articles/create', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/articles/${data.id}`);
        }, 2000);
      } else {
        setError(data.error || 'Failed to create article');
      }
    } catch (error) {
      console.error('Error creating article:', error);
      setError('Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !canCreateArticles) {
    return null; // Will redirect
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSave className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Created!</h2>
            <p className="text-gray-600">Redirecting to your article...</p>
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
          {/* Back Button & Latest Articles Link */}
          <div className="mb-6 flex flex-col md:flex-row gap-2 md:gap-6 items-start md:items-center">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Articles
            </Link>
            <Link
              href="/articles/latest"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <FiEye className="w-4 h-4" />
              View Latest News & Articles
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Article</h1>
            <p className="text-gray-600">Share your knowledge with the community</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="mb-6">
            <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden w-fit">
              <button
                type="button"
                onClick={() => setIsPreviewMode(false)}
                className={`px-4 py-2 text-sm font-medium ${!isPreviewMode ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FiEdit3 className="w-4 h-4 inline mr-2" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewMode(true)}
                className={`px-4 py-2 text-sm font-medium ${isPreviewMode ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FiEye className="w-4 h-4 inline mr-2" />
                Preview
              </button>
            </div>
          </div>

          {isPreviewMode ? (
            /* Preview Mode */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{title || 'Article Title'}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">{category || 'Category'}</span>
                  <span>{readTime} min read</span>
                  <span className="capitalize">{difficulty}</span>
                </div>
                {description && (
                  <p className="text-gray-600 text-lg mb-6">{description}</p>
                )}
                {imagePreview && (
                  <div className="mb-6">
                    <Image src={imagePreview} alt="Featured" width={800} height={400} className="w-full h-64 object-cover rounded-lg" />
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="prose prose-lg max-w-none">
                <MarkdownRenderer content={content} />
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              {/* Content Type Selector */}
              <div className="mb-6">
                <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type *
                </label>
                <select
                  id="contentType"
                  value={contentType}
                  onChange={e => setContentType(e.target.value as 'featured' | 'latest' | 'article')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="featured">Featured</option>
                  <option value="latest">Latest</option>
                  <option value="article">Article</option>
                </select>
              </div>
              {/* Title */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter article title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-medium"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your article..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Category and Difficulty Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'Beginner' | 'Intermediate' | 'Advanced')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Featured Image */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>

                {imagePreview ? (
                  <div className="relative">
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Featured image preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="featured-image"
                    />
                    <label htmlFor="featured-image" className="cursor-pointer">
                      <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click to upload featured image</p>
                      <p className="text-sm text-gray-400">PNG, JPG, GIF up to 10MB</p>
                    </label>
                  </div>
                )}
                {/* Insert Image into Content Button */}
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    const url = prompt('Enter image URL to insert into content:');
                    if (url) {
                      const alt = prompt('Enter alt text for the image:') || 'Image';
                      setContent(prev => {
                        const textarea = document.activeElement as HTMLTextAreaElement;
                        const insertPos = textarea?.selectionStart ?? prev.length;
                        return prev.slice(0, insertPos) + `![${alt}](${url})\n` + prev.slice(insertPos);
                      });
                    }
                  }}
                >
                  Insert Image into Content
                </button>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add a tag..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiTag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Read Time Display */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Estimated read time:</span>
                  <span className="font-medium">{readTime} minute{readTime !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Rich Text Editor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Start writing your article..."
                  className="min-h-[500px]"
                />
              </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <Link
                href="/articles"
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Create Article
                  </>
                )}
              </button>
            </div>
          </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
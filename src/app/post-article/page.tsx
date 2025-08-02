'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { FiImage, FiSave, FiEye, FiX, FiUpload, FiType, FiFileText, FiBold, FiItalic, FiUnderline, FiList, FiAlignLeft, FiAlignCenter, FiLink, FiCode } from 'react-icons/fi';
import Image from 'next/image';

interface ArticleData {
  title: string;
  content: string;
  htmlContent: string;
  category: string;
  tags: string[];
  featuredImage: File | null;
  additionalImages: File[];
  inlineImages: { [key: string]: File };
}

export default function PostArticlePage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesRef = useRef<HTMLInputElement>(null);

  const [articleData, setArticleData] = useState<ArticleData>({
    title: '',
    content: '',
    htmlContent: '',
    category: '',
    tags: [],
    featuredImage: null,
    additionalImages: [],
    inlineImages: {}
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);

  // Rich text editor state
  const editorRef = useRef<HTMLDivElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Rich text editor functions
  const updateContent = useCallback(() => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      const textContent = editorRef.current.innerText;
      setArticleData(prev => ({
        ...prev,
        content: textContent,
        htmlContent: htmlContent
      }));
    }
  }, []);

  const execCommand = useCallback((command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      updateContent();
    }
  }, [updateContent]);

  const handleEditorInput = useCallback(() => {
    // Simple debounced update to prevent cursor issues
    setTimeout(() => {
      updateContent();
    }, 0);
  }, [updateContent]);

  const insertInlineImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const imageId = `inline-img-${Date.now()}`;

      // Store the file for later upload
      setArticleData(prev => ({
        ...prev,
        inlineImages: {
          ...prev.inlineImages,
          [imageId]: file
        }
      }));

      // Insert image into editor
      const img = `<img src="${imageUrl}" alt="Inline image" data-image-id="${imageId}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" />`;
      execCommand('insertHTML', img);
    };
    reader.readAsDataURL(file);
  }, [execCommand]);

  const handleInlineImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      insertInlineImage(file);
      // Reset input
      if (inlineImageInputRef.current) {
        inlineImageInputRef.current.value = '';
      }
    }
  }, [insertInlineImage]);

  const insertLink = useCallback(() => {
    if (linkUrl && linkText) {
      const link = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #059669; text-decoration: underline;">${linkText}</a>`;
      execCommand('insertHTML', link);
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
    }
  }, [linkUrl, linkText, execCommand]);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current) {
      if (articleData.htmlContent) {
        editorRef.current.innerHTML = articleData.htmlContent;
      } else if (editorRef.current.innerHTML.trim() === '') {
        editorRef.current.innerHTML = '<p><br></p>';
      }
    }
  }, []);



  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please log in to post articles.</p>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFeaturedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArticleData(prev => ({ ...prev, featuredImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFeaturedImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setArticleData(prev => ({ 
        ...prev, 
        additionalImages: [...prev.additionalImages, ...files] 
      }));

      // Create previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAdditionalImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAdditionalImage = (index: number) => {
    setArticleData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !articleData.tags.includes(tagInput.trim())) {
      setArticleData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setArticleData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!articleData.title.trim() || !articleData.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('title', articleData.title);
      formData.append('content', articleData.content);
      formData.append('htmlContent', articleData.htmlContent);
      formData.append('category', articleData.category);
      formData.append('tags', JSON.stringify(articleData.tags));

      if (articleData.featuredImage) {
        formData.append('featuredImage', articleData.featuredImage);
      }

      articleData.additionalImages.forEach((image, index) => {
        formData.append(`additionalImage_${index}`, image);
      });

      // Add inline images
      Object.entries(articleData.inlineImages).forEach(([imageId, file]) => {
        formData.append(`inlineImage_${imageId}`, file);
      });

      const response = await fetch('/api/articles/create', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert('Article published successfully!');
        router.push(`/article/${result.id}`);
      } else {
        throw new Error('Failed to publish article');
      }
    } catch (error) {
      console.error('Error publishing article:', error);
      alert('Failed to publish article. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="px-4 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Article</h1>
              <p className="text-gray-600">Share your insights with the community</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FiEye className="w-4 h-4" />
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <FiSave className="w-4 h-4" />
                {isSubmitting ? 'Publishing...' : 'Publish Article'}
              </button>
            </div>
          </div>

          {previewMode ? (
            /* Preview Mode */
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-4">
                  {articleData.category || 'Uncategorized'}
                </span>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {articleData.title || 'Article Title'}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span>By {user.email}</span>
                  <span>•</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {featuredImagePreview && (
                <div className="mb-8">
                  <Image
                    src={featuredImagePreview}
                    alt="Featured image"
                    width={800}
                    height={400}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="prose max-w-none">
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: articleData.htmlContent || '<p>Article content will appear here...</p>'
                  }}
                />
              </div>

              {articleData.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {articleData.tags.map((tag, index) => (
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
          ) : (
            /* Edit Mode */
            <div className="space-y-8">
              {/* Article Title */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <FiType className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Article Title</h2>
                </div>
                <input
                  type="text"
                  value={articleData.title}
                  onChange={(e) => setArticleData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your article title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                />
              </div>

              {/* Category and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3>
                  <select
                    value={articleData.category}
                    onChange={(e) => setArticleData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Add a tag..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {articleData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-blue-600"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <FiImage className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Featured Image</h2>
                </div>

                {featuredImagePreview ? (
                  <div className="relative">
                    <Image
                      src={featuredImagePreview}
                      alt="Featured image preview"
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <button
                      onClick={() => {
                        setArticleData(prev => ({ ...prev, featuredImage: null }));
                        setFeaturedImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload featured image</p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageUpload}
                  className="hidden"
                />
              </div>

              {/* Article Content */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <FiFileText className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Article Content</h2>
                </div>

                {/* Rich Text Editor Toolbar */}
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-300 p-3 flex flex-wrap gap-2">
                    {/* Text Formatting */}
                    <div className="flex gap-1 border-r border-gray-300 pr-2">
                      <button
                        type="button"
                        onClick={() => execCommand('bold')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Bold"
                      >
                        <FiBold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('italic')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Italic"
                      >
                        <FiItalic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('underline')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Underline"
                      >
                        <FiUnderline className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Headings */}
                    <div className="flex gap-1 border-r border-gray-300 pr-2">
                      <select
                        onChange={(e) => execCommand('formatBlock', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded"
                        defaultValue=""
                      >
                        <option value="">Normal</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                        <option value="h4">Heading 4</option>
                        <option value="p">Paragraph</option>
                      </select>
                    </div>

                    {/* Lists */}
                    <div className="flex gap-1 border-r border-gray-300 pr-2">
                      <button
                        type="button"
                        onClick={() => execCommand('insertUnorderedList')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Bullet List"
                      >
                        <FiList className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('insertOrderedList')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Numbered List"
                      >
                        <span className="text-sm font-bold">1.</span>
                      </button>
                    </div>

                    {/* Alignment */}
                    <div className="flex gap-1 border-r border-gray-300 pr-2">
                      <button
                        type="button"
                        onClick={() => execCommand('justifyLeft')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Align Left"
                      >
                        <FiAlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('justifyCenter')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Align Center"
                      >
                        <FiAlignCenter className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Insert Options */}
                    <div className="flex gap-1 border-r border-gray-300 pr-2">
                      <button
                        type="button"
                        onClick={() => setShowLinkDialog(true)}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Insert Link"
                      >
                        <FiLink className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => inlineImageInputRef.current?.click()}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Insert Image"
                      >
                        <FiImage className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('formatBlock', 'pre')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Code Block"
                      >
                        <FiCode className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Utility */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => execCommand('removeFormat')}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        title="Clear Formatting"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Rich Text Editor */}
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorInput}
                    onPaste={(e) => {
                      // Handle paste events
                      e.preventDefault();
                      const text = e.clipboardData.getData('text/plain');
                      document.execCommand('insertText', false, text);
                    }}
                    suppressContentEditableWarning={true}
                    className="min-h-[400px] p-4 focus:outline-none prose max-w-none"
                    style={{
                      lineHeight: '1.6',
                      fontSize: '16px',
                      direction: 'ltr',
                      textAlign: 'left',
                      unicodeBidi: 'normal'
                    }}
                    data-placeholder="Start writing your article here..."
                  />
                </div>

                {/* Hidden input for inline images */}
                <input
                  ref={inlineImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInlineImageUpload}
                  className="hidden"
                />

                {/* Link Dialog */}
                {showLinkDialog && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                      <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link Text
                          </label>
                          <input
                            type="text"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            placeholder="Enter link text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL
                          </label>
                          <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={insertLink}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Insert Link
                        </button>
                        <button
                          onClick={() => {
                            setShowLinkDialog(false);
                            setLinkUrl('');
                            setLinkText('');
                          }}
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-2 text-sm text-gray-500">
                  {articleData.content.length} characters
                </div>
              </div>

              {/* Additional Images */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <FiImage className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Additional Images</h2>
                  <span className="text-sm text-gray-500">(Optional)</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {additionalImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={preview}
                        alt={`Additional image ${index + 1}`}
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeAdditionalImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => additionalImagesRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
                >
                  <FiUpload className="w-4 h-4" />
                  Add More Images
                </button>

                <input
                  ref={additionalImagesRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

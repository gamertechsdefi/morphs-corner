'use client';

import { useState, useRef } from 'react';
import { 
  FiBold, FiItalic, FiUnderline, FiCode, FiLink, FiImage, FiVideo, 
  FiList, FiAlignLeft, FiAlignCenter, FiAlignRight,  
  FiType, FiEye, FiEdit3, FiPlus, FiX, FiAlertCircle, FiInfo,
  FiSquare
} from 'react-icons/fi';
import MarkdownRenderer from './MarkdownRenderer';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className = '' }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert text at cursor position
  const insertAtCursor = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newValue = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    onChange(newValue);

    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // Formatting functions
  const formatBold = () => insertAtCursor('**', '**', 'bold text');
  const formatItalic = () => insertAtCursor('*', '*', 'italic text');
  const formatUnderline = () => insertAtCursor('<u>', '</u>', 'underlined text');
  const formatCode = () => insertAtCursor('`', '`', 'code');
  const formatCodeBlock = () => insertAtCursor('\n```\n', '\n```\n', 'code block');
  const formatQuote = () => insertAtCursor('\n> ', '', 'quote text');
  const formatH1 = () => insertAtCursor('\n# ', '', 'Heading 1');
  const formatH2 = () => insertAtCursor('\n## ', '', 'Heading 2');
  const formatH3 = () => insertAtCursor('\n### ', '', 'Heading 3');
  const formatList = () => insertAtCursor('\n* ', '', 'list item');
  const formatNumberedList = () => insertAtCursor('\n1. ', '', 'numbered item');

  // Modal handlers
  const insertImage = (url: string, alt: string) => {
    insertAtCursor(`![${alt}](${url})`);
    setShowImageModal(false);
  };

  const insertVideo = (url: string, title: string) => {
    insertAtCursor(`\n<div class="video-container my-6">\n  <iframe src="${url}" title="${title}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>\n</div>\n`);
    setShowVideoModal(false);
  };

  const insertLink = (url: string, text: string) => {
    insertAtCursor(`[${text}](${url})`);
    setShowLinkModal(false);
  };

  const insertNote = (type: 'info' | 'warning' | 'success' | 'error', content: string) => {
    const icons = {
      info: '💡',
      warning: '⚠️',
      success: '✅',
      error: '❌'
    };
    insertAtCursor(`\n> ${icons[type]} **${type.toUpperCase()}:** ${content}\n`);
    setShowNoteModal(false);
  };

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsPreview(false)}
              className={`px-3 py-1 text-sm font-medium ${!isPreview ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FiEdit3 className="w-4 h-4 inline mr-1" />
              Write
            </button>
            <button
              type="button"
              onClick={() => setIsPreview(true)}
              className={`px-3 py-1 text-sm font-medium ${isPreview ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FiEye className="w-4 h-4 inline mr-1" />
              Preview
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Text Formatting */}
          <button type="button" onClick={formatBold} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded" title="Bold">
            <FiBold className="w-4 h-4" />
          </button>
          <button type="button" onClick={formatItalic} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded" title="Italic">
            <FiItalic className="w-4 h-4" />
          </button>
          <button type="button" onClick={formatUnderline} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded" title="Underline">
            <FiUnderline className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Headers */}
          <button type="button" onClick={formatH1} className="px-2 py-1 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded" title="Heading 1">
            H1
          </button>
          <button type="button" onClick={formatH2} className="px-2 py-1 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded" title="Heading 2">
            H2
          </button>
          <button type="button" onClick={formatH3} className="px-2 py-1 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded" title="Heading 3">
            H3
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Lists */}
          <button type="button" onClick={formatList} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded" title="Bullet List">
            <FiList className="w-4 h-4" />
          </button>
          <button type="button" onClick={formatNumberedList} className="px-2 py-1 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded" title="Numbered List">
            1.
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Code & Quote */}
          <button type="button" onClick={formatCode} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded" title="Inline Code">
            <FiCode className="w-4 h-4" />
          </button>
          <button type="button" onClick={formatCodeBlock} className="px-2 py-1 text-sm font-mono text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded" title="Code Block">
            {'{}'}
          </button>
          <button type="button" onClick={formatQuote} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded" title="Quote">
            <FiSquare className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Media & Links */}
          <button type="button" onClick={() => setShowImageModal(true)} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded" title="Insert Image">
            <FiImage className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setShowVideoModal(true)} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded" title="Insert Video">
            <FiVideo className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setShowLinkModal(true)} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded" title="Insert Link">
            <FiLink className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setShowNoteModal(true)} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded" title="Insert Note">
            <FiAlertCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[400px]">
        {isPreview ? (
          <div className="p-6 bg-white">
            <MarkdownRenderer content={value} />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Start writing your article..."}
            className="w-full h-[400px] p-6 border-none outline-none resize-none font-mono text-sm leading-relaxed"
          />
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <ImageModal
          onInsert={insertImage}
          onClose={() => setShowImageModal(false)}
        />
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <VideoModal
          onInsert={insertVideo}
          onClose={() => setShowVideoModal(false)}
        />
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <LinkModal
          onInsert={insertLink}
          onClose={() => setShowLinkModal(false)}
        />
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <NoteModal
          onInsert={insertNote}
          onClose={() => setShowNoteModal(false)}
        />
      )}
    </div>
  );
}

// Image Modal Component
function ImageModal({ onInsert, onClose }: { onInsert: (url: string, alt: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onInsert(url.trim(), alt.trim() || 'Image');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Insert Image</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Insert Image
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Video Modal Component
function VideoModal({ onInsert, onClose }: { onInsert: (url: string, title: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onInsert(url.trim(), title.trim() || 'Video');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Insert Video</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (YouTube, Vimeo, etc.)</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/embed/VIDEO_ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Insert Video
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Link Modal Component
function LinkModal({ onInsert, onClose }: { onInsert: (url: string, text: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && text.trim()) {
      onInsert(url.trim(), text.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Insert Link</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Click here"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Insert Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Note Modal Component
function NoteModal({ onInsert, onClose }: { onInsert: (type: 'info' | 'warning' | 'success' | 'error', content: string) => void; onClose: () => void }) {
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'error'>('info');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onInsert(type, content.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Insert Note</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="info">💡 Info</option>
              <option value="warning">⚠️ Warning</option>
              <option value="success">✅ Success</option>
              <option value="error">❌ Error</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your note content..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Insert Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

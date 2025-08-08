'use client';

import { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    xPostEmbed: {
      setXPost: (url: string) => ReturnType;
    };
  }
}

// Uses global TwitterWidgets type from src/types/twitter.d.ts

const XPostEmbed = Node.create({
  name: 'xPostEmbed',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      embedHtml: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-tweet-content]',
      },
    ]
  },

  renderHTML({ node }) {
    const div = document.createElement('div');
    div.innerHTML = node.attrs.embedHtml;
    
    // Load Twitter widgets script if needed
    if (typeof window !== 'undefined' && !document.getElementById('twitter-widgets')) {
      const script = document.createElement('script');
      script.id = 'twitter-widgets';
      script.src = 'https://platform.twitter.com/widgets.js';
      script.charset = 'utf-8';
      script.async = true;
      document.head.appendChild(script);
    }

    return ['div', 
      { 
        'data-tweet-content': '',
        class: 'tweet-embed my-4'
      },
      ['div', { 
        contenteditable: 'false',
        class: 'twitter-embed',
        innerHTML: node.attrs.embedHtml
      }]
    ]
  },
});
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';


import { 
  FiBold, FiItalic, FiUnderline, FiCode, FiLink, FiImage, 
  FiList, FiType, FiEye, FiEdit3, FiMonitor, FiTwitter
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none min-h-[400px] p-6 focus:outline-none',
      },
    },
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg shadow-md max-w-full h-auto transition-all duration-200 hover:scale-[1.02]',
          loading: 'lazy',
        },
        allowBase64: true
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Underline,
      XPostEmbed,
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your article...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    enableCoreExtensions: true,
    enableInputRules: true,
    enablePasteRules: true,
    immediatelyRender: false,
  });

  const handleImageUpload = async (file: File) => {
    if (!editor) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      // Create wrapper div
      const wrapper = document.createElement('div');
      wrapper.className = 'relative group my-4';
      
      // Create image element
      editor
        .chain()
        .focus()
        .setImage({ 
          src: dataUrl,
          alt: file.name || 'Uploaded image',
          title: file.name || 'Uploaded image'
        })
        .run();
    };
    reader.readAsDataURL(file);
  };

  if (!editor) {
    return null;
  }

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
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
            title="Bold"
          >
            <FiBold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
            title="Italic"
          >
            <FiItalic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
            title="Underline"
          >
            <FiUnderline className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Headers */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded ${
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
            }`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
            }`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
            }`}
            title="Heading 3"
          >
            H3
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded ${
              editor.isActive('bulletList') ? 'bg-gray-200' : ''
            }`}
            title="Bullet List"
          >
            <FiList className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Code */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded ${
              editor.isActive('code') ? 'bg-gray-200' : ''
            }`}
            title="Code"
          >
            <FiCode className="w-4 h-4" />
          </button>

          {/* Media & Links */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                await handleImageUpload(file);
                e.target.value = '';
              }
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            title="Insert Image"
          >
            <FiImage className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const url = window.prompt('Enter link URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded ${
              editor.isActive('link') ? 'bg-gray-200' : ''
            }`}
            title="Insert Link"
          >
            <FiLink className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              // Create dialog for X post
              const dialog = document.createElement('div');
              dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
              dialog.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                  <h3 class="text-lg font-medium mb-4">Embed X Post</h3>
                  <form id="xPostForm" class="space-y-4">
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Paste Embed Code</label>
                        <textarea
                          id="embedCode"
                          rows="4"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          placeholder="<blockquote class='twitter-tweet'>...</blockquote>"
                        ></textarea>
                        <p class="mt-1 text-sm text-gray-500">
                          Paste the embed code from X (click Share → Embed Post)
                        </p>
                      </div>
                      <div class="relative">
                        <div class="absolute inset-0 flex items-center" aria-hidden="true">
                          <div class="w-full border-t border-gray-300"></div>
                        </div>
                        <div class="relative flex justify-center">
                          <span class="px-2 bg-white text-sm text-gray-500">or</span>
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">X Post URL</label>
                        <input type="url" id="xPostUrl"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://twitter.com/username/status/123456789">
                      </div>
                    </div>
                    <div class="flex justify-end space-x-3 pt-2">
                      <button type="button" id="cancelBtn"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                        Cancel
                      </button>
                      <button type="submit"
                        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                        Embed
                      </button>
                    </div>
                  </form>
                </div>
              `;

              document.body.appendChild(dialog);

              // Get form elements
              const form = dialog.querySelector('#xPostForm') as HTMLFormElement;
              const embedCodeInput = dialog.querySelector('#embedCode') as HTMLTextAreaElement;
              const urlInput = dialog.querySelector('#xPostUrl') as HTMLInputElement;
              const cancelBtn = dialog.querySelector('#cancelBtn') as HTMLButtonElement;

              // Handle form submission
              form.addEventListener('submit', (e) => {
                e.preventDefault();
                const embedCode = embedCodeInput.value.trim();
                const url = urlInput.value.trim();

                if (embedCode) {
                  // Use the embed code directly
                  editor.chain()
                    .focus()
                    .insertContent({
                      type: 'xPostEmbed',
                      attrs: { embedHtml: embedCode }
                    })
                    .run();
                } else if (url) {
                  // Ensure URL is in the correct format
                  try {
                    const tweetUrl = new URL(url);
                    if (tweetUrl.hostname === 'twitter.com' || tweetUrl.hostname === 'x.com') {
                      // Convert URL to embed HTML
                      const embedHtml = `<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote>`;
                      editor.chain()
                        .focus()
                        .insertContent({
                          type: 'xPostEmbed',
                          attrs: { embedHtml }
                        })
                        .run();
                    } else {
                      alert('Please enter a valid X (Twitter) URL');
                      return;
                    }
                  } catch (e) {
                    alert('Please enter a valid URL');
                    return;
                  }
                } else {
                  alert('Please provide either an embed code or a URL');
                  return;
                }

                document.body.removeChild(dialog);
              });

              // Handle cancel
              cancelBtn.addEventListener('click', () => {
                document.body.removeChild(dialog);
              });

              // Focus URL input
              urlInput.focus();
            }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            title="Embed X Post"
          >
            <FiTwitter className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              const text = editor.state.selection.empty
                ? undefined
                : editor.state.doc.textBetween(
                    editor.state.selection.from,
                    editor.state.selection.to,
                  );

              // Create dialog
              const dialog = document.createElement('div');
              dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
              dialog.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                  <h3 class="text-lg font-medium mb-4">Insert Website Link</h3>
                  <form id="websiteLinkForm" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                      <input type="url" id="websiteUrl" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Display Text</label>
                      <input type="text" id="websiteName"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Website name">
                    </div>
                    <div class="flex justify-end space-x-3 pt-2">
                      <button type="button" id="cancelBtn"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                        Cancel
                      </button>
                      <button type="submit"
                        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                        Insert
                      </button>
                    </div>
                  </form>
                </div>
              `;

              document.body.appendChild(dialog);

              // Get form elements
              const form = dialog.querySelector('#websiteLinkForm') as HTMLFormElement;
              const urlInput = dialog.querySelector('#websiteUrl') as HTMLInputElement;
              const nameInput = dialog.querySelector('#websiteName') as HTMLInputElement;
              const cancelBtn = dialog.querySelector('#cancelBtn') as HTMLButtonElement;

              // Set initial value if text is selected
              if (text) {
                nameInput.value = text;
              }

              // Handle form submission
              form.addEventListener('submit', (e) => {
                e.preventDefault();
                const url = urlInput.value;
                const displayName = nameInput.value || new URL(url).hostname;

                editor.chain()
                  .focus()
                  .insertContent({
                    type: 'text',
                    text: displayName,
                    marks: [
                      {
                        type: 'link',
                        attrs: {
                          href: url,
                          target: '_blank',
                          rel: 'noopener noreferrer'
                        }
                      }
                    ]
                  })
                  .run();

                document.body.removeChild(dialog);
              });

              // Handle cancel
              cancelBtn.addEventListener('click', () => {
                document.body.removeChild(dialog);
              });

              // Focus URL input
              urlInput.focus();
            }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            title="Insert Website Link"
          >
            <FiMonitor className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[400px] bg-white">
        {isPreview ? (
          <div className="p-6">
            <MarkdownRenderer content={value} />
          </div>
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  );
}

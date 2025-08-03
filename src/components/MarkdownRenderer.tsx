'use client';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Simple markdown to HTML converter
  const convertMarkdownToHTML = (markdown: string): string => {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-900 mb-4 mt-8">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mb-6 mt-10">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-8 mt-12">$1</h1>');

    // Bold + Italic (must come before individual bold/italic)
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold italic text-gray-900">$1</strong>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 rounded-lg p-4 my-4 overflow-x-auto"><code class="text-sm">$1</code></pre>');

    // Inline code
    html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>');

    // Links (markdown format)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Unordered lists
    html = html.replace(/^\* (.*$)/gim, '<li class="mb-2">$1</li>');
    html = html.replace(/(<li class="mb-2">.*<\/li>)/g, '<ul class="list-disc list-inside mb-4 space-y-2 ml-4">$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="mb-2">$1</li>');

    // Paragraphs
    html = html.replace(/^(?!<[h|u|o|l|p|d])(.*$)/gim, '<p class="mb-4 text-gray-700 leading-relaxed">$1</p>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">');

    // Clean up empty paragraphs
    html = html.replace(/<p class="mb-4 text-gray-700 leading-relaxed"><\/p>/g, '');

    // Tables (basic support)
    html = html.replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map((cell: string) => cell.trim());
      const cellsHtml = cells.map((cell: string) => `<td class="border border-gray-300 px-4 py-2">${cell}</td>`).join('');
      return `<tr>${cellsHtml}</tr>`;
    });

    // Wrap tables
    html = html.replace(/(<tr>.*<\/tr>)/g, '<table class="w-full border-collapse border border-gray-300 my-4">$1</table>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700">$1</blockquote>');

    return html;
  };

  const htmlContent = convertMarkdownToHTML(content);

  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

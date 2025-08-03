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
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-black mb-4 mt-8">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-black mb-6 mt-10">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-black mb-8 mt-12">$1</h1>');

    // Bold + Italic (must come before individual bold/italic)
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold italic text-black">$1</strong>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-black">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-black text-white rounded-lg p-4 my-4 overflow-x-auto"><code class="text-sm">$1</code></pre>');

    // Inline code
    html = html.replace(/`(.*?)`/g, '<code class="bg-black text-white px-2 py-1 rounded text-sm font-mono">$1</code>');

    // Underline (HTML tags)
    html = html.replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>');

    // Links (markdown format)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Unordered lists
    html = html.replace(/^\* (.*$)/gim, '<li class="mb-2">$1</li>');
    html = html.replace(/(<li class="mb-2">.*<\/li>)/g, '<ul class="list-disc list-inside mb-4 space-y-2 ml-4">$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="mb-2">$1</li>');

    // Paragraphs
    html = html.replace(/^(?!<[h|u|o|l|p|d])(.*$)/gim, '<p class="mb-4 text-black leading-relaxed">$1</p>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="mb-4 text-black leading-relaxed">');

    // Clean up empty paragraphs
    html = html.replace(/<p class="mb-4 text-black leading-relaxed"><\/p>/g, '');

    // Tables (basic support)
    html = html.replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map((cell: string) => cell.trim());
      const cellsHtml = cells.map((cell: string) => `<td class="border border-black px-4 py-2 text-black">${cell}</td>`).join('');
      return `<tr>${cellsHtml}</tr>`;
    });

    // Wrap tables
    html = html.replace(/(<tr>.*<\/tr>)/g, '<table class="w-full border-collapse border border-black my-4">$1</table>');

    // Enhanced Blockquotes with note types
    html = html.replace(/^> 💡 \*\*INFO:\*\* (.*$)/gim, '<div class="border-l-4 border-blue-500 bg-blue-50 p-4 my-4 rounded-r-lg"><div class="flex items-start gap-2"><span class="text-blue-600 text-lg">💡</span><div><strong class="text-blue-800">INFO:</strong> <span class="text-blue-700">$1</span></div></div></div>');
    html = html.replace(/^> ⚠️ \*\*WARNING:\*\* (.*$)/gim, '<div class="border-l-4 border-yellow-500 bg-yellow-50 p-4 my-4 rounded-r-lg"><div class="flex items-start gap-2"><span class="text-yellow-600 text-lg">⚠️</span><div><strong class="text-yellow-800">WARNING:</strong> <span class="text-yellow-700">$1</span></div></div></div>');
    html = html.replace(/^> ✅ \*\*SUCCESS:\*\* (.*$)/gim, '<div class="border-l-4 border-green-500 bg-green-50 p-4 my-4 rounded-r-lg"><div class="flex items-start gap-2"><span class="text-green-600 text-lg">✅</span><div><strong class="text-green-800">SUCCESS:</strong> <span class="text-green-700">$1</span></div></div></div>');
    html = html.replace(/^> ❌ \*\*ERROR:\*\* (.*$)/gim, '<div class="border-l-4 border-red-500 bg-red-50 p-4 my-4 rounded-r-lg"><div class="flex items-start gap-2"><span class="text-red-600 text-lg">❌</span><div><strong class="text-red-800">ERROR:</strong> <span class="text-red-700">$1</span></div></div></div>');

    // Regular blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-black pl-4 py-2 my-4 bg-black bg-opacity-5 italic text-black">$1</blockquote>');

    // Video containers (preserve HTML)
    html = html.replace(/<div class="video-container my-6">([\s\S]*?)<\/div>/g, '<div class="video-container my-6 bg-black bg-opacity-5 rounded-lg overflow-hidden">$1</div>');

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

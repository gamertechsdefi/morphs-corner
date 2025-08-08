'use client';

import { useEffect, useRef } from 'react';

declare global {
  // Uses global TwitterWidgets type from src/types/twitter.d.ts
}

interface XPostProps {
  embedCode: string;
}

export default function XPost({ embedCode }: XPostProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Twitter widgets script
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    document.head.appendChild(script);

    // Clean up
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Parse the embed code into a DOM node
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = embedCode;
    
    // Clear previous content
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      // Append the tweet blockquote
      containerRef.current.appendChild(tempDiv.firstChild as Node);
      
      // Tell Twitter to process the embed
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load(containerRef.current);
      }
    }
  }, [embedCode]);

  return (
    <div 
      ref={containerRef}
      className="flex justify-center my-8"
    />
  );
}

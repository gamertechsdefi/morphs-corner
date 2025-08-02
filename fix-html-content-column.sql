-- Fix for missing html_content column
-- Run this in your Supabase SQL Editor

-- Add the html_content column to existing articles table
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS html_content TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.articles.html_content IS 'Rich HTML content for articles with formatting, images, and styling';

-- Update existing articles to have basic HTML content from their text content
-- This converts plain text to basic HTML paragraphs for existing articles
UPDATE public.articles 
SET html_content = CASE 
  WHEN content IS NOT NULL AND content != '' THEN 
    '<p>' || REPLACE(REPLACE(TRIM(content), E'\n\n', '</p><p>'), E'\n', '<br>') || '</p>'
  ELSE 
    '<p></p>'
END
WHERE html_content IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND table_schema = 'public' 
AND column_name = 'html_content';

-- Migration to add html_content column to existing articles table
-- Run this if you already have the articles table without html_content

-- Add the html_content column
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS html_content TEXT;

-- Update existing articles to have basic HTML content from their text content
-- This converts plain text to basic HTML paragraphs
UPDATE public.articles 
SET html_content = '<p>' || REPLACE(REPLACE(content, E'\n\n', '</p><p>'), E'\n', '<br>') || '</p>'
WHERE html_content IS NULL AND content IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.articles.html_content IS 'Rich HTML content for articles with formatting, images, and styling';

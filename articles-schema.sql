-- Create articles table
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    html_content TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    featured_image_url TEXT,
    additional_images TEXT[] DEFAULT '{}',
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    author_email TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0
);

-- Create article_likes table for tracking user likes
CREATE TABLE IF NOT EXISTS public.article_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, user_id)
);

-- Create article_comments table for comments
CREATE TABLE IF NOT EXISTS public.article_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES public.article_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for articles
CREATE POLICY "Anyone can view published articles" ON public.articles
    FOR SELECT USING (status = 'published');

CREATE POLICY "Users can view own articles" ON public.articles
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can create own articles" ON public.articles
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own articles" ON public.articles
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own articles" ON public.articles
    FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for article_likes
CREATE POLICY "Anyone can view article likes" ON public.article_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes" ON public.article_likes
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for article_comments
CREATE POLICY "Anyone can view comments on published articles" ON public.article_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.articles 
            WHERE articles.id = article_comments.article_id 
            AND articles.status = 'published'
        )
    );

CREATE POLICY "Users can create comments" ON public.article_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.article_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.article_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON public.articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_article_likes_article_id ON public.article_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON public.article_comments(article_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_article_comments_updated_at
    BEFORE UPDATE ON public.article_comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_article_views(article_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.articles 
    SET views_count = views_count + 1 
    WHERE id = article_uuid AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update likes count
CREATE OR REPLACE FUNCTION public.update_article_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.articles 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.article_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.articles 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.article_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for likes count
CREATE TRIGGER update_likes_count_on_insert
    AFTER INSERT ON public.article_likes
    FOR EACH ROW EXECUTE FUNCTION public.update_article_likes_count();

CREATE TRIGGER update_likes_count_on_delete
    AFTER DELETE ON public.article_likes
    FOR EACH ROW EXECUTE FUNCTION public.update_article_likes_count();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

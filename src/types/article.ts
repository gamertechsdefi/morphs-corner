export interface SupabaseArticle {
  id: string;
  title: string | null;
  description: string | null;
  content: string | null;
  author: string | null;
  date: string | null;
  imageUrl: string | null;
  category: string | null;
  tags: string[] | null;
  readTime: number | null;
  featured: boolean | null;
  trending: boolean | null;
  onboarding: boolean | null;
  difficulty: string | null;
  likes: number | null;
  comments: number | null;
  content_type: string | null;
  status: string | null;
  published_at: string | null;
  slug: string | null;
}

export type ArticleStatus = 'draft' | 'published' | 'archived';
export type ArticleContentType = 'latest' | 'featured' | 'trending' | 'onboarding';

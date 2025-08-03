import videosData from './videos.json';

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
}

// Helper function to create URL-friendly slugs from titles
export const createVideoSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Helper function to get video by slug
export const getVideoBySlug = (slug: string): Video | undefined => {
  return videosData.find(video => createVideoSlug(video.title) === slug);
};

// Helper function to get video by ID (backward compatibility)
export const getVideoById = (id: string): Video | undefined => {
  return videosData.find(video => video.id === id);
};

// Helper function to get video by title
export const getVideoByTitle = (title: string): Video | undefined => {
  return videosData.find(video => video.title === title);
};

// Helper function to get all videos
export const getAllVideos = (): Video[] => {
  return videosData;
};

// Helper function to get videos by category
export const getVideosByCategory = (category: string): Video[] => {
  return videosData.filter(video => video.category === category);
};

// Helper function to get related videos (same category, excluding current video)
export const getRelatedVideos = (currentVideoSlug: string, limit: number = 3): Video[] => {
  const currentVideo = getVideoBySlug(currentVideoSlug);
  if (!currentVideo) return [];
  
  return videosData
    .filter(video => 
      video.id !== currentVideo.id && 
      video.category === currentVideo.category
    )
    .slice(0, limit);
};

// Helper function to get unique categories
export const getVideoCategories = (): string[] => {
  return Array.from(new Set(videosData.map(video => video.category)));
};

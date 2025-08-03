'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FiPlay, FiArrowLeft, FiShare2 } from 'react-icons/fi';
import Link from 'next/link';
import {
  Video,
  getVideoBySlug,
  getVideoById,
  getVideoByTitle,
  getRelatedVideos,
  createVideoSlug
} from '@/data/videoHelpers';

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      const videoSlugOrId = params.id as string;
      let foundVideo: Video | undefined;

      // Try to find by slug first (most common case now)
      foundVideo = getVideoBySlug(videoSlugOrId);

      // If not found by slug, try by ID (backward compatibility)
      if (!foundVideo) {
        foundVideo = getVideoById(videoSlugOrId);
      }

      // If still not found, try by title (backward compatibility)
      if (!foundVideo) {
        foundVideo = getVideoByTitle(decodeURIComponent(videoSlugOrId));
      }

      if (foundVideo) {
        setVideo(foundVideo);

        // Get related videos using the slug
        const videoSlug = createVideoSlug(foundVideo.title);
        const related = getRelatedVideos(videoSlug, 3);
        setRelatedVideos(related);
      } else {
        setError('Video not found');
      }

      setLoading(false);
    }
  }, [params.id]);



  const handleShare = async () => {
    if (navigator.share && video) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading video...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Video not found'}</p>
            <button 
              onClick={() => router.push('/videos')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Videos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="px-4 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/videos"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Videos
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Video Content */}
            <div className="lg:col-span-2">
              {/* Video Player */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="relative aspect-video bg-black">
                  <video
                    controls
                    className="w-full h-full"
                    preload="metadata"
                  >
                    <source src={video.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              {/* Video Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-3">
                    {video.category}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {video.title}
                  </h1>
                  
                  {/* Video Actions */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <FiShare2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {video.description}
                  </p>
                </div>


              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Related Videos */}
              {relatedVideos.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Videos</h3>
                  <div className="space-y-4">
                    {relatedVideos.map((relatedVideo) => (
                      <Link
                        key={relatedVideo.id}
                        href={`/videos/${createVideoSlug(relatedVideo.title)}`}
                        className="group flex gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
                        <div className="relative w-24 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <FiPlay className="w-6 h-6 text-white opacity-80" />

                          {/* Video preview */}
                          <video
                            className="absolute inset-0 w-full h-full object-cover"
                            muted
                            preload="metadata"
                            onLoadedData={(e) => {
                              const video = e.target as HTMLVideoElement;
                              video.currentTime = 0.1;
                            }}
                          >
                            <source src={relatedVideo.url} type="video/mp4" />
                          </video>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                            {relatedVideo.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {relatedVideo.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <Link
                      href="/videos"
                      className="block text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      View All Videos
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

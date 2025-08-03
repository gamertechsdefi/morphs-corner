'use client';

import { useState, useEffect } from 'react';
import { FiPlay, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import { Video, getAllVideos, createVideoSlug } from '@/data/videoHelpers';

export default function FeaturedVideos() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    // Get the first 6 videos for the home page
    const allVideos = getAllVideos();
    setVideos(allVideos.slice(0, 6));
  }, []);



  if (videos.length === 0) {
    return (
      <section className="bg-gray-100 py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Videos</h2>
          <div className="w-16 h-1 bg-green-500 mx-auto mb-8"></div>
          <p className="text-gray-600 mb-8">No videos available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-100 py-16 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Videos</h2>
          <div className="w-16 h-1 bg-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Watch our latest video content covering cryptocurrency, DeFi, NFTs, and Web3 education
          </p>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {videos.map((video) => (
            <Link
              key={video.id}
              href={`/videos/${createVideoSlug(video.title)}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-green-400 to-blue-500 overflow-hidden flex items-center justify-center">
                <FiPlay className="w-16 h-16 text-white opacity-80" />

                {/* Video preview (hidden, loads first frame) */}
                <video
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  muted
                  preload="metadata"
                  onLoadedData={(e) => {
                    const video = e.target as HTMLVideoElement;
                    video.currentTime = 0.1;
                  }}
                >
                  <source src={video.url} type="video/mp4" />
                </video>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FiPlay className="w-6 h-6 text-gray-800 ml-1" />
                  </div>
                </div>



                {/* Category Badge */}
                <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  {video.category}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                  {video.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                  {video.description}
                </p>


              </div>
            </Link>
          ))}
        </div>

        {/* View All Videos Button */}
        <div className="text-center">
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            View All Videos
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

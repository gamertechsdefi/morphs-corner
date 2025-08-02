'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect logged-in users to home page
  useEffect(() => {
    if (!loading && user) {
      router.push('/home');
    }
  }, [user, loading, router]);

  // Show loading state while checking auth or redirecting
  if (loading || user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          {/* <p className="text-gray-600 text-lg">
            {user ? 'Redirecting to home...' : 'Loading...'}
          </p> */}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Landing Page Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Full Screen Background Image */}
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url(/images/mc_art.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <Image
            src="/images/mc_art.jpg"
            alt="morph corner bg"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
            quality={100}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 z-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-green-500 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 bg-purple-500 rounded-full opacity-15 animate-bounce"></div>
          <div className="absolute top-1/2 left-10 w-16 h-16 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-20 text-center px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="block animate-fade-in-up text-green-400">Morph&apos;s Corner</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
            First onchain media hub on the{' '}
            <span className="text-green-400 font-semibold">Morph blockchain</span>
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600">
            <Link
              href="/home"
              className="group relative px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <button className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-black font-semibold rounded-full transition-all duration-300 transform hover:scale-105">
              Learn More
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-12 animate-fade-in-up animation-delay-800">
            <p className="text-sm text-gray-300 mb-4">Discover the future of blockchain media</p>
            <div className="flex justify-center items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">100+</div>
                <div className="text-xs text-gray-400">Articles</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">50K+</div>
                <div className="text-xs text-gray-400">Readers</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">24/7</div>
                <div className="text-xs text-gray-400">Updates</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="flex flex-col items-center text-white">
            <span className="text-sm mb-2">Scroll Down</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
}
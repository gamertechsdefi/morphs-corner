'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from "@/components/Header";
import CryptoPriceTicker from "@/components/CryptoPriceTicker";
import Footer from "@/components/Footer";
import FeaturedVideos from "@/components/FeaturedVideos";
import Link from 'next/link';
import { getTrendingArticles, getOnboardingArticles, createSlug } from '@/data/articles';

type SupabaseArticle = {
  id: string;
  title?: string;
  description?: string;
  author?: string;
  date?: string;
  featured_image_url?: string;
  category?: string;
  tags?: string[];
  readTime?: number;
  featured?: boolean;
  trending?: boolean;
  onboarding?: boolean;
  difficulty?: string;
  likes?: number;
  comments?: number;
  content_type?: string;
  status?: string;
};
import { createClient } from '@supabase/supabase-js';

interface FeaturedArticle {
  id: number;
  title: string;
  description: string;
  author: string;
  date: string;
  imageUrl: string;
  category: string;
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [trendingFilter, setTrendingFilter] = useState('All');
  const [onboardingFilter, setOnboardingFilter] = useState('All');

  // Get articles from data
  const trendingArticles = getTrendingArticles();
  const onboardingArticles = getOnboardingArticles();

  // Sample tweets data
  const tweetsData = [
    {
      id: 1,
      username: "Morph's Corner",
      handle: "@Morph's Corner",
      verified: true,
      content: "To every Nigerian putting in their all in this space, your hard work will pay off. 🚀",
      action: "Go to tweet"
    },
    {
      id: 2,
      username: "Morph's Corner",
      handle: "@morphsorner",
      verified: true,
      content: "🚨 Breaking: Web3 Nigeria has been ranked the best community in the world 🌍",
      action: "Go to tweet"
    },
    {
      id: 3,
      username: "Morph's Corner",
      handle: "@morphsorner",
      verified: true,
      content: "It's a great day to make new connections so We're looking for 🔥 - KOL managers - Reply guys/raiders - Content creators/KOLs - Collab guys - CM/Moderators - Graphics Designers If you see this, reply Hi let's connect ❤️",
      action: "Go to tweet"
    },
    {
      id: 4,
      username: "Morph's Corner",
      handle: "@morphscorner",
      verified: true,
      content: "Web3 in Nigeria 🇳🇬",
      action: "Go to tweet"
    },
    {
      id: 5,
      username: "Morph's Corner",
      handle: "@morphscorner",
      verified: false,
      content: "The future of blockchain technology in Africa starts with Nigeria. We're building the infrastructure for tomorrow! 💪",
      action: "Go to tweet"
    },
    {
      id: 6,
      username: "Morph's Corner",
      handle: "@morphscorner",
      verified: true,
      content: "Just attended the most amazing Web3 meetup in Lagos! The energy and innovation in this space is incredible 🔥",
      action: "Go to tweet"
    },
    {
      id: 7,
      username: "Morph's Corner",
      handle: "@morph's corner",
      verified: false,
      content: "Nigerian developers are leading the charge in DeFi innovation. Proud to be part of this movement! 🌟",
      action: "Go to tweet"
    },
    {
      id: 8,
      username: "Morph's Corner",
      handle: "@morphscorner",
      verified: true,
      content: "Dropped my latest NFT collection inspired by Nigerian culture. The intersection of art and blockchain is beautiful! 🎨",
      action: "Go to tweet"
    },
    {
      id: 9,
      username: "Morph's Corner",
      handle: "@morphscorner",
      verified: false,
      content: "Virtual real estate in the metaverse is the next big thing. Nigerian investors, don't sleep on this opportunity! 🏠",
      action: "Go to tweet"
    },
    {
      id: 10,
      username: "Morph's Corner",
      handle: "@morphscorner",
      verified: true,
      content: "Teaching smart contract development to the next generation of Nigerian blockchain developers. The future is bright! 📚",
      action: "Go to tweet"
    }
  ];

  // Supabase client
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [featuredArticles, setFeaturedArticles] = useState<SupabaseArticle[]>([]);
  const [latestArticles, setLatestArticles] = useState<SupabaseArticle[]>([]);

  useEffect(() => {
    async function fetchArticles() {
      // Featured
      const { data: featured, error: featuredError } = await supabase
        .from('articles')
        .select('*')
        .eq('content_type', 'featured')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(5);
      if (!featuredError) setFeaturedArticles(featured || []);

      // Latest
      const { data: latest, error: latestError } = await supabase
        .from('articles')
        .select('*')
        .eq('content_type', 'latest')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(10);
      if (!latestError) setLatestArticles(latest || []);
    }
    fetchArticles();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredArticles.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
  };

  const currentArticle: SupabaseArticle | null = featuredArticles && featuredArticles.length > 0 ? featuredArticles[currentSlide] : null;

  return (
    <div>
      <Header />
      <CryptoPriceTicker />
      <main>

        {/* Hero Section */}
        <section className="bg-gray-100 py-8 px-4 sm:px-6 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Section - Featured Article */}
              <div className="lg:col-span-2">
                <div className="relative rounded-lg overflow-hidden h-96 md:h-[500px]">
                  {/* Background Image or Placeholder */}
                  {currentArticle?.featured_image_url ? (
                    <Image
                      src={currentArticle.featured_image_url}
                      alt={currentArticle.title || 'Featured Article'}
                      fill
                      className="object-cover absolute inset-0 z-0"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0">
                      <div className="w-full h-full bg-gradient-to-r from-purple-900 via-green-900 to-green-900 opacity-80"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-yellow-400 rounded-full opacity-20"></div>
                        <div className="absolute w-24 h-24 bg-purple-500 rounded-full top-20 right-20 opacity-30"></div>
                        <div className="absolute w-16 h-16 bg-green-400 rounded-full bottom-20 left-20 opacity-25"></div>
                      </div>
                    </div>
                  )}

                  {/* Content Overlay */}
                  <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/60 to-transparent">
                    {/* Category Badge */}
                    <div className="flex items-start">
                      <span className="bg-white text-black px-3 py-1 rounded text-sm font-medium">
                        {currentArticle?.category || currentArticle?.content_type || 'No Category'}
                      </span>
                    </div>

                    {/* Article Content */}
                    <div className="text-white">
                      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                        {currentArticle?.title || 'No Article Available'}
                      </h1>

                      <p className="text-gray-300 mb-6 text-sm md:text-base max-w-2xl">
                        {currentArticle?.description || ''}
                      </p>

                      {/* Author and Date */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-400 rounded-full overflow-hidden">
                            {currentArticle?.featured_image_url ? (
                              <Image src={currentArticle.featured_image_url} alt={currentArticle.author || ''} width={32} height={32} className="rounded-full object-cover" />
                            ) : null}
                          </div>
                          <span className="text-sm">{currentArticle?.author || ''}</span>
                        </div>
                        <span className="text-gray-400 text-sm">{currentArticle?.date || ''}</span>
                      </div>

                      {/* Read Article Button */}
                      <Link href={currentArticle?.title ? `/articles/${createSlug(currentArticle.title)}` : '#'}>
                        <button className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors">
                          Read Article
                        </button>
                      </Link>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={prevSlide}
                        className="text-white hover:text-gray-300 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {/* Slide Indicators */}
                      <div className="flex gap-2">
                        {featuredArticles.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-gray-500'
                              }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={nextSlide}
                        className="text-white hover:text-gray-300 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Latest News */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6 h-96 md:h-[500px] overflow-hidden flex flex-col">
                  <h2 className="text-xl font-bold mb-6 text-gray-800">LATEST</h2>
                  <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-gray-100">
                    {latestArticles.length === 0 ? (
                      <div className="text-gray-400 text-center py-12">No latest articles found.</div>
                    ) : (
                      latestArticles.map(article => (
                        <div key={article.id} className="py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex-shrink-0 w-12 h-12 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                            {article.featured_image_url ? (
                              <Image src={article.featured_image_url} width={200} height={200} alt="Image holder" className="w-full h-full object-cover rounded" />
                            ) : (
                              <div className="w-full h-full bg-gray-200" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/articles/latest/${createSlug(article.title ?? '')}`} className="block font-semibold text-gray-900 leading-tight hover:text-green-600 truncate">
                              {article.title}
                            </Link>
                            <div className="text-xs text-gray-500 mt-1 truncate">{article.description}</div>
                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                              <span>{article.author}</span>
                              <span>•</span>
                              <span>{article.date}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

                {/* Onboarding Section */}
        <section className="bg-gray-50 min-h-screen py-12 px-4 lg:px-8 flex flex-col">
          <div className="w-full flex-1 flex flex-col">
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-8">ONBOARDING</h2>

              {/* Filter Tabs */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                <button
                  onClick={() => setOnboardingFilter('All')}
                  className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    onboardingFilter === 'All'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setOnboardingFilter('Beginner')}
                  className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    onboardingFilter === 'Beginner'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Beginner
                </button>
                <button
                  onClick={() => setOnboardingFilter('Wallets')}
                  className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    onboardingFilter === 'Wallets'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Wallets
                </button>
                <button
                  onClick={() => setOnboardingFilter('DeFi')}
                  className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    onboardingFilter === 'DeFi'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  DeFi
                </button>
                <button
                  onClick={() => setOnboardingFilter('Security')}
                  className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    onboardingFilter === 'Security'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Security
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Cards Container */}
            <div className="flex-1 flex items-center">
              <div className="w-full overflow-x-auto scrollbar-hide">
                <div className="flex gap-8 pb-6 min-w-max">
                  {onboardingArticles.map((article) => (
                    <div key={article.id} className="flex-shrink-0 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <div className="relative h-80 bg-gradient-to-br from-blue-600 to-purple-800">
                        <div className="absolute inset-0 bg-black bg-opacity-40">
                          <Image src={article.imageUrl} alt='image' width={500} height={200} className='w-full h-full' />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-white text-center p-6">
                            <h3 className="text-xl font-bold">{article.difficulty}</h3>
                            <p className="text-sm opacity-80">{article.readTime} min read</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-4">
                          <div className="text-xs font-medium mb-2 text-gray-600">
                            {article.category} • {article.tags.slice(0, 2).join(' • ')} • ONBOARDING
                          </div>
                          <h3 className="text-lg font-bold leading-tight text-gray-900 mb-2">
                            <Link href={`/articles/${createSlug(article.title)}`} className="hover:text-blue-600 transition-colors">
                              {article.title}
                            </Link>
                          </h3>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{article.date}</span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.001 8.001 0 01-7.716-6M3 12c0-4.418 3.582-8 8-8a8.001 8.001 0 017.716 6" />
                              </svg>
                              {article.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {article.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Section */}
        <section className="bg-white min-h-screen py-12 px-4 lg:px-8 flex flex-col">
          <div className="w-full flex-1 flex flex-col">
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-8">TRENDING</h2>

              {/* Filter Tabs */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                <button
                  onClick={() => setTrendingFilter('All')}
                  className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    trendingFilter === 'All'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTrendingFilter('News')}
                  className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    trendingFilter === 'News'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  News
                </button>
                <button
                  onClick={() => setTrendingFilter('Analysis')}
                  className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    trendingFilter === 'Analysis'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Analysis
                </button>
                <button
                  onClick={() => setTrendingFilter('Guides')}
                  className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    trendingFilter === 'Guides'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Guides
                </button>
                <button
                  onClick={() => setTrendingFilter('Beginner')}
                  className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    trendingFilter === 'Beginner'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Beginner
                </button>
                <button
                  onClick={() => setTrendingFilter('Advanced')}
                  className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    trendingFilter === 'Advanced'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Cards Container */}
            <div className="flex-1 flex items-center">
              <div className="w-full overflow-x-auto scrollbar-hide">
                <div className="flex gap-8 pb-6 min-w-max">
                  {trendingArticles.map((article) => (
                    <div key={article.id} className="flex-shrink-0 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <div className="relative h-80 bg-gradient-to-br from-gray-900 to-green-900">
                        <div className="absolute inset-0 ">
                          <Image src={article.imageUrl} alt='image' width={700} height={200} className='w-full h-full' />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-4">
                          {/* <div className="text-xs font-medium mb-2 text-gray-600">
                            {article.category} • {article.tags.slice(0, 2).join(' • ')} • TRENDING
                          </div> */}
                          <h3 className="text-lg font-bold leading-tight text-gray-900 mb-2">
                            <Link href={`/articles/${createSlug(article.title)}`} className="hover:text-green-600 transition-colors">
                              {article.title}
                            </Link>
                          </h3>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{article.date}</span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.001 8.001 0 01-7.716-6M3 12c0-4.418 3.582-8 8-8a8.001 8.001 0 017.716 6" />
                              </svg>
                              {article.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {article.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Tweets Section */}
        <section className="bg-gray-50 py-12 px-4 lg:px-8">
          <div className="w-full">
            {/* Section Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold text-gray-900">TWEETS</h2>
                <Link href="https://twitter.com/morphscorner" className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  Follow Morph&apos;s Corner
                </Link>
              </div>
            </div>

            {/* Tweets Horizontal Scroll */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-6 pb-6 min-w-max">
                {tweetsData.map((tweet) => (
                  <div key={tweet.id} className="flex-shrink-0 w-80 bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                    {/* Tweet Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          <Image src="/images/mc-logo.png" alt="morph's corner logo" width={25} height={25} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-gray-900">{tweet.username}</span>
                            {tweet.verified && (
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{tweet.handle}</span>
                        </div>
                      </div>

                      {/* X (Twitter) Icon */}
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>

                    {/* Tweet Content */}
                    <div className="mb-4">
                      <p className="text-gray-800 text-sm leading-relaxed">{tweet.content}</p>
                    </div>

                    {/* Tweet Action */}
                    <div className="pt-3 border-t border-gray-100">
                      <button className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors">
                        {tweet.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Videos Section */}
        <FeaturedVideos />

      </main>

      <Footer />
    </div>
  );
}
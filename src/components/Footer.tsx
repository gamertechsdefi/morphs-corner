'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiX, FiSend } from 'react-icons/fi';
import { FaDiscord, FaTelegram } from 'react-icons/fa';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer className="bg-green-900 text-white relative overflow-hidden">
      {/* Large Background Text */}
      {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-green-700 font-bold text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] xl:text-[15rem] opacity-10 select-none whitespace-nowrap">
          Morph's Corner
        </div>
      </div> */}

      {/* Footer Content */}
      <div className="relative z-10 px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-700 rounded-lg flex items-center justify-center">
                    <Image src="/images/mc-logo.png" alt="morph's corner logo" width={40} height={40}  />
                  </div>
                  <div className='flex flex-col md:flex-row md:gap-2'>
                    <div className="font-bold text-lg">Morph&apos;s</div>
                    <div className="font-bold text-lg">Corner</div>
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed">
                  Get real time latest news and information about the Morph L2 and access to it&apos;s 
                  ecosystem in one platform
                </p>
              </div>
            </div>

            {/* Navigation Links - Column 1 */}
            <div className="space-y-4">
              <div className="space-y-3">
                <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Articles
                </a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Videos
                </a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Events
                </a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Community
                </a>
                {/* <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  W3NCON
                </a> */}
              </div>
            </div>

            {/* Navigation Links - Column 2 */}
            <div className="space-y-4">
              <div className="space-y-3">
                {/* <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Terms Of Use
                </a> */}
                <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Telegram
                </a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  X (Twitter)
                </a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Discord
                </a>
                {/* <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Spotify
                </a> */}
                <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Contact Us
                </a>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    The industry moves rapidly.
                  </h3>
                  <h3 className="text-white font-semibold text-lg mb-4">
                    Let&apos;s help you stay up to date
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Plus, you didn&apos;t scroll all the way here for nothing
                  </p>
                </div>

                {/* Newsletter Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-3 bg-neutral-100 border border-neutral-300 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                      required
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors text-sm whitespace-nowrap"
                    >
                      Alright!
                    </button>
                  </div>
                </form>

                {/* Social Icons */}
                <div className="flex gap-4 pt-4">
                  {/* X (Twitter) */}
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <FiX className="w-5 h-5" />
                  </a>
                  {/* Telegram */}
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <FaTelegram className="w-5 h-5" />
                  </a>
                  {/* Discord */}
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <FaDiscord className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

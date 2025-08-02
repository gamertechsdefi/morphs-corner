'use client';

import { useState } from 'react';
import Image from 'next/image';

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
                    <div className="font-bold text-lg">Morph's</div>
                    <div className="font-bold text-lg">Corner</div>
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed">
                  Get real time latest news and information about the Morph L2 and access to it's 
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
                    Let's help you stay up to date
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Plus, you don't scroll all the way here for nothing :)
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
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                      required
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm whitespace-nowrap"
                    >
                      Alright!
                    </button>
                  </div>
                </form>

                {/* Social Icons */}
                <div className="flex gap-4 pt-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/>
                    </svg>
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

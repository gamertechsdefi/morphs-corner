'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX, FiUser, FiHome } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import AuthModal from './AuthModal';
import { useAuth } from '@/contexts/AuthContext';

// Search Component
function SearchComponent({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 z-50 flex items-start justify-center pt-20">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 sm:mx-6">
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Search</h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Close search"
                        >
                            <FiX className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="What are you looking for?"
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>

                    {searchQuery && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 mb-3">Search results for "{searchQuery}":</p>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {/* Sample search results */}
                                <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100">
                                    <h3 className="font-medium text-gray-800">Sample Result 1</h3>
                                    <p className="text-sm text-gray-600">This is a sample search result description...</p>
                                </div>
                                <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100">
                                    <h3 className="font-medium text-gray-800">Sample Result 2</h3>
                                    <p className="text-sm text-gray-600">Another sample search result description...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!searchQuery && (
                        <div className="text-center py-8">
                            <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Start typing to search...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}



export default function Header() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { user, loading } = useAuth();
    const pathname = usePathname();

    // Check if we're on the dashboard page
    const isDashboardPage = pathname === '/dashboard';

    const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeSearch = () => setIsSearchOpen(false);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    return (
        <>
            <header className="relative flex justify-between px-4 sm:px-6 md:px-8 lg:px-16 items-center bg-green-600 py-3 md:py-4">
                {/* Brand section */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-12 h-12 sm:w-18 sm:h-18  rounded-full flex items-center justify-center">
                        <Image src="/images/mc-logo.png" alt="morph's corner logo" width={70} height={70} />
                    </div>
                    <h1 className="text-white flex text-sm sm:text-base md:text-lg lg:text-xl font-semibold">
                        <span className="hidden xs:inline text-xl">Morph&apos;s <br/> Corner</span>
                        <span className="xs:hidden text-2xl">Morph&apos;s <br/> Corner</span>
                    </h1>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 sm:gap-4 relative">
                    {/* Home button - only show on dashboard page */}
                    {isDashboardPage && (
                        <a
                            href="/home"
                            className="flex items-center gap-2 px-3 py-2 hover:bg-green-700 rounded-full transition-colors text-white"
                            aria-label="Home"
                        >
                            <FiHome className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline text-sm font-medium">Home</span>
                        </a>
                    )}

                    {/* Search button */}
                    <button
                        onClick={toggleSearch}
                        className="p-2 hover:bg-green-700 rounded-full transition-colors text-white"
                        aria-label="Search"
                    >
                        <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </button>

                    {/* Dashboard/Login button */}
                    <div className="flex items-center gap-3">
                        {loading ? (
                            <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white bg-opacity-20 rounded-full animate-pulse">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white bg-opacity-50 rounded-full"></div>
                                <div className="hidden sm:block w-16 h-4 bg-white bg-opacity-50 rounded"></div>
                            </div>
                        ) : user ? (
                            <a
                                href="/dashboard"
                                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white bg-opacity-20 text-green-700 rounded-full hover:bg-opacity-30 transition-colors font-medium text-sm sm:text-base"
                            >
                                <FiUser className="w-4 h-4 sm:w-5 sm:h-5 md:hidden" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </a>
                        ) : (
                            <button
                                onClick={openAuthModal}
                                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white text-green-600 rounded-full hover:bg-gray-100 transition-colors font-medium text-sm sm:text-base"
                            >
                                <FiUser className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Login</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Search Component */}
            <SearchComponent isOpen={isSearchOpen} onClose={closeSearch} />

            {/* Auth Modal */}
            <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
        </>
    );
}
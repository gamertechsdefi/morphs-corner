'use client';

import { useState, useEffect } from 'react';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
}

// Interface for CoinGecko API response
interface CoinGeckoApiResponse {
  id: string;
  symbol: string;
  name: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
  market_cap_rank: number | null;
}

export default function CryptoPriceTicker() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCryptoData = async () => {
    try {
      setLoading(true);

      // Fetch top cryptocurrencies by market cap from CoinGecko
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch crypto data');
      }

      const data: CoinGeckoApiResponse[] = await response.json();

      // Transform the data to match our interface
      const transformedData: CryptoData[] = data.map((coin) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price || 0,
        price_change_percentage_24h: coin.price_change_percentage_24h || 0,
        market_cap_rank: coin.market_cap_rank || 0
      }));

      setCryptoData(transformedData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load crypto prices';
      setError(errorMessage);
      console.error('Error fetching crypto data:', err);
    } finally {
      setLoading(false);
    }
  };



  const formatPrice = (price: number): string => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else if (price < 100) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const formatPercentage = (percentage: number): string => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  useEffect(() => {
    fetchCryptoData();
    
    // Update prices every 30 seconds
    const interval = setInterval(fetchCryptoData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-50 border-b border-gray-200 py-2">
        <div className="flex items-center justify-center">
          <div className="text-sm text-gray-500">Loading crypto prices...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-b border-red-200 py-2">
        <div className="flex items-center justify-center">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200 py-2 overflow-hidden">
      <div className="flex animate-scroll">
        <div className="flex items-center gap-6 whitespace-nowrap px-4">
          {cryptoData.map((crypto) => (
            <div key={crypto.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-800">
                {crypto.symbol}
              </span>
              <span className="text-gray-600">
                {formatPrice(crypto.current_price)}
              </span>
              <span
                className={`font-medium ${
                  crypto.price_change_percentage_24h >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formatPercentage(crypto.price_change_percentage_24h)}
              </span>
            </div>
          ))}
          {/* Duplicate for seamless scrolling */}
          {cryptoData.map((crypto) => (
            <div key={`${crypto.id}-duplicate`} className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-800">
                {crypto.symbol}
              </span>
              <span className="text-gray-600">
                {formatPrice(crypto.current_price)}
              </span>
              <span
                className={`font-medium ${
                  crypto.price_change_percentage_24h >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formatPercentage(crypto.price_change_percentage_24h)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

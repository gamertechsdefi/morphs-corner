/**
 * Get the base URL for the application
 * This handles both development and production environments
 */
export function getBaseUrl(): string {
  // In production, use VERCEL_URL or NEXT_PUBLIC_SITE_URL
  if (process.env.NODE_ENV === 'production') {
    // Vercel automatically sets VERCEL_URL
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // Custom domain set in environment variables
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL;
    }
    
    // Fallback for production
    return 'https://your-domain.com'; // Replace with your actual domain
  }
  
  // Development
  return 'http://localhost:3000';
}

/**
 * Get the auth callback URL
 */
export function getAuthCallbackUrl(): string {
  return `${getBaseUrl()}/auth/callback`;
}

/**
 * Get the site URL for Supabase configuration
 */
export function getSiteUrl(): string {
  return getBaseUrl();
}

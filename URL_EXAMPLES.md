# Article URL Examples

## New Title-Based URLs

Your articles now use SEO-friendly, title-based URLs instead of numeric IDs. Here are examples:

### Before (ID-based):
```
/articles/1
/articles/2
/articles/3
```

### After (Title-based):
```
/articles/how-to-make-money-online-with-crypto-airdrops
/articles/start-here-the-only-spot-trading-tips-you-need-in-2025
/articles/the-cbex-scam-in-nigeria-what-happened-why-it-matters-and-how-to-protect-yourself
/articles/understanding-blockchain-technology-a-beginners-complete-guide
/articles/defi-explained-your-gateway-to-decentralized-finance
/articles/cryptocurrency-wallets-complete-security-guide-for-2025
```

## URL Generation Rules

The `createSlug()` function converts titles to URLs using these rules:

1. **Convert to lowercase**: "How To Make Money" → "how to make money"
2. **Remove special characters**: Keep only letters, numbers, spaces, and hyphens
3. **Replace spaces with hyphens**: "how to make money" → "how-to-make-money"
4. **Remove multiple hyphens**: "how--to--make" → "how-to-make"
5. **Remove leading/trailing hyphens**: "-how-to-make-" → "how-to-make"

## Examples of Title → URL Conversion

| Article Title | Generated URL Slug |
|---------------|-------------------|
| "How To Make Money Online With Crypto Airdrops" | `how-to-make-money-online-with-crypto-airdrops` |
| "Start Here: The Only Spot Trading Tips You Need In 2025" | `start-here-the-only-spot-trading-tips-you-need-in-2025` |
| "The CBEX Scam in Nigeria: What Happened, Why It Matters, and How..." | `the-cbex-scam-in-nigeria-what-happened-why-it-matters-and-how` |
| "Understanding Blockchain Technology: A Beginner's Complete Guide" | `understanding-blockchain-technology-a-beginners-complete-guide` |
| "DeFi Explained: Your Gateway to Decentralized Finance" | `defi-explained-your-gateway-to-decentralized-finance` |
| "Cryptocurrency Wallets: Complete Security Guide for 2025" | `cryptocurrency-wallets-complete-security-guide-for-2025` |

## Backward Compatibility

The system maintains backward compatibility:

1. **Slug lookup first**: `/articles/how-to-make-money-online-with-crypto-airdrops`
2. **ID lookup second**: `/articles/1` (still works)
3. **Title lookup third**: `/articles/How%20To%20Make%20Money%20Online%20With%20Crypto%20Airdrops`
4. **API fallback**: If not found locally, tries API

## Benefits of Title-Based URLs

### 1. **SEO Friendly**
- Search engines prefer descriptive URLs
- Keywords in URL improve search rankings
- Better click-through rates in search results

### 2. **User Friendly**
- Users can understand content from URL
- Easier to share and remember
- Professional appearance

### 3. **Social Media Friendly**
- Better preview text when shared
- More descriptive link previews
- Increased engagement

### 4. **Analytics Benefits**
- Easier to track specific content
- Better reporting and insights
- Clear content performance metrics

## Implementation Details

### Files Updated:
- ✅ `src/data/articles.ts` - Added slug generation functions
- ✅ `src/app/home/page.tsx` - Updated trending and onboarding links
- ✅ `src/app/articles/[id]/page.tsx` - Updated to handle slug-based lookup
- ✅ `src/app/articles/page.tsx` - Updated article listing links
- ✅ `src/components/FeaturedArticles.tsx` - Updated featured article links
- ✅ `src/app/articles/my-articles/page.tsx` - Updated user article links

### Functions Added:
- `createSlug(title: string)` - Converts title to URL-friendly slug
- `getArticleBySlug(slug: string)` - Finds article by slug

### Lookup Priority:
1. **Slug-based lookup** (primary method)
2. **ID-based lookup** (backward compatibility)
3. **Title-based lookup** (backward compatibility)
4. **API fallback** (for database articles)

## Testing the New URLs

You can now access articles using these beautiful URLs:

```
https://yoursite.com/articles/how-to-make-money-online-with-crypto-airdrops
https://yoursite.com/articles/start-here-the-only-spot-trading-tips-you-need-in-2025
https://yoursite.com/articles/understanding-blockchain-technology-a-beginners-complete-guide
```

All existing ID-based URLs will continue to work for backward compatibility! 🎉

# Content System Guide

## Overview
This guide explains the new content system that includes an onboarding section, trending section, and a centralized articles data structure that can be referenced throughout the application.

## 🏗️ **What's Been Created**

### 1. **Centralized Articles Data (`src/data/articles.ts`)**
- ✅ **Complete article content** with markdown support
- ✅ **Rich metadata** (tags, difficulty, read time, etc.)
- ✅ **Helper functions** for filtering and finding articles
- ✅ **Referenceable by ID or title**

### 2. **Onboarding Section (Home Page)**
- ✅ **Cloned from trending section** with different styling
- ✅ **Blue/purple gradient** design theme
- ✅ **Beginner-focused content** filtering
- ✅ **Educational article focus**

### 3. **Enhanced Trending Section**
- ✅ **Dynamic content** from articles data
- ✅ **Interactive filter tabs**
- ✅ **Real article data** instead of hardcoded content

### 4. **Markdown Renderer Component**
- ✅ **Converts markdown to HTML** with proper styling
- ✅ **Supports headers, lists, code blocks, links**
- ✅ **Tailwind CSS styling** for consistent design

## 📊 **Articles Data Structure**

Each article in the data array includes:

```typescript
interface ArticleContent {
  id: number;                    // Unique identifier
  title: string;                 // Article title
  description: string;           // Short description
  content: string;               // Full markdown content
  author: string;                // Author name
  date: string;                  // Publication date
  imageUrl: string;              // Featured image URL
  category: string;              // Article category
  tags: string[];                // Array of tags
  readTime: number;              // Estimated read time in minutes
  featured: boolean;             // Show in featured carousel
  trending: boolean;             // Show in trending section
  onboarding: boolean;           // Show in onboarding section
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  likes: number;                 // Number of likes
  comments: number;              // Number of comments
}
```

## 🔍 **Helper Functions Available**

```typescript
// Get articles by type
getFeaturedArticles()     // Returns featured articles
getTrendingArticles()     // Returns trending articles  
getOnboardingArticles()   // Returns onboarding articles

// Find specific articles
getArticleById(id)        // Find by numeric ID
getArticleByTitle(title)  // Find by exact title match

// Filter articles
getArticlesByCategory(category)    // Filter by category
getArticlesByDifficulty(difficulty) // Filter by difficulty level
```

## 🎨 **Section Designs**

### **Trending Section**
- **Theme**: Green gradients with fire emoji 🔥
- **Focus**: Popular and trending content
- **Filters**: All, News, Analysis, Guides, Beginner, Advanced

### **Onboarding Section**  
- **Theme**: Blue/purple gradients with book emoji 📚
- **Focus**: Educational and beginner-friendly content
- **Filters**: All, Beginner, Wallets, DeFi, Security

## 📝 **Adding New Articles**

To add new articles to the system:

### 1. **Add to Articles Data**
Edit `src/data/articles.ts` and add a new article object:

```typescript
{
  id: 7, // Next available ID
  title: "Your Article Title",
  description: "Brief description of the article",
  content: `
# Your Article Title

Your markdown content here...

## Section 1
Content for section 1...

### Subsection
More detailed content...
  `,
  author: "Author Name",
  date: "Monday, May 20, 2025",
  imageUrl: "/api/placeholder/600/400",
  category: "EDUCATION",
  tags: ["Tag1", "Tag2", "Tag3"],
  readTime: 10,
  featured: false,
  trending: true,
  onboarding: true,
  difficulty: "Beginner",
  likes: 0,
  comments: 0
}
```

### 2. **Article Content Guidelines**
- **Use markdown syntax** for formatting
- **Include proper headers** (# ## ###)
- **Add code blocks** with ``` for code examples
- **Use bullet points** with * or numbered lists
- **Include links** with [text](url) syntax

## 🔗 **Article Referencing**

Articles can be referenced in multiple ways:

### **By ID (Recommended)**
```typescript
// URL: /articles/1
const article = getArticleById(1);
```

### **By Title**
```typescript
// URL: /articles/How%20To%20Make%20Money%20Online%20With%20Crypto%20Airdrops
const article = getArticleByTitle("How To Make Money Online With Crypto Airdrops");
```

### **In Components**
```jsx
import { getArticleById } from '@/data/articles';

// In your component
const article = getArticleById(1);
if (article) {
  return <Link href={`/articles/${article.id}`}>{article.title}</Link>;
}
```

## 🎯 **Current Articles Available**

1. **"How To Make Money Online With Crypto Airdrops"** (ID: 1)
   - Featured, Trending, Onboarding
   - Beginner level, 8 min read

2. **"Start Here: The Only Spot Trading Tips You Need In 2025"** (ID: 2)
   - Trending, Onboarding
   - Beginner level, 10 min read

3. **"The CBEX Scam in Nigeria: What Happened, Why It Matters, and How to Protect Yourself"** (ID: 3)
   - Trending only
   - Intermediate level, 12 min read

4. **"Understanding Blockchain Technology: A Beginner's Complete Guide"** (ID: 4)
   - Onboarding only
   - Beginner level, 15 min read

5. **"DeFi Explained: Your Gateway to Decentralized Finance"** (ID: 5)
   - Onboarding only
   - Intermediate level, 18 min read

6. **"Cryptocurrency Wallets: Complete Security Guide for 2025"** (ID: 6)
   - Onboarding only
   - Beginner level, 20 min read

## 🚀 **Benefits of This System**

### **1. Centralized Content Management**
- All articles in one place
- Easy to add, edit, or remove content
- Consistent data structure

### **2. Flexible Referencing**
- Reference by ID or title
- Works with existing URL structures
- Backward compatible

### **3. Rich Metadata**
- Difficulty levels for user guidance
- Read time estimates
- Proper categorization and tagging

### **4. Multiple Display Options**
- Featured carousel
- Trending section
- Onboarding section
- Regular articles page

### **5. Markdown Support**
- Easy content creation
- Proper formatting
- Code syntax highlighting

## 🔧 **Customization Options**

### **Adding New Sections**
To add new sections (like "Advanced" or "News"):

1. Add new boolean field to article interface
2. Create helper function to filter articles
3. Add section to home page with unique styling

### **Modifying Filters**
Update filter buttons in home page components to add new categories or change existing ones.

### **Styling Changes**
- Modify gradient colors in section backgrounds
- Update emoji icons for different themes
- Adjust card layouts and spacing

## 📱 **Mobile Responsiveness**

Both sections are fully responsive:
- **Horizontal scrolling** on mobile devices
- **Responsive card sizes** (w-80 on mobile, w-96 on larger screens)
- **Touch-friendly** filter buttons
- **Optimized spacing** for different screen sizes

The new content system provides a solid foundation for managing and displaying articles across your platform while maintaining flexibility for future enhancements! 🎉

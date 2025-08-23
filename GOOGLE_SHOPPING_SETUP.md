# Google Shopping Integration Setup

## Overview

This system fetches products from Google Shopping using SerpApi, translates product titles to Persian using OpenAI, and stores them in MongoDB with category-based organization.

## Features

- ✅ Fetches products from Google Shopping via SerpApi
- ✅ Translates product titles to Persian using OpenAI GPT-3.5
- ✅ Stores products in MongoDB with proper categorization
- ✅ Checks MongoDB first before making API calls
- ✅ Category-based product organization
- ✅ Persian UI with BYekan font
- ✅ No Redis/cache dependency

## Environment Variables Required

Add these to your `.env.local` file:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# SerpApi for Google Shopping
SERPAPI_KEY=your_serpapi_key

# OpenAI for Persian translation
OPENAI_API_KEY=your_openai_api_key
```

## API Endpoints

### GET /api/shopping/google-shopping

Fetches and manages Google Shopping products.

**Query Parameters:**

- `category` (required): Product category (fashion, beauty, electronics, sports, pets, vitamins, accessories)
- `query` (required): Search query for Google Shopping

**Response:**

```json
{
  "products": [
    {
      "_id": "string",
      "id": "string",
      "title": "string",
      "title_fa": "string",
      "price": "string",
      "link": "string",
      "thumbnail": "string",
      "source": "string",
      "category": "string",
      "createdAt": "Date"
    }
  ],
  "source": "mongodb" | "serpapi",
  "count": number,
  "category": "string",
  "category_fa": "string"
}
```

## Database Schema

### GoogleShoppingProduct Collection

```javascript
{
  id: String (unique),
  title: String,
  title_fa: String, // Persian translation
  price: String,
  link: String,
  thumbnail: String,
  source: String,
  category: String,
  createdAt: Date
}
```

## Category Mapping

| English Category | Persian Category |
| ---------------- | ---------------- |
| fashion          | مد و لباس        |
| beauty           | آرایشی و بهداشتی |
| electronics      | الکترونیک        |
| sports           | ورزشی            |
| pets             | حیوانات خانگی    |
| vitamins         | ویتامین و مکمل   |
| accessories      | لوازم جانبی      |

## Pages

### Main Google Shopping Page

- **URL**: `/google-shopping`
- **Component**: `GoogleShoppingProducts`
- **Features**:
  - Displays products organized by category
  - Persian translations
  - Add to cart functionality (TODO)
  - External link to product pages

### Test Page

- **URL**: `/test-google-shopping`
- **Features**:
  - Test API functionality
  - Debug responses
  - Manual category/query testing

## Usage Flow

1. **First Request**:
   - Check MongoDB for existing products
   - If none found, fetch from SerpApi
   - Translate titles with OpenAI
   - Save to MongoDB
   - Return products

2. **Subsequent Requests**:
   - Check MongoDB for existing products
   - Return cached results from MongoDB
   - No API calls to SerpApi or OpenAI

## Search Queries by Category

```javascript
const searchQueries = {
  fashion: "women clothing fashion",
  beauty: "cosmetics makeup skincare",
  electronics: "smartphone laptop tablet",
  sports: "sports equipment fitness",
  pets: "pet food pet accessories",
  vitamins: "vitamins supplements health",
  accessories: "jewelry watches bags",
};
```

## Translation Instructions

The system translates product titles using this prompt:

```
Translate the following product title to Persian (Farsi).
Return only the Persian translation, nothing else.
Make it a coherent sentence of 5-10 words, not word-for-word literal translation.

Product title: "{product.title}"

Persian translation:
```

## Error Handling

- **Missing Environment Variables**: Returns 500 error with specific message
- **No Products Found**: Returns 404 error
- **Translation Errors**: Continues with other products, logs error
- **Database Errors**: Returns 500 error

## Performance Considerations

- **MongoDB Index**: Compound index on `{category: 1, createdAt: -1}`
- **Product Limit**: Maximum 20 products per category
- **Translation Rate Limiting**: Sequential processing to avoid OpenAI rate limits
- **Image Fallback**: Placeholder image for failed product images

## Future Enhancements

- [ ] Add to cart functionality
- [ ] Product filtering and sorting
- [ ] Price range filtering
- [ ] Product reviews integration
- [ ] Real-time stock updates
- [ ] Advanced search with multiple keywords
- [ ] Product comparison feature
- [ ] Wishlist functionality

## Testing

1. Set up environment variables
2. Visit `/test-google-shopping` to test API
3. Visit `/google-shopping` to see the main interface
4. Check MongoDB for stored products

## Troubleshooting

### Common Issues

1. **"SERPAPI_KEY environment variable is required"**
   - Add SERPAPI_KEY to your .env.local file

2. **"No products found for the given query"**
   - Try different search queries
   - Check if SerpApi is working

3. **Translation errors**
   - Check OpenAI API key
   - Verify OpenAI quota

4. **MongoDB connection issues**
   - Verify MONGODB_URI
   - Check network connectivity

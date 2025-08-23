# 🔧 API Setup Guide - Fix Search Functionality

## ❌ Current Issue

The search functionality is showing the error: **"خطا در دریافت محصولات. لطفاً دوباره تلاش کنید"** (Error in receiving products. Please try again.)

This is happening because the required API keys are missing from your `.env.local` file.

## ✅ Solution: Add Required API Keys

### Step 1: Update your `.env.local` file

Add these lines to your `.env.local` file:

```bash
# Existing MongoDB URI
MONGODB_URI=mongodb+srv://Gstyle-amz:Golnaznima1360@cluster0.cbcl0cy.mongodb.net/Gstyle-amz?retryWrites=true&w=majority

# Required API Keys for Search Functionality
SERPAPI_KEY=your_serpapi_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Telegram Support
TELEGRAM_SUPPORT=@gstyle_support

# Optional: Cron Secret for Cache Cleanup
CRON_SECRET=your_cron_secret_here
```

### Step 2: Get SERPAPI Key (Required for Google Shopping search)

1. Go to [https://serpapi.com/](https://serpapi.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Replace `your_serpapi_key_here` with your actual key

**Free Plan:** 100 searches per month

### Step 3: Get OpenAI API Key (Required for Persian translation)

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in to your OpenAI account
3. Create a new API key
4. Replace `your_openai_api_key_here` with your actual key

**Free Plan:** $5 credit for new users

## 🔍 What Each API Does

### SERPAPI_KEY

- **Purpose:** Searches Google Shopping for products from Turkish stores
- **Used for:** Finding products, prices, and store links
- **Required for:** All search functionality

### OPENAI_API_KEY

- **Purpose:** Translates product titles and descriptions to Persian
- **Used for:** Making product information readable for Persian users
- **Required for:** Product translation and enhancement

## 🚀 After Adding API Keys

1. Save the `.env.local` file
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. Try searching for products again

## 🆘 Alternative Solutions

### Option 1: Use Cached Results (Temporary)

The application will now show cached results even without API keys, but new searches won't work.

### Option 2: Test with Sample Data

You can test the UI with sample data by modifying the search components.

## 📞 Support

If you need help setting up the API keys:

1. Check the API provider documentation
2. Verify your API keys are correct
3. Check the browser console for detailed error messages

## 🔒 Security Note

- Never commit your `.env.local` file to version control
- Keep your API keys secure and don't share them publicly
- Monitor your API usage to avoid unexpected charges

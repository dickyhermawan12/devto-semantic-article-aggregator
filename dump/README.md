# DUMP

**This directory is used to store scraped articles from [devto-article-scraper](../devto-article-scraper/scraper.js)**

How to actually use the scraper:
1. Navigate to scraper directory from this repo root directory
   ```sh
   cd devto-article-scraper
   ```
2. Install the required NPM packages
   ```sh
   npm install
   ```
3. Update the article URLs to your choice in `scraper.js`
   ```js
   const articleURLlist = [
    // add article URLs...
   ]
   ```
4. Run the script
   ```sh
   npm run start
   ```

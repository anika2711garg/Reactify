// import { chromium } from 'playwright'; // Removed to fix deployment
// Using standard fetch + Cheerio (optional, generally just need valid HTML text)

export async function scrapeUrl(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
      next: { revalidate: 0 } // Don't cache for scraper
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    // Return empty screenshot or null since we aren't using a browser
    // The frontend handles missing screenshots gracefully
    return {
      html,
      screenshot: null
    };

  } catch (error) {
    console.error('Scraping failed:', error);
    throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}


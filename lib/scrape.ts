import { chromium } from 'playwright';

export async function scrapeUrl(url: string) {
  let browser = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Safer for some environments
    });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    // Navigate and wait for content
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait a bit for dynamic content (basic heuristic)
    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    } catch (e) {
      // Ignore timeout on network idle, it's optional
    }

    // Extract HTML
    const html = await page.content();
    
    return html;
  } catch (error) {
    console.error('Scraping failed:', error);
    throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}


import { scrapeUrl } from '../lib/scrape';
import { parseHtml } from '../lib/parse';

async function main() {
    const url = 'https://example.com';
    console.log(`Testing scraper on ${url}...`);

    try {
        const html = await scrapeUrl(url);
        console.log(`Successfully scraped ${html.length} chars.`);

        const sections = parseHtml(html);
        console.log(`Found ${sections.length} sections:`);
        sections.forEach(s => {
            console.log(`- [${s.type}] ${s.name} (ID: ${s.id})`);
            console.log(`  Preview: ${s.previewText}`);
        });

    } catch (error) {
        console.error('Test failed:', error);
    }
}

main();

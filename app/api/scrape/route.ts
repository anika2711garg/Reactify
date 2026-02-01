import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrl } from '@/lib/scrape';
import { parseHtml } from '@/lib/parse';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url || !url.startsWith('http')) {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }

        // Basic validation to prevent internal network scanning?
        // Implementation constraint: user asked for public URLs only.
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            return NextResponse.json({ error: 'Localhost URLs are not allowed' }, { status: 400 });
        }

        console.log(`Scraping: ${url}`);
        const html = await scrapeUrl(url);

        console.log(`Parsing sections...`);
        const sections = parseHtml(html);

        return NextResponse.json({
            success: true,
            url,
            sections
        });

    } catch (error) {
        console.error('API Scrape Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to scrape' },
            { status: 500 }
        );
    }
}

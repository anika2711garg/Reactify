import * as cheerio from 'cheerio';

export interface Section {
    id: string;
    type: string;
    html: string;
    previewText: string;
    name: string;
}

export function parseHtml(html: string, baseUrl: string): Section[] {
    const $ = cheerio.load(html);

    // Resolving relative URLs
    // Handle images
    $('img').each((_, el) => {
        const src = $(el).attr('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
            try {
                $(el).attr('src', new URL(src, baseUrl).toString());
            } catch (e) { }
        }
        // Handle srcset for responsive images
        const srcset = $(el).attr('srcset');
        if (srcset) {
            const newSrcset = srcset.split(',').map(part => {
                const [url, desc] = part.trim().split(/\s+/);
                if (url && !url.startsWith('http') && !url.startsWith('data:')) {
                    try {
                        return `${new URL(url, baseUrl).toString()} ${desc || ''}`;
                    } catch (e) { return part; }
                }
                return part;
            }).join(', ');
            $(el).attr('srcset', newSrcset);
        }
    });

    // Handle links
    $('a').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
            try {
                $(el).attr('href', new URL(href, baseUrl).toString());
            } catch (e) { }
        }
    });

    // 1. Clean HTML
    $('script').remove();
    $('style').remove();
    $('noscript').remove();
    $('iframe').remove();
    // Remove hidden elements? - maybe unsafe if they are used for layout logic, but let's keep it simple for now.

    const sections: Section[] = [];
    let sectionCount = 0;

    // 2. Heuristics for finding "sections"
    // Priority 1: <section> tags
    $('section').each((_, el) => {
        sections.push(processElement($, el, `section-${sectionCount++}`, 'Section'));
    });

    // Priority 2: <header> (Landing pages usually have one main header/hero)
    $('header').each((_, el) => {
        sections.unshift(processElement($, el, `header-${sectionCount++}`, 'Header'));
    });

    // Priority 3: <footer>
    $('footer').each((_, el) => {
        sections.push(processElement($, el, `footer-${sectionCount++}`, 'Footer'));
    });

    // Priority 4: Direct children of <main> if no sections found, or just useful blocks
    if (sections.length < 3) {
        $('main > div').each((_, el) => {
            // filter out empty divs
            if ($(el).text().trim().length > 50) {
                sections.push(processElement($, el, `main-div-${sectionCount++}`, 'Content Block'));
            }
        });
    }

    // If still nothing, try body direct divs with meaningful content
    if (sections.length === 0) {
        $('body > div').each((_, el) => {
            if ($(el).text().trim().length > 100) {
                sections.push(processElement($, el, `body-div-${sectionCount++}`, 'Content Block'));
            }
        });
    }

    // Deduplicate based on content or overlapping? 
    // For now, return all found. 
    // Maybe filter out very small sections
    return sections.filter(s => s.html.length > 100);
}

function processElement($: cheerio.CheerioAPI, el: any, id: string, defaultName: string): Section {
    const $el = $(el);
    const rawHtml = $el.prop('outerHTML') || '';

    // Try to determine type/name from class or id
    const classAttr = $el.attr('class') || '';
    const idAttr = $el.attr('id') || '';

    let name = defaultName;
    let type = 'unknown';

    const lowerStr = (classAttr + ' ' + idAttr).toLowerCase();

    if (lowerStr.includes('hero')) { type = 'hero'; name = 'Hero Section'; }
    else if (lowerStr.includes('feature')) { type = 'features'; name = 'Features'; }
    else if (lowerStr.includes('pric')) { type = 'pricing'; name = 'Pricing'; }
    else if (lowerStr.includes('testimoni')) { type = 'testimonials'; name = 'Testimonials'; }
    else if (lowerStr.includes('nav') || lowerStr.includes('header')) { type = 'header'; name = 'Header/Nav'; }
    else if (lowerStr.includes('foot')) { type = 'footer'; name = 'Footer'; }

    // Get a preview text (first 100 chars)
    const previewText = $el.text().replace(/\s+/g, ' ').trim().slice(0, 150) + '...';

    // Simplified HTML for AI: 
    // We might want to strip out *all* attributes except src, href, alt for the AI prompt 
    // to prevent it from ignoring our "Tailwind only" rule because it sees existing classes.
    // BUT the AI needs to know layout to replicate it. 
    // Compromise: Keep structure, maybe strip excessively long SVG paths or data-attributes.

    return {
        id,
        type,
        html: rawHtml, // Send full HTML to AI so it can infer layout
        previewText,
        name
    };
}

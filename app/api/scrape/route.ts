import { NextRequest, NextResponse } from "next/server";
import { scrapeErrorMessage, scrapeUrl } from "@/lib/scrape";
import { parseHtml } from "@/lib/parse";
import { assertPublicHttpUrl } from "@/lib/scraper/url-guard";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = assertPublicHttpUrl(body.url);

    const { html, screenshot } = await scrapeUrl(url);
    const sections = parseHtml(html, url);

    return NextResponse.json({
      success: true,
      url,
      sections,
      screenshot,
      warnings: sections.length ? [] : ["No semantic sections were detected. You can still generate from the screenshot."],
    });
  } catch (error) {
    return NextResponse.json(
      { error: scrapeErrorMessage(error) },
      { status: 500 }
    );
  }
}

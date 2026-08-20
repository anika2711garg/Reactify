const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Upgrade-Insecure-Requests": "1",
};

function isBlockedPage(status: number, html: string) {
  if ([401, 403, 407, 429, 503].includes(status)) return true;
  return /cloudflare|attention required|just a moment|access denied|enable javascript and cookies/i.test(
    html.slice(0, 4000)
  );
}

export function scrapeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (/blocked|cloudflare|403|401|429|attention required|access denied/i.test(message)) {
    return "This website blocked the scraper. Open the Screenshot tab and upload a capture instead.";
  }
  if (/404|not found/i.test(message)) {
    return "That page was not found. Check the full URL and try again.";
  }
  if (/timeout|timed out|aborted|ETIMEDOUT/i.test(message)) {
    return "The website took too long to respond. Try again or upload a screenshot.";
  }
  if (/ENOTFOUND|DNS|getaddrinfo/i.test(message)) {
    return "That website could not be reached. Check the URL.";
  }

  return "This website could not be read. Try another URL or upload a screenshot.";
}

export async function scrapeUrl(url: string) {
  const origin = new URL(url).origin;
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        ...BROWSER_HEADERS,
        Referer: `${origin}/`,
      },
      redirect: "follow",
      cache: "no-store",
    });
  } catch (error) {
    throw new Error(
      `Failed to scrape URL: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  const html = await response.text();

  if (!response.ok || isBlockedPage(response.status, html)) {
    throw new Error(
      `This website blocked the scraper (${response.status}). Use a screenshot instead.`
    );
  }

  if (html.trim().length < 200) {
    throw new Error("The page returned almost no HTML to convert.");
  }

  return {
    html,
    screenshot: null as string | null,
  };
}

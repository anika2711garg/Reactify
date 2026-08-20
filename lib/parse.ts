import * as cheerio from "cheerio";

export interface Section {
  id: string;
  type: string;
  html: string;
  previewText: string;
  name: string;
}

const MAX_SECTION_HTML = 7000;

function compactHtml(rawHtml: string, baseUrl: string) {
  const $ = cheerio.load(rawHtml, null, false);

  $("script, style, noscript, iframe, svg, path, symbol, use, link, meta").remove();
  $("[data-testid], [data-qa]").each((_, el) => {
    $(el).removeAttr("data-testid").removeAttr("data-qa");
  });

  $("img").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith("http") && !src.startsWith("data:")) {
      try {
        $(el).attr("src", new URL(src, baseUrl).toString());
      } catch {
        /* keep original */
      }
    }
    $(el).removeAttr("srcset").removeAttr("sizes");
  });

  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (href && !href.startsWith("http") && !href.startsWith("#") && !href.startsWith("mailto:")) {
      try {
        $(el).attr("href", new URL(href, baseUrl).toString());
      } catch {
        /* keep original */
      }
    }
  });

  let html = $.root().children().first().prop("outerHTML") || $.html() || rawHtml;
  if (html.length > MAX_SECTION_HTML) {
    html = `${html.slice(0, MAX_SECTION_HTML)}<!-- truncated for generation -->`;
  }
  return html;
}

function classifySection(classAttr: string, idAttr: string, defaultName: string, tagName: string) {
  const lowerStr = `${classAttr} ${idAttr} ${tagName} ${defaultName}`.toLowerCase();
  if (lowerStr.includes("recipe") || lowerStr.includes("ingredient") || lowerStr.includes("method")) {
    return { type: "recipe", name: "Recipe" };
  }
  if (tagName === "article" || lowerStr.includes("article") || lowerStr.includes("journal")) {
    return { type: "article", name: "Article" };
  }
  if (tagName === "main" || lowerStr.includes("main")) {
    return { type: "main", name: "Main content" };
  }
  if (lowerStr.includes("hero")) return { type: "hero", name: "Hero Section" };
  if (lowerStr.includes("feature")) return { type: "features", name: "Features" };
  if (lowerStr.includes("pric")) return { type: "pricing", name: "Pricing" };
  if (lowerStr.includes("testimoni")) return { type: "testimonials", name: "Testimonials" };
  if (lowerStr.includes("nav") || lowerStr.includes("header") || tagName === "header") {
    return { type: "header", name: "Header/Nav" };
  }
  if (lowerStr.includes("foot") || tagName === "footer") return { type: "footer", name: "Footer" };
  return { type: "unknown", name: defaultName };
}

function processElement(
  $: cheerio.CheerioAPI,
  el: any,
  id: string,
  defaultName: string,
  baseUrl: string
): Section {
  const $el = $(el);
  const rawHtml = $el.prop("outerHTML") || "";
  const tagName = (((el as { tagName?: string }).tagName || $el.prop("tagName") || "") as string).toLowerCase();
  const classAttr = $el.attr("class") || "";
  const idAttr = $el.attr("id") || "";
  const { type, name } = classifySection(classAttr, idAttr, defaultName, tagName);
  const previewText = `${$el.text().replace(/\s+/g, " ").trim().slice(0, 150)}...`;

  return {
    id,
    type,
    html: compactHtml(rawHtml, baseUrl),
    previewText,
    name,
  };
}

export function rankSections(sections: Section[]) {
  const score = (section: Section) => {
    let value = section.html.length;
    if (["recipe", "article", "main", "hero"].includes(section.type)) value += 10000;
    if (section.type === "header" || section.type === "footer") value -= 20000;
    return value;
  };

  return [...sections].sort((left, right) => score(right) - score(left));
}

export function parseHtml(html: string, baseUrl: string): Section[] {
  const $ = cheerio.load(html);
  $("script, style, noscript, iframe").remove();

  const sections: Section[] = [];
  let sectionCount = 0;
  const seen = new Set<string>();

  const push = (el: any, name: string) => {
    const section = processElement($, el, `block-${sectionCount++}`, name, baseUrl);
    const key = `${section.type}:${section.previewText.slice(0, 80)}`;
    if (seen.has(key) || section.html.length < 80) return;
    seen.add(key);
    sections.push(section);
  };

  $("article, [itemtype*='Recipe']").each((_, el) => push(el, "Article"));
  $("main").each((_, el) => push(el, "Main content"));
  $("section").each((_, el) => push(el, "Section"));
  $("header").each((_, el) => push(el, "Header"));
  $("footer").each((_, el) => push(el, "Footer"));

  if (sections.filter((section) => section.type === "article" || section.type === "recipe" || section.type === "main").length === 0) {
    $("h1")
      .first()
      .closest("div, article, section")
      .each((_, el) => push(el, "Page content"));
  }

  if (sections.length === 0) {
    $("main > div, body > div").each((_, el) => {
      if ($(el).text().trim().length > 80) push(el, "Content Block");
    });
  }

  return rankSections(sections).slice(0, 8);
}

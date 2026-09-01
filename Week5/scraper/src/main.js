
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const _filename = fileURLToPath(import.meta.url);
const __dirname = dirname(_filename);

const CONFIG = {
  CACHE_DIR: path.join(__dirname, "..", "cache"),
  USER_AGENT:
    "FlyRankInternship-A9/1.0 (+https://github.com/Evavic44/portfolio-i...)",
  TIMEOUT_MS: 5000,
  POLITE_DELAY_MS: 500,
};

// Ensure cache directory exists
if (!fs.existsSync(CONFIG.CACHE_DIR)) {
  fs.mkdirSync(CONFIG.CACHE_DIR, { recursive: true });
}

async function getPageHtml(url) {
  const urlObj = new URL(url);
  const cacheFile = path.basename(urlObj.pathname);
  const cachePath = path.join(CONFIG.CACHE_DIR, cacheFile);

  if (fs.existsSync(cachePath)) {
    console.log(`CACHE HIT: ${cacheFile}`);
    return fs.readFileSync(cachePath, "utf-8");
  }

  console.log(`FETCH: ${url}`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": CONFIG.USER_AGENT },
    });

    clearTimeout(timeoutId);

    if (response.status !== 200) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText || "Unknown"}`,
      );
    }

    const html = await response.text();
    fs.writeFileSync(cachePath, html, "utf-8");
    console.log(`Saved ${html.length} bytes to ${cacheFile}`);

    // Politeness delay AFTER real fetch (cached reads have zero delay)
    await new Promise((r) => setTimeout(r, CONFIG.POLITE_DELAY_MS));
    return html;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`Failed to fetch ${url}: ${error.message}`);
    throw error;
  }
}

async function discoverUrls() {
  const BASE_URL = "https://books.toscrape.com/catalogue/";
  let currentPageUrl = `${BASE_URL}page-1.html`;
  const allBookUrls = new Set();
  let pageCount = 0;

  while (currentPageUrl && pageCount < 3) {
    pageCount++;
    console.log(`\n=== Processing Page ${pageCount} ===`);

    const html = await getPageHtml(currentPageUrl);
    const $ = cheerio.load(html);

    // DEBUG: Check if we're finding anything at all
    const articleCount = $("article.product_pod").length;
    console.log(`Found ${articleCount} article.product_pod elements`);

    // Use a more precise selector + validate by checking for index.html pattern
    $("article.product_pod h3 a").each((_, el) => {
      const href = $(el).attr("href");
      const title = $(el).attr("title");

      // Valid book links end with /index.html and have a title attribute
      if (href && href.endsWith("/index.html") && title) {
        const absoluteUrl = new URL(href, currentPageUrl).href;
        allBookUrls.add(absoluteUrl);
      } else if (href) {
        console.warn(`⚠️ Skipped non-book link: ${href}`);
      }
    });

    console.log(`Extracted ${allBookUrls.size} unique URLs so far`);

    // Follow site's OWN "next" link
    const nextLink = $("li.next a").attr("href");
    if (!nextLink || pageCount >= 3) break;

    currentPageUrl = new URL(nextLink, currentPageUrl).href;
  }

  console.log(`\n✅ DISCOVERY COMPLETE`);
  console.log(`catalogue_pages=${pageCount}`);
  console.log(`discovered=${allBookUrls.size}`);
  console.log(`unique_urls=${allBookUrls.size}`);

  return [...allBookUrls];
}

// Run Stage 2 discovery
discoverUrls()
  .then((urls) => {
    console.log("\n All discovered URLs:");
    urls.forEach((url, i) => console.log(`${i + 1}. ${url}`));
  })
  .catch((err) => {
    console.error("Discovery failed:", err);
    process.exit(1);
  });

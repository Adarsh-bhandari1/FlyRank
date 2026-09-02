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
  const safeName = urlObj.pathname.replace(/^\//, "").replace(/\//g, "_");
  const cacheFile = `${safeName}.html`;
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
    console.log(`Processing Page ${pageCount}`);

    const html = await getPageHtml(currentPageUrl);
    const $ = cheerio.load(html);

    const articleCount = $("article.product_pod").length;
    console.log(`Found ${articleCount} article.product_pod elements`);

    $("article.product_pod h3 a").each((_, el) => {
      const href = $(el).attr("href");
      const title = $(el).attr("title");

      if (href && href.endsWith("/index.html") && title) {
        const absoluteUrl = new URL(href, currentPageUrl).href;
        allBookUrls.add(absoluteUrl);
      } else if (href) {
        console.warn(`Skipped non-book link: ${href}`);
      }
    });

    console.log(`Extracted ${allBookUrls.size} unique URLs so far`);

    const nextLink = $("li.next a").attr("href");
    if (!nextLink || pageCount >= 3) break;

    currentPageUrl = new URL(nextLink, currentPageUrl).href;
  }

  console.log(`DISCOVERY COMPLETE`);
  console.log(`catalogue_pages=${pageCount}`);
  console.log(`discovered=${allBookUrls.size}`);
  console.log(`unique_urls=${allBookUrls.size}`);

  return [...allBookUrls];
}

async function extractBookDetails(bookUrl, sourcePage) {
  const html = await getPageHtml(bookUrl);
  const $ = cheerio.load(html);

  const productMain = $("div.product_main");
  if (!productMain.length) throw new Error(`No product_main for ${bookUrl}`);

  const ratingClass = productMain.find(".star-rating").attr("class") || "";
  const ratingText = ratingClass.split(" ").pop() || "Unknown";

  let description = null;
  const descP = $("#product_description p");
  if (descP.length && descP.text().trim()) {
    description = descP.text().trim();
  }

  return {
    title: productMain.find("h1").text().trim(),
    product_url: bookUrl,
    price_text: productMain.find("p.price_color").text().trim(),
    availability_text: productMain.find("p.instock.availability").text().trim(),
    rating_text: ratingText,
    description,
    source_page: sourcePage,
    fetched_at: new Date().toISOString(),
  };
}

// Run Stage 3: Discover THEN Extract
(async () => {
  try {
    const urls = await discoverUrls();

    // Map each URL back to its source catalogue page
    const urlToSourcePage = new Map();
    let tempCurrentUrl = "https://books.toscrape.com/catalogue/page-1.html";

    for (let p = 1; p <= 3; p++) {
      try {
        const pageUrl = `https://books.toscrape.com/catalogue/page-${p}.html`;
        const urlObj = new URL(pageUrl);
        const safeName = urlObj.pathname.replace(/^\//, "").replace(/\//g, "_");
        const cacheFile = `${safeName}.html`;

        const html = fs.readFileSync(
          path.join(CONFIG.CACHE_DIR, cacheFile),
          "utf-8",
        );
        const $ = cheerio.load(html);

        $("article.product_pod h3 a").each((_, el) => {
          const href = $(el).attr("href");
          if (href && href.endsWith("/index.html")) {
            const abs = new URL(href, tempCurrentUrl).href;
            urlToSourcePage.set(abs, tempCurrentUrl);
          }
        });

        const nextLink = $("li.next a").attr("href");
        if (!nextLink || p >= 3) break;
        tempCurrentUrl = new URL(nextLink, tempCurrentUrl).href;
      } catch (err) {
        console.error(`️ Failed to map source for page ${p}: ${err.message}`);
      }
    }

    const records = [];
    for (const url of urls) {
      try {
        const record = await extractBookDetails(url, urlToSourcePage.get(url));
        records.push(record);

        if (records.length === 1) {
          console.log("SAMPLE RAW RECORD:");
          console.log(JSON.stringify(record, null, 2));
        }
      } catch (err) {
        console.error(` Failed ${url}: ${err.message}`);
      }
    }

    console.log("EXTRACTION COMPLETE");
    console.log(`detail_pages=${records.length}`);
    console.log(`Expected: 60`);
  } catch (err) {
    console.error("Pipeline failed:", err);
    process.exit(1);
  }
})();

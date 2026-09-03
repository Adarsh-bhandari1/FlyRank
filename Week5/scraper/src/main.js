import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";
import { z } from "zod";

const _filename = fileURLToPath(import.meta.url);
const __dirname = dirname(_filename);

// Configuration for the scraper
const CONFIG = {
  CACHE_DIR: path.join(__dirname, "..", "cache"),
  OUTPUT_DIR: path.join(__dirname, "..", "output"),
  USER_AGENT:
    "FlyRankInternship-A9/1.0 (+https://github.com/Evavic44/portfolio-i...)",
  TIMEOUT_MS: 5000,
  POLITE_DELAY_MS: 500,
};

// Ensure directories exist IMMEDIATELY
[CONFIG.CACHE_DIR, CONFIG.OUTPUT_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Schema for book details
const BookSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
  product_url: z.string().url("Must be a valid absolute URL"),
  price_text: z.string().regex(/^£[\d.]+$/, "Must match £XX.XX format"),
  price_gbp: z.number().positive("Price must be positive"),
  availability_text: z.string().min(1, "Availability text required"),
  rating_text: z.enum(["One", "Two", "Three", "Four", "Five"], {
    errorMap: () => ({ message: "Rating must be One-Five" }),
  }),
  description: z.string().nullable(),
  source_page: z.string().url("Source page must be valid URL"),
  fetched_at: z.string().datetime("Must be ISO timestamp"),
});

function normalizePrice(priceText) {
  if (!priceText || !priceText.startsWith("£")) return NaN;
  const num = parseFloat(priceText.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? NaN : Math.round(num * 100) / 100;
}

// Core functions for the scraper
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

    // Status check
    if (response.status !== 200) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText || "Unknown"}`,
      );
    }

    const html = await response.text();
    fs.writeFileSync(cachePath, html, "utf-8");
    console.log(`Saved ${html.length} bytes to ${cacheFile}`);

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
    console.log(`\nProcessing Page ${pageCount}`);

    const html = await getPageHtml(currentPageUrl);
    const $ = cheerio.load(html);

    console.log(
      `Found ${$("article.product_pod").length} article.product_pod elements`,
    );

    $("article.product_pod h3 a").each((_, el) => {
      const href = $(el).attr("href");
      const title = $(el).attr("title");

      if (href && href.endsWith("/index.html") && title) {
        allBookUrls.add(new URL(href, currentPageUrl).href);
      } else if (href) {
        console.warn(`Skipped non-book link: ${href}`);
      }
    });

    console.log(`Extracted ${allBookUrls.size} unique URLs so far`);

    const nextLink = $("li.next a").attr("href");
    if (!nextLink || pageCount >= 3) break;
    currentPageUrl = new URL(nextLink, currentPageUrl).href;
  }

  console.log(`Discovery complete`);
  console.log(
    `catalogue_pages=${pageCount}, discovered=${allBookUrls.size}, unique_urls=${allBookUrls.size}`,
  );
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
  if (descP.length && descP.text().trim()) description = descP.text().trim();

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

// Execution of the scraper
(async () => {
  try {
    const urls = await discoverUrls();

    // Map URLs to source pages
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
            urlToSourcePage.set(
              new URL(href, tempCurrentUrl).href,
              tempCurrentUrl,
            );
          }
        });

        const nextLink = $("li.next a").attr("href");
        if (!nextLink || p >= 3) break;
        tempCurrentUrl = new URL(nextLink, tempCurrentUrl).href;
      } catch (err) {
        console.error(`Failed to map source for page ${p}: ${err.message}`);
      }
    }

    // Validate & store with deduplication
    const seenUrls = new Set();
    const validRecords = [];
    const errors = [];

    for (const url of urls) {
      try {
        const raw = await extractBookDetails(url, urlToSourcePage.get(url));
        const priceGbp = normalizePrice(raw.price_text);

        if (isNaN(priceGbp))
          throw new Error(`Invalid price: "${raw.price_text}"`);

        const record = { ...raw, price_gbp: priceGbp };
        const result = BookSchema.safeParse(record);

        if (!result.success) {
          errors.push({
            url,
            reason: result.error.errors.map((e) => e.message).join("; "),
            raw_data: record,
          });
          continue;
        }

        // Deduplicate by canonical URL
        if (seenUrls.has(result.data.product_url)) {
          console.warn(`Duplicate skipped: ${result.data.product_url}`);
          continue;
        }

        seenUrls.add(result.data.product_url);
        validRecords.push(result.data);
      } catch (err) {
        errors.push({ url, reason: err.message, raw_data: null });
        console.error(`Failed ${url}: ${err.message}`);
      }
    }

    // Idempotent write
    fs.writeFileSync(
      path.join(CONFIG.OUTPUT_DIR, "books.json"),
      JSON.stringify(validRecords, null, 2),
    );

    if (errors.length > 0) {
      fs.writeFileSync(
        path.join(CONFIG.OUTPUT_DIR, "errors.json"),
        JSON.stringify(errors, null, 2),
      );
      console.log(`${errors.length} invalid records → errors.json`);
    }

    console.log("Validation complete");
    console.log(
      `valid_records=${validRecords.length} | invalid_records=${errors.length} | Expected: 60/0`,
    );

    if (validRecords.length > 0) {
      console.log("Sample validated record:");
      console.log(JSON.stringify(validRecords[0], null, 2));
    }
  } catch (err) {
    console.error("Pipeline failed:", err);
    process.exit(1);
  }
})();

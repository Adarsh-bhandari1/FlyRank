import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const _filename = fileURLToPath(import.meta.url);
const __dirname = dirname(_filename); 
const CONFIG = {
  CACHE_DIR: path.join(__dirname, "..", "cache"),
  PAGE_1_FILE: "catalogue-page-1.html",
  TARGET_URL: "https://books.toscrape.com/catalogue/page-1.html",
  USER_AGENT:
    "FlyRankInternship-A9/1.0 (+https://github.com/Evavic44/portfolio-i...)",
  TIMEOUT_MS: 5000,
};

if (!fs.existsSync(CONFIG.CACHE_DIR)) {
  fs.mkdirSync(CONFIG.CACHE_DIR, { recursive: true });
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": CONFIG.USER_AGENT,
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function main() {
  const cachePath = path.join(CONFIG.CACHE_DIR, CONFIG.PAGE_1_FILE);

  // Check if cached file exists
  if (fs.existsSync(cachePath)) {
    console.log("CACHE HIT");
    const html = fs.readFileSync(cachePath, "utf-8");
    console.log(`Read ${html.length} bytes from cache`);
    return html;
  }

  // Fetch from web
  console.log("FETCH");
  try {
    const response = await fetchWithTimeout(CONFIG.TARGET_URL);

    // Check status code
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Save to cache
    fs.writeFileSync(cachePath, html, "utf-8");
    console.log(`Fetched ${html.length} bytes and saved to cache`);

    return html;
  } catch (error) {
    console.error(`Fetch failed: ${error.message}`);
    process.exit(1);
  }
}

// Run
main().catch(console.error);
// test-render.js
import { getReportData } from "./db.js";
import { generatePDF } from "./render.js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stat } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const reportData = getReportData();
  const outputPath = join(__dirname, "reports", "test.pdf");

  console.log("Generating PDF...");
  await generatePDF(reportData, outputPath);

  // Verify file exists and has reasonable size
  const stats = await stat(outputPath);
  console.log(` File size: ${(stats.size / 1024).toFixed(1)} KB`);

  if (stats.size < 1024) {
    console.error(" PDF too small — likely empty or failed to render");
    process.exit(1);
  }

  console.log("\Manual verification checklist:");
  console.log("   Open reports/test.pdf and confirm:");
  console.log("   • At least 2 pages (if not, seed 500+ rows temporarily)");
  console.log("   • No table rows cut in half at page breaks");
  console.log(
    '   • "Product/Revenue" and "Date/Orders" headers repeat on page 2+',
  );
  console.log("   • Background colors and borders rendered correctly");
}

main().catch((err) => {
  console.error(" Generation failed:", err);
  process.exit(1);
});

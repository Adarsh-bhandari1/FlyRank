// render.js
import { chromium } from "playwright";
import { mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPORTS_DIR = join(__dirname, "reports");

/**
 * Renders report data into a PDF using headless Chromium.
 * @param {Object} reportData - The aggregated data object from db.js
 * @param {string} outputPath - Absolute path to save the PDF
 */
export async function generatePDF(reportData, outputPath) {
  // Ensure reports directory exists
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sales Report</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; color: #1a1a1a; }
      h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 8px; margin-bottom: 24px; }
      .summary { display: flex; gap: 20px; margin: 24px 0; }
      .card { background: #f8fafc; border-left: 4px solid #1e40af; padding: 16px; flex: 1; border-radius: 0 8px 8px 0; }
      .card h3 { margin: 0 0 8px; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
      .card p { margin: 0; font-size: 24px; font-weight: bold; color: #0f172a; }
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      th { background: #1e40af; color: white; padding: 12px 16px; text-align: left; font-weight: 600; }
      td { padding: 10px 16px; border-bottom: 1px solid #e2e8f0; }
      tr:nth-child(even) { background: #f8fafc; }
      
      /* FIX: Prevent row splitting across pages */
      tr { break-inside: avoid; }
      /* FIX: Repeat header on every page */
      thead { display: table-header-group; }
    }
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }
  </style>
</head>
<body>
  <h1>Sales Report • ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</h1>
  
  <div class="summary">
    <div class="card">
      <h3>Total Orders</h3>
      <p>${reportData.totalOrders.toLocaleString()}</p>
    </div>
    <div class="card">
      <h3>Total Revenue</h3>
      <p>$${reportData.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>
  </div>

  <h2>Top 5 Products by Revenue</h2>
  <table>
    <thead><tr><th>Product</th><th>Revenue</th></tr></thead>
    <tbody>
      ${reportData.topProducts
        .map(
          (p) => `
        <tr><td>${p.product}</td><td>$${p.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
      `,
        )
        .join("")}
    </tbody>
  </table>

  <h2>Daily Orders (Last 7 Days)</h2>
  <table>
    <thead><tr><th>Date</th><th>Orders</th></tr></thead>
    <tbody>
      ${reportData.dailyOrders
        .map(
          (d) => `
        <tr><td>${d.date}</td><td>${d.count}</td></tr>
      `,
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>`;

  await page.setContent(html);

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  });

  await browser.close();
  console.log(`PDF generated: ${outputPath}`);
}

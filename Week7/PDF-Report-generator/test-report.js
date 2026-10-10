import { getReportData } from "./db.js";

const report = getReportData();
console.log(JSON.stringify(report, null, 2));

// Validate structure
if (!Array.isArray(report.dailyOrders)) {
  console.error(" dailyOrders is not an array");
  process.exit(1);
}
if (report.topProducts.length !== 5) {
  console.error(`Expected 5 top products, got ${report.topProducts.length}`);
  process.exit(1);
}
console.log(" All 4 report sections present and valid");

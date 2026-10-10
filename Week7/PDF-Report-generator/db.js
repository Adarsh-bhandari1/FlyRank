import { DatabaseSync } from "node:sqlite";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, "report.db");

export function getReportData() {
  const db = new DatabaseSync(DB_PATH);

  const totalOrders = db
    .prepare("SELECT COUNT(*) as count FROM orders")
    .get().count;

  const totalRevenue =
    db.prepare("SELECT SUM(amount) as sum FROM orders").get().sum || 0;

  const topProducts = db
    .prepare(
      `
      SELECT product, SUM(amount) as revenue
      FROM orders
      GROUP BY product
      ORDER BY revenue DESC
      LIMIT 5
    `,
    )
    .all();

  const dailyOrders = db
    .prepare(
      `
      SELECT created_at as date, COUNT(*) as count
      FROM orders
      WHERE created_at >= date('now', '-7 days')
      GROUP BY created_at
      ORDER BY created_at ASC
    `,
    )
    .all();

  db.close();

  return {
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    topProducts: topProducts.map((p) => ({
      product: p.product,
      revenue: Math.round(p.revenue * 100) / 100,
    })),
    dailyOrders, 
  };
}

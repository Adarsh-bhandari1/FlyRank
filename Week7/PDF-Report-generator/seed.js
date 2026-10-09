import { DatabaseSync } from "node:sqlite";
import { unlinkSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, "report.db");

if (existsSync(DB_PATH)) {
  unlinkSync(DB_PATH);
}

const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT NOT NULL,
    product TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const customers = ["Alice", "Bob", "Charlie", "Diana", "Ethan"];
const products = [
  "Laptop",
  "Mouse",
  "Keyboard",
  "Monitor",
  "Headphones",
  "Webcam",
];

const stmt = db.prepare(
  "INSERT INTO orders (customer, product, amount, created_at) VALUES (?, ?, ?, ?)",
);

console.log("Seeding 200 orders");

for (let i = 0; i < 200; i++) {
  const customer = customers[Math.floor(Math.random() * customers.length)];
  const product = products[Math.floor(Math.random() * products.length)];
  const amount = Math.round((Math.random() * 195 + 5) * 100) / 100;

  const now = new Date();
  const pastDate = new Date(
    now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000,
  );
  const created_at = pastDate.toISOString().split("T")[0];
  stmt.run(customer, product, amount, created_at);
}
const count = db.prepare("SELECT COUNT(*) as total FROM orders").get().total;
console.log(` Seeded ${count} orders into report.db`);
db.close();

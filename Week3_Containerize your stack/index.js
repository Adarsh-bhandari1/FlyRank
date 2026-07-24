import dotenv from "dotenv";
dotenv.config();
import pool from "./src/db.js";
try {
  const result = await pool.query("SELECT NOW()");
  console.log("Connection established successfully");
  console.log(result.rows[0]);
} catch (err) {
  console.error(err);
}

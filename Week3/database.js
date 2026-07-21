import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./tasks.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

db.serialize(() => {
  db.run(
    `
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            completed INTEGER DEFAULT 0
        )
    `,
    (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Tasks table is ready.");
      }
    },
  );
});

export default db;

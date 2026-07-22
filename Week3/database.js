import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./tasks.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});
import path from "path";

console.log("Using database:", path.resolve("./tasks.db"));
db.serialize(() => {
  // Create the tasks table
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
        console.error("Error creating table:", err.message);
        return;
      }

      console.log("Tasks table is ready.");

      // Check if the table is empty
      db.get("SELECT COUNT(*) AS count FROM tasks", (err, row) => {
        if (err) {
          console.error("Error checking tasks:", err.message);
          return;
        }

        // Insert sample tasks only if the table is empty
        if (row.count === 0) {
          const stmt = db.prepare(
            "INSERT INTO tasks (title, completed) VALUES (?, ?)",
          );

          stmt.run("Learn SQLite", 0);
          stmt.run("Complete Week 3 Assignment", 0);
          stmt.run("Push project to GitHub", 0);

          stmt.finalize((err) => {
            if (err) {
              console.error("Error inserting sample tasks:", err.message);
            } else {
              console.log("Sample tasks inserted.");
            }
          });
        } else {
          console.log("Sample tasks already exist.");
        }
      });
    },
  );
});

export default db;

import pool from "./src/db.js";

async function initializeDatabase() {
  try {
    // Check connection
    await pool.query("SELECT NOW()");
    console.log("Connected to PostgreSQL");

    // Create table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        done BOOLEAN DEFAULT FALSE
      );
    `);

    console.log("Tasks table is ready.");

    // Check if table is empty
    const result = await pool.query("SELECT COUNT(*) FROM tasks");

    if (Number(result.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO tasks (title, done)
        VALUES
          ('Learn Docker', false),
          ('Learn PostgreSQL', false),
          ('Complete FlyRank Assignment', false);
      `);

      console.log("Seeded 3 example tasks.");
    } else {
      console.log("Database already contains data.");
    }

  } catch (err) {
    console.error(err);
  }
}

initializeDatabase();
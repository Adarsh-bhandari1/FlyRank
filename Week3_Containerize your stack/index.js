import app from "./src/app.js";
import pool from "./src/db.js";

const PORT = process.env.PORT || 3000;

async function initializeDatabase() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks(
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            done BOOLEAN DEFAULT FALSE
        )
    `);

    const result = await pool.query(
        "SELECT COUNT(*) FROM tasks"
    );

    if (Number(result.rows[0].count) === 0) {

        await pool.query(`
            INSERT INTO tasks(title,done)
            VALUES
            ('Learn Docker',false),
            ('Learn PostgreSQL',false),
            ('Complete FlyRank Assignment',false)
        `);

    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

}

initializeDatabase();
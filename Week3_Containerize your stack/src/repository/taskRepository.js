import pool from "../db.js";

export async function getAllTasks() {
    const result = await pool.query(
        "SELECT * FROM tasks ORDER BY id"
    );

    return result.rows;
}

export async function getTaskById(id) {
    const result = await pool.query(
        "SELECT * FROM tasks WHERE id = $1",
        [id]
    );

    return result.rows[0];
}
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

export async function createTask(title, done) {
    const result = await pool.query(
        `INSERT INTO tasks(title, done)
         VALUES($1, $2)
         RETURNING *`,
        [title, done]
    );

    return result.rows[0];
}

export async function updateTask(id, title, done) {
    const result = await pool.query(
        `UPDATE tasks
         SET title = $1,
             done = $2
         WHERE id = $3
         RETURNING *`,
        [title, done, id]
    );

    return result.rows[0];
}

export async function deleteTask(id) {
    const result = await pool.query(
        `DELETE FROM tasks
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    return result.rows[0];
}
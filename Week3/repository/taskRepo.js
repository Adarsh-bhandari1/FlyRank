import db from "../database.js";

// Get all tasks
export function getAllTasks() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Get task by id
export function getTaskById(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

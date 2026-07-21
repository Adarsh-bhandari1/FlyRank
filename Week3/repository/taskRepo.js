import db from "../database.js";

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

export function createTask(title) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO tasks (title, completed) VALUES (?, ?)";

    db.run(sql, [title, 0], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id: this.lastID,
          title,
          completed: 0,
        });
      }
    });
  });
}
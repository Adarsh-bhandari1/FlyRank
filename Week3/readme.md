# Week 3 SQLite Task API

A simple REST API built using **Node.js**, **Express.js**, **SQLite**, and **Swagger UI**. This project is a continuation of Assignment 1, where the in-memory task storage has been replaced with a SQLite database. The API endpoints remain the same, but the data now persists even after the server restarts.

---

# Features

- RESTful API
- Full CRUD Operations
- SQLite Database
- Persistent Data Storage
- Express.js Server
- Swagger API Documentation
- JSON Request & Response
- Automatic Database Creation
- Automatic Seeding of Sample Tasks

---

# Tech Stack

- Node.js
- Express.js
- SQLite (`sqlite3`)
- Swagger UI Express
- OpenAPI 3.0

---

# Why SQLite?

SQLite was chosen because:

- It is lightweight and requires no separate database server.
- It stores all data in a single file (`tasks.db`).
- It requires zero configuration.
- Data survives server restarts, unlike in-memory storage.
- It is perfect for small backend applications and learning SQL.

---

# Database

The application uses a SQLite database file named:

```
tasks.db
```

The database is:

- Created automatically when the server starts.
- The `tasks` table is created automatically if it does not exist.
- Seeded with three example tasks only when the table is empty.
- Added to `.gitignore` so every fresh clone creates its own database automatically.

---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<repository-name>.git
```

## 2. Move into the project directory

```bash
cd <repository-name>
```

## 3. Install dependencies

```bash
npm install
```

---

# Run (One Command)

```bash
npm start
```

The server will start on:

```
http://localhost:3000
```

Swagger Documentation:

```
http://localhost:3000/docs
```

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Home Route |
| GET | `/health` | Health Check |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get task by ID |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

---

# Example API Request

```bash
curl -i http://localhost:3000/tasks
```

### Sample Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": 1,
    "title": "Learn SQLite",
    "completed": 0
  },
  {
    "id": 2,
    "title": "Complete Week 3 Assignment",
    "completed": 0
  },
  {
    "id": 3,
    "title": "Push project to GitHub",
    "completed": 0
  }
]
```

---

# Example SQL Query

The following query was executed in **DB Browser for SQLite** during Stage 4:

```sql
SELECT * FROM tasks;
```

This query returns all rows stored in the `tasks` table.

---

# Database Screenshot

Add your DB Browser screenshot here after opening `tasks.db`.

Example:

```
README-images/
    db-browser.png
```

Then include it like this:

```md
![SQLite Database](README-images/db-browser.png)
```

---

# Project Structure

```
Week3/
│
├── repository/
│   └── taskRepo.js
│
├── routes/
│   └── tasks.js
│
├── database.js
├── server.js
├── openapi.json
├── package.json
├── README.md
└── .gitignore
```

---

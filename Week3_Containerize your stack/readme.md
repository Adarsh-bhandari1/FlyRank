# Task Management API (Docker + PostgreSQL)

A simple RESTful Task Management API built with **Node.js**, **Express**, and **PostgreSQL**. The application is fully containerized using **Docker** and **Docker Compose**, allowing the entire stack to be started with a single command.

---

## Features

- Create, Read, Update, and Delete (CRUD) tasks
- PostgreSQL database
- Automatic table creation on startup
- Initial seed data (added only once)
- Dockerized application
- Persistent database using Docker Volumes
- REST API tested using Postman

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Docker
- Docker Compose

---

## Project Structure

```text
.
├── Dockerfile
├── compose.yaml
├── .dockerignore
├── .env.example
├── package.json
├── package-lock.json
├── README.md
├── index.js
└── src
    ├── app.js
    ├── db.js
    ├── repository
    │   └── taskRepository.js
    └── routes
        └── taskRoutes.js
```

---

## Prerequisites

- Docker Desktop

---

## Setup

Clone the repository

```bash
git clone <your-repository-url>
cd <repository-name>
```

Create a `.env` file (optional when using Docker Compose):

```env
DATABASE_URL=postgres://postgres:dev@db:5432/tasks
PORT=3000
```

---

## Running the Application

Build and start the application:

```bash
docker compose up --build
```

The API will be available at:

```
http://localhost:3000
```

---

## API Endpoints

### Get all tasks

```
GET /tasks
```

---

### Get task by ID

```
GET /tasks/:id
```

---

### Create a task

```
POST /tasks
```

Request Body

```json
{
  "title": "Learn Docker",
  "done": false
}
```

---

### Update a task

```
PUT /tasks/:id
```

Request Body

```json
{
  "title": "Learn Docker Compose",
  "done": true
}
```

---

### Delete a task

```
DELETE /tasks/:id
```

---

## Example Response

```json
[
  {
    "id": 1,
    "title": "Learn Docker",
    "done": false
  },
  {
    "id": 2,
    "title": "Learn PostgreSQL",
    "done": false
  }
]
```

---

## Database

The application automatically:

- Creates the `tasks` table if it does not exist.
- Inserts three sample tasks only when the table is empty.

The database data is stored in a Docker volume, so it persists even after stopping the containers.

---

## Stopping the Application

```bash
docker compose down
```

---

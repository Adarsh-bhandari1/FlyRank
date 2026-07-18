# Week 2 REST API

A simple REST API built using **Node.js**, **Express.js**, and **Swagger UI**. This project demonstrates CRUD operations with proper API documentation using OpenAPI (Swagger).

---

## Features

- RESTful API
- CRUD Operations
- Express.js Server
- Swagger API Documentation
- JSON Request & Response
- Easy to run locally

---

## Tech Stack

- Node.js
- Express.js
- Swagger UI Express
- OpenAPI 3.0

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<repository-name>.git
```

### 2. Move into the project directory

```bash
cd <repository-name>
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the server

```bash
npm start
```

The API will start on

```
http://localhost:3000
```

Swagger Documentation

```
http://localhost:3000/api-docs
```

---

# Run (One Command)

After installing dependencies:

```bash
npm start
```

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Home Route |
| GET | `/items` | Get all items |
| GET | `/items/:id` | Get item by ID |
| POST | `/items` | Create new item |
| PUT | `/items/:id` | Update an item |
| DELETE | `/items/:id` | Delete an item |

> Replace the endpoints above with your actual routes if they are different.

---

# Example Request

```bash
curl -i http://localhost:3000/items
```

### Sample Output

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 55

[
  {
    "id":1,
    "name":"Sample Item"
  }
]
```

---

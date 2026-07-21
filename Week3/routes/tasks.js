import express from "express";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../repository/taskRepo.js";

const router = express.Router();

// GET /tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await getAllTasks();
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// GET /tasks/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const task = await getTaskById(id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// POST /tasks
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        error: "Title is required",
      });
    }

    const task = await createTask(title.trim());

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, completed } = req.body;

    if (!title || title.trim() === "" || typeof completed !== "number") {
      return res.status(400).json({
        error: "Invalid request body",
      });
    }

    const task = await updateTask(id, title.trim(), completed);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const changes = await deleteTask(id);

    if (changes === 0) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;

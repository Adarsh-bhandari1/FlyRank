import express from "express";
import { getAllTasks, getTaskById } from "../repository/taskRepo.js";

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
        error: `Task ${id} not found`,
      });
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;

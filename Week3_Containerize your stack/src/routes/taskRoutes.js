import express from "express";
import { getAllTasks, getTaskById } from "../repository/taskRepository.js";

const router = express.Router();

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

router.get("/:id", async (req, res) => {
    try {
        const task = await getTaskById(req.params.id);

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

export default router;
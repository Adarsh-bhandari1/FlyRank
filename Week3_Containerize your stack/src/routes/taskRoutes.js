import express from "express";
import {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} from "../repository/taskRepository.js";

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
router.post("/", async (req, res) => {

    const { title, done = false } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    const task = await createTask(title, done);

    res.status(201).json(task);
});

router.put("/:id", async (req, res) => {

    const { title, done } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    const task = await updateTask(
        req.params.id,
        title,
        done
    );

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    res.json(task);
});

router.delete("/:id", async (req, res) => {

    const deleted = await deleteTask(req.params.id);

    if (!deleted) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    res.status(204).send();
});

export default router;
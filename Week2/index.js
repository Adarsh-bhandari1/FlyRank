import express from 'express';
const app = express();
const port = 3000;
app.use(express.json());
let tasks = [
  { id: 1, title: "Buy groceries", done: false },
  { id: 2, title: "Review notes", done: false },
  { id: 3, title: "Go to the gym" , done : false },
];

app.get('/', (req, res) => {
    res.json({
        name: "Task Api",
        version: "1.0",
        endpoints: ["/tasks"]
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: "ok"
    });
})

app.get('/tasks', (req, res) => {
    res.json(tasks);
})

app.get('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const task = tasks.find(t => t.id == id)
    if (!task) {
        return res.status(404).json({error : `Task ${id} not found`})
    }
    res.json(task);
})

app.post('/tasks', (req, res) => {
    const {title} = req.body;
    if (!title || title.trim() === '') {
        return res.status(400).json({ error: "Title required" });
    }

    const newId = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;

    const newTask = {
        id: newId,
        title: title.trim(),
        done: false
    };
    tasks.push(newTask);
    return res.status(201).json(newTask);
})
app.listen(port, () => {
    console.log(`server running on port ${port}`);
})
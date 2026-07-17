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

app.listen(port, () => {
    console.log(`server running on port ${port}`);
})
import express from 'express';
const app = express();
const port = 3000;
app.use(express.json());
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

app.listen(port, () => {
    console.log(`server running on port ${port}`);
})
import express from "express";
import dotenv from "dotenv";
import triageRouter from "./routes/triage.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use("/api", triageRouter);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

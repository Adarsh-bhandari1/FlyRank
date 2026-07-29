import { createClient } from "@supabase/supabase-js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "dotenv/config";
const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());
const superbase_url = process.env.SUPERBASE_URl;
const superbase_key = process.env.SUPERBASE_KEY;
if (!superbase_url || superbase_key) {
  console.log("Unable to connect to superbase please check the credentials!");
}

const superbase = createClient(superbase_url, superbase_key);
app.get("/", (req, res) => {
  res.json({
    message: " Server running fine!",
  });
});
app.post("/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: "Please Enter the credentials!",
    });
  }
  try {
    const { data, error } = await superbase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) {
      return res.status(400).json(error);
    }
    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: "Please Enter the credentials!",
    });
  }
  try {
    const { data, error } = await superbase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      return res.status(401).json(error);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
});

app.get("/public/info", (req, res) => {
  return res.status(200).json({
    message: "Welcome stranger! This info is public.",
  });
});
app.get("/protected/profile", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: `Access token required`,
    });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  res
    .status(200)
    .json({ message: "Token received. Verification coming in Stage 3!" });
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
  console.log(`superbase connected`);
});

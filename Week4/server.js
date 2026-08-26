import { createClient } from "@supabase/supabase-js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import "dotenv/config";
const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());
const superbase_url = process.env.SUPERBASE_URl;
const superbase_key = process.env.SUPERBASE_KEY;
if (!superbase_url || !superbase_key) {
  console.log("Unable to connect to superbase please check the credentials!");
  process.exit(1);  // Prevent runnig with undefined client
}
try {
  const swaggerDocument = YAML.load("./swagger.yaml");
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log(` Swagger UI available at http://localhost:${port}/docs`);
} catch (err) {
  console.warn(" Could not load swagger.yaml:", err.message);
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

// Constructing a middleware 
const authenticateMiddleware = async (req, res , next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required" });
  }
  const token = authHeader.split(" ")[1]; // split(' ') splits the string wherever there is a space:
  try {
    const {
      data: { user },
      error,
    } = await superbase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next(); // Proceed to the actual route handler
  }
  catch (error) {
    console.error("Auth Middleware Error!")
    return res.status(500).json({ error: "Internal Server error" });
  }
}

app.get("/protected/profile", authenticateMiddleware , (req, res) => {
  return res.status(200).json({
    id: req.user.id,
    email: req.user.email,
    created_at : req.user.created_at
  })
});

// PROOF OF REUSE: Same middleware, zero new auth logic
app.get("/protected/dashboard", authenticateMiddleware, (req, res) => {
  return res.status(200).json({
    message: `Welcome back, ${req.user.email}!`,
    dashboard_data: "Your private dashboard content here"
  });
});

app.post("/auth/logout", authenticateMiddleware, async (req, res) => {
  try {
    await superbase.auth.signOut();
    return res.status(204).send();
  } catch (error) {
    console.error("Logout error :", error);
    return res.status(500).json({
      error: "Internal Server error"
    })
  }
});


app.listen(port, () => {
  console.log(`Server running at ${port}`);
  console.log(`superbase connected`);
});

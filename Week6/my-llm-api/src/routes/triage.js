import express from "express";
import { TriageInputSchema } from "../llm/schema.js";
import { callLLM } from "../llm/client.js";

const router = express.Router();

router.post("/triage", async (req, res) => {
  if (process.env.LLM_ENABLED === "false") {
    return res.status(503).json({
      error: "LLM integration is currently disabled",
      fallback: {
        category: "other",
        urgency: "low",
        confidence: 0,
        reason: "Service temporarily unavailable",
      },
    });
  }

  const inputResult = TriageInputSchema.safeParse(req.body);
  if (!inputResult.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: inputResult.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  const { text } = inputResult.data;

  if (process.env.LLM_STUB === "1") {
    return res.json({
      category: "bug",
      urgency: "normal",
      confidence: 0.95,
      reason: "Stub response",
    });
  }


  try {
    const validatedResponse = await callLLM(text);
    res.json(validatedResponse);
  } catch (error) {
    console.error("LLM Error:", error.message);
    res.status(504).json({
      error: "LLM request timed out or failed",
      details: error.message,
    });
  }
});

export default router;

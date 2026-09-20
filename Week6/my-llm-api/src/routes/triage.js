import express from "express";
import { TriageInputSchema } from "../llm/schema.js";
import { callLLM } from "../llm/client.js";

const router = express.Router();

router.post("/triage", async (req, res) => {

  const inputResult = TriageInputSchema.safeParse(req.body);

  if (!inputResult.success) {
    // FIXED: Safely access .errors array
    const details = inputResult.error.errors
      ? inputResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      : [
          {
            field: "body",
            message: inputResult.error.message || "Invalid JSON",
          },
        ];

    return res.status(400).json({
      error: "Invalid input",
      details,
    });
  }

  const { text } = inputResult.data;

  if (process.env.LLM_STUB === "1") {
    return res.json({
      category: "bug",
      urgency: "normal",
      confidence: 0.95,
      reason: "Stub response: Validated against schema successfully.",
    });
  }

  // 3. Kill Switch Check
  if (process.env.LLM_ENABLED === "false") {
    return res.status(503).json({
      error: "LLM integration is currently disabled",
    });
  }

  try {
    const rawResponse = await callLLM(text);
    res.json({
      status: "success",
      raw_model_output: rawResponse,
    });
  } catch (error) {
    console.error("LLM Error:", error.message);
    res.status(504).json({
      error: "LLM request timed out or failed",
    });
  }
});

export default router;

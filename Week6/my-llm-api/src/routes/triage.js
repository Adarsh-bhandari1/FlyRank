import express from "express";
import { TriageInputSchema, TriageOutputSchema } from "../llm/schema.js";
const router = express.Router();

router.post("/triage", async (req, res) => {
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
    const stubResponse = {
      category: "bug",
      urgency: "normal",
      confidence: 0.95,
      reason: "Stub response: Validated against schema successfully.",
      };
      
       const validatedStub = TriageOutputSchema.parse(stubResponse);
       return res.json(validatedStub);
    }
      res.status(501).json({ error: "LLM integration not yet implemented" });

});

export default router;


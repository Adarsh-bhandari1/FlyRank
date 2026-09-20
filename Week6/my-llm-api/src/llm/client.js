import OpenAI from "openai";
import fs from "fs";
import path from "path";

export async function callLLM(text) {
  const client = new OpenAI({
    baseURL: process.env.LLM_BASE_URL,
    apiKey: process.env.LLM_API_KEY,
    timeout: 30000,
    maxRetries: 0,
  });

  const promptPath = path.join(process.cwd(), "prompts", "TriageV1.md");
  const systemPrompt = fs.readFileSync(promptPath, "utf-8");

  try {
    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.2,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("LLM call failed:", error.message);
    throw error;
  }
}

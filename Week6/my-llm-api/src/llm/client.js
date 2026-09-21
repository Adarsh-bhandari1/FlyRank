import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { TriageOutputSchema } from "./schema.js";

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

    const rawContent = completion.choices[0].message.content;
    return await parseAndValidate(rawContent, client, systemPrompt, text);
  } catch (error) {
    console.error("LLM call failed:", error.message);
    throw error;
  }
}

async function parseAndValidate(rawContent, client, systemPrompt, text) {
  try {
    let jsonStr = rawContent.trim();

    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr
        .replace(/^```[a-z]*\n?/, "")
        .replace(/```$/, "")
        .trim();
    }

    const parsed = JSON.parse(jsonStr);
    const validated = TriageOutputSchema.parse(parsed);
    return validated;
  } catch (parseError) {
    console.warn("Model returned invalid JSON. Attempting repair...");


    const repairCompletion = await client.chat.completions.create({
      model: process.env.LLM_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }, 
        { role: "assistant", content: rawContent }, 
        {
          role: "user",
          content:
            "Your previous response was not valid JSON. Please output ONLY the corrected JSON object matching the schema. Do not include any explanation.",
        },
      ],
      temperature: 0.1,
    });

    const repairedText = repairCompletion.choices[0].message.content;
    let repairedJson = repairedText.trim();

    if (repairedJson.startsWith("```")) {
      repairedJson = repairedJson 
        .replace(/^```[a-z]*\n?/, "")
        .replace(/```$/, "")
        .trim();
    }

    const repairedParsed = JSON.parse(repairedJson);
    return TriageOutputSchema.parse(repairedParsed);
  }
}

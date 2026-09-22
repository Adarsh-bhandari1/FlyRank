import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { TriageOutputSchema } from "./schema.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitWithBackoff(attempt, retryAfterHeader) {
  if (retryAfterHeader) {
    const seconds = parseInt(retryAfterHeader, 10);
    await sleep(seconds * 1000);
    return;
  }

 
  const baseDelay = Math.pow(2, attempt) * 1000;
  const jitter = Math.random() * 500;
  await sleep(baseDelay + jitter);
}

export async function callLLM(text) {

  const client = new OpenAI({
    baseURL: process.env.LLM_BASE_URL,
    apiKey: process.env.LLM_API_KEY,
    timeout: 30000,
    maxRetries: 0, 
  });

  const promptPath = path.join(process.cwd(), "prompts", "TriageV1.md");
  const systemPrompt = fs.readFileSync(promptPath, "utf-8");

  let lastError;

  for (let attempt = 0; attempt < 3; attempt++) {
    const startTime = Date.now();

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
      const duration = Date.now() - startTime;

      console.log(
        JSON.stringify({
          event: "llm_call_success",
          prompt_version: "TriageV1",
          model: process.env.LLM_MODEL,
          input_tokens: completion.usage?.prompt_tokens || 0,
          output_tokens: completion.usage?.completion_tokens || 0,
          duration_ms: duration,
          repair_needed: false,
          timestamp: new Date().toISOString(),
        }),
      );

      return await parseAndValidate(rawContent, client, systemPrompt, text);
    } catch (error) {
      lastError = error;
      const duration = Date.now() - startTime;

      const status = error.status || error.response?.status;

      // NEVER retry on 400, 401, 403 — bad request/key won't fix itself
      if ([400, 401, 403].includes(status)) {
        console.error(`Non-retryable error ${status}: ${error.message}`);
        throw error;
      }

      const isRetryable =
        error.code === "ETIMEDOUT" ||
        error.code === "ECONNABORTED" ||
        status === 429 ||
        (status >= 500 && status < 600);

      if (!isRetryable || attempt === 2) {
        console.log(
          JSON.stringify({
            event: "llm_call_failed",
            error: error.message,
            status: status,
            duration_ms: duration,
            timestamp: new Date().toISOString(),
          }),
        );
        throw error;
      }

      const retryAfter =
        error.headers?.["retry-after"] ||
        error.response?.headers?.["retry-after"];
      console.warn(
        `Retry ${attempt + 1}/2 after ${retryAfter || "backoff"}...`,
      );
      await waitWithBackoff(attempt, retryAfter);
    }
  }

  throw lastError;
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
    const validated = TriageOutputSchema.parse(repairedParsed);

    console.log(
      JSON.stringify({
        event: "llm_repair_success",
        prompt_version: "TriageV1",
        model: process.env.LLM_MODEL,
        input_tokens: repairCompletion.usage?.prompt_tokens || 0,
        output_tokens: repairCompletion.usage?.completion_tokens || 0,
        repair_needed: true,
        timestamp: new Date().toISOString(),
      }),
    );

    return validated;
  }
}

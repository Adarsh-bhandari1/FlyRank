import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
});

async function main() {
  try {
    const res = await client.chat.completions.create({
      model: process.env.LLM_MODEL,
      messages: [
        { role: 'user', content: 'Reply with exactly the word: ready' }
      ],
    });

    console.log('Model Response:', res.choices[0].message.content);
  } catch (error) {
    console.error('Error connecting to LLM:', error.message);
  }
}

main();
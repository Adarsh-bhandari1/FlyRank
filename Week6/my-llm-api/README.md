# LLM Support Triage API

Automatically classifies customer support messages into categories (billing, bug, feature, other) with urgency levels. Built for production reliability with 30s timeouts, smart exponential backoff retries, Zod output validation, and structured cost logging. A non-programmer can send a message like "My app keeps crashing" and instantly receive a structured triage decision without human intervention.

## Quick Start

### Prerequisites
-   Node.js v18+ installed
-   **Ollama** running locally (Free, no API key needed)
    -   Download: https://ollama.com
    -   Pull model: `ollama pull gemma3:1b`

### Launch Instructions
1.  Clone and install dependencies:
    ```bash
    git clone <your-repo-url>
    cd my-llm-api
    npm install
    ```
2.  Configure environment:
    ```bash
    cp .env.example .env
    # Edit .env if your Ollama port differs from default
    ```
3.  Start the server:
    ```bash
    node src/app.js
    ```
4.  Test the endpoint:
    ```bash
    curl -X POST http://localhost:3000/api/triage \
      -H "Content-Type: application/json" \
      -d '{"text": "My app keeps crashing when I save"}'
    ```

**Exact Response:**
```json
{
  "category": "bug",
  "urgency": "high",
  "confidence": 0.95,
  "reason": "User reports application crash during save operation."
}
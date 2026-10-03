# AI Workflow Builder

A visual no-code platform for designing and executing AI-powered decision workflows. Build complex branching logic using a drag-and-drop canvas where each node represents an intelligent decision step (YES/NO) powered by LLMs.

## Key Features

-   **Visual Flow Editor:** Drag-and-drop interface built with React Flow for intuitive workflow design
-   **AI Decision Nodes:** Each node sends prompts to OpenAI/GPT models for binary YES/NO reasoning
-   **Reliable Execution:** Orchestrated via Inngest for fault-tolerant, step-by-step background processing
-   **Real-Time Visualization:** Live execution tracking with active node highlighting and auto-scrolling logs
-   **Portable Workflows:** JSON export/import for sharing and version controlling workflow definitions
-   **Persistent State:** LocalStorage-based save/load with Zustand state management

## Tech Stack

| Category | Technology |
| :--- | :--- |
| Frontend | Next.js 14 (App Router), React Flow, Tailwind CSS, Shadcn UI |
| State Management | Zustand |
| Backend / Orchestration | Inngest (Serverless Functions) |
| AI / LLM | OpenAI SDK (GPT-4o-mini) |
| Language | JavaScript (ES6+) |
| Tooling | Vite, ESLint, Lucide Icons |

## Getting Started

### Prerequisites

-   Node.js 18+
-   npm or yarn
-   OpenAI API Key (or OpenRouter key for free tier)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/yourusername/ai-workflow-builder.git
    cd ai-workflow-builder
    ```

2.  Install dependencies:

    ```bash
    npm install
    npx shadcn@latest add scroll-area button card input textarea dialog toast separator badge
    ```

3.  Set up environment variables:
    Create a `.env.local` file in the root directory:

    ```env
    OPENAI_API_KEY=sk-your-api-key-here
    # Optional: For local Inngest development
    INNGEST_EVENT_KEY=your-event-key
    INNGEST_SIGNING_KEY=your-signing-key
    ```

4.  Start the development servers:

    ```bash
    # Terminal 1: Frontend
    npm run dev

    # Terminal 2: Inngest Dev Server
    npm run inngest:dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Architecture

```text
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/inngest/      # Inngest webhook endpoint
│   └── page.js           # Main workflow editor
├── components/
│   ├── flow/             # React Flow custom nodes, edges, editor
│   ├── panels/           # Config panel & execution log panel
│   └── ui/               # Shadcn UI primitives
├── lib/
│   ├── inngest/          # Inngest client & workflow functions
│   ── openai.js         # OpenAI SDK configuration
└── store/                # Zustand global state management# AI Workflow Builder

A visual no-code platform for designing and executing AI-powered decision workflows. Build complex branching logic using a drag-and-drop canvas where each node represents an intelligent decision step (YES/NO) powered by LLMs.

## Key Features

-   **Visual Flow Editor:** Drag-and-drop interface built with React Flow for intuitive workflow design
-   **AI Decision Nodes:** Each node sends prompts to OpenAI/GPT models for binary YES/NO reasoning
-   **Reliable Execution:** Orchestrated via Inngest for fault-tolerant, step-by-step background processing
-   **Real-Time Visualization:** Live execution tracking with active node highlighting and auto-scrolling logs
-   **Portable Workflows:** JSON export/import for sharing and version controlling workflow definitions
-   **Persistent State:** LocalStorage-based save/load with Zustand state management

## Tech Stack

| Category | Technology |
| :--- | :--- |
| Frontend | Next.js 14 (App Router), React Flow, Tailwind CSS, Shadcn UI |
| State Management | Zustand |
| Backend / Orchestration | Inngest (Serverless Functions) |
| AI / LLM | OpenAI SDK (GPT-4o-mini) |
| Language | JavaScript (ES6+) |
| Tooling | Vite, ESLint, Lucide Icons |

## Getting Started

### Prerequisites

-   Node.js 18+
-   npm or yarn
-   OpenAI API Key (or OpenRouter key for free tier)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/yourusername/ai-workflow-builder.git
    cd ai-workflow-builder
    ```

2.  Install dependencies:

    ```bash
    npm install
    npx shadcn@latest add scroll-area button card input textarea dialog toast separator badge
    ```

3.  Set up environment variables:
    Create a `.env.local` file in the root directory:

    ```env
    OPENAI_API_KEY=sk-your-api-key-here
    # Optional: For local Inngest development
    INNGEST_EVENT_KEY=your-event-key
    INNGEST_SIGNING_KEY=your-signing-key
    ```

4.  Start the development servers:

    ```bash
    # Terminal 1: Frontend
    npm run dev

    # Terminal 2: Inngest Dev Server
    npm run inngest:dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Architecture

```text
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/inngest/      # Inngest webhook endpoint
│   └── page.js           # Main workflow editor
├── components/
│   ├── flow/             # React Flow custom nodes, edges, editor
│   ├── panels/           # Config panel & execution log panel
│   └── ui/               # Shadcn UI primitives
├── lib/
│   ├── inngest/          # Inngest client & workflow functions
│   ── openai.js         # OpenAI SDK configuration
└── store/                # Zustand global state management
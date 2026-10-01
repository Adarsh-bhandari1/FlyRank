import { openai } from "@/lib/openai";
import { inngest } from "./client";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-ai-workflow" },
  { event: "workflow/execute" },
  async ({ event, step }) => {
    const { nodes, edges } = event.data;

    const targetIds = new Set(edges.map((e) => e.target));
    let currentNode = nodes.find((n) => !targetIds.has(n.id));

    if (!currentNode) {
      throw new Error("No root node found in workflow");
    }

    const executionLog = [];
    let stepsTaken = 0;
    const MAX_STEPS = 20; // Prevent infinite loops

    
    while (currentNode && stepsTaken < MAX_STEPS) {
      stepsTaken++;

      // Log current step
      await step.run(`log-step-${stepsTaken}`, async () => {
        executionLog.push({
          nodeId: currentNode.id,
          label: currentNode.data.label,
          prompt: currentNode.data.prompt,
          timestamp: new Date().toISOString(),
        });
      });


      const aiResponse = await step.run(
        `ai-decision-${currentNode.id}`,
        async () => {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a binary decision engine. Analyze the prompt and context. You MUST respond with ONLY 'YES' or 'NO'. Do not explain.",
              },
              { role: "user", content: currentNode.data.prompt },
            ],
            temperature: 0, 
          });

          const content = completion.choices[0].message.content
            .trim()
            .toUpperCase();
          return content === "YES" ? "YES" : "NO";
        },
      );


      const nextEdge = edges.find(
        (e) =>
          e.source === currentNode.id &&
          e.type.toLowerCase() === aiResponse.toLowerCase(),
      );

      if (!nextEdge) {
        await step.run(`log-end-${stepsTaken}`, async () => {
          executionLog.push({
            type: "END",
            message: `Workflow ended at '${currentNode.data.label}'. No ${aiResponse} edge found.`,
          });
        });
          break;
      }


      currentNode = nodes.find((n) => n.id === nextEdge.target);
    }

    return {
      success: true,
      stepsTaken,
      log: executionLog,
    };
  },
);

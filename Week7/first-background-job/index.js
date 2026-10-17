import express from "express";
import { Inngest } from "inngest";
import { serve } from "inngest/express";

const app = express();
app.use(express.json());

const inngest = new Inngest({ id: "report-api" });

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const sayHello = inngest.createFunction(
  {
    id: "say-hello",
    triggers: [{ event: "test/hello" }],
  },
  async ({ step }) => {
    await step.sleep("wait-a-bit", "5s");
    return "Hello from the background!";
  },
);

app.use("/api/inngest", serve({ client: inngest, functions: [sayHello] }));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

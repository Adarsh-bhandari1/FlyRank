import express from "express";
import { Inngest } from "inngest";
import { serve } from "inngest/express";
import { randomUUID } from "crypto";

const app = express();
app.use(express.json());

const inngest = new Inngest({ id: "report-api" });

const reports = new Map();

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

const makeReport = inngest.createFunction(
  {
    id: "make-report",
    retries: 2,
    triggers: [{ event: "report/requested" }],
  },
  async ({ event, step }) => {
    const { id, topic } = event.data;

    await step.sleep("do-the-slow-work", "8s");

    const result = await step.run("build-report", () => {
      if (topic === "fail") {
        throw new Error("The report oven is broken!");
      }
      return `Report successfully generated for topic: ${topic}`;
    });

    const current = reports.get(id);
    if (current) {
      current.status = "done";
      current.result = result;
    }
  },
);

const heartbeat = inngest.createFunction(
  {
    id: "heartbeat",
    triggers: [{ cron: "* * * * *" }], // Every minute
  },
  async ({ step }) => {
    await step.run("log-summary", () => {
      let pending = 0,
        done = 0,
        failed = 0;

      for (const r of reports.values()) {
        if (r.status === "pending") pending++;
        else if (r.status === "done") done++;
        else failed++;
      }

      console.log(
        `[Heartbeat] Summary: ${pending} pending, ${done} done, ${failed} failed`,
      );
    });
  },
);

app.post("/reports", (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Missing topic in request body" });
  }

  const id = randomUUID();

  reports.set(id, { id, topic, status: "pending" });

  inngest.send({ name: "report/requested", data: { id, topic } });

  res.status(202).json({ id, status: "pending" });
});

app.get("/reports/:id", (req, res) => {
  const report = reports.get(req.params.id);
  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }
  res.json(report);
});

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [sayHello, makeReport, heartbeat],
  }),
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

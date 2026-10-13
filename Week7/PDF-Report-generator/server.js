import express from "express";
import { v4 as uuidv4 } from "uuid";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getReportData,
  saveReportRecord,
  getReportById,
  getReportForToday,
} from "./db.js";
import { generatePDF } from "./render.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPORTS_DIR = join(__dirname, "reports");
const app = express();
const port = 3000;
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.get("/reports/:id", async (req, res) => {
  const report = getReportById(req.params.id);

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  res.json({
    id: report.id,
    path: report.path,
    created_at: report.created_at,
    file: `/reports/${report.id}/file`,
  });
});

app.get("/reports/:id/file", (req, res) => {
  const report = getReportById(req.params.id);

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  res.sendFile(report.path);
});

app.post("/reports", async (req, res) => {
  try {
    const force = req.body?.force === true;
    if (!force) {
      const existing = getReportForToday();
      if (existing) {
        console.log(
          `[POST /reports] Returning existing report ${existing.id} (idempotent)`,
        );
        return res.status(200).json({
          id: existing.id,
          file: `/reports/${existing.id}/file`,
          message: "Report already generated today",
        });
      }
    }

    const id = uuidv4();
    const pdfPath = join(REPORTS_DIR, `${id}.pdf`);
    console.log(`[POST /reports] Generating new report ${id}...`);
    const reportData = getReportData();
    await generatePDF(reportData, pdfPath);
    const report = saveReportRecord(id, pdfPath);
    console.log(`[POST /reports] New report ${id} generated successfully`);
    res.status(201).json({
      id: report.id,
      file: `/reports/${report.id}/file`,
    });
  } catch (error) {
    console.error("[POST /reports] Failed:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

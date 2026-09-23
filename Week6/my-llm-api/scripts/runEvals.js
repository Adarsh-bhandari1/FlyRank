import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cases = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../evals/cases.json"), "utf-8"),
);

const BASE_URL = process.env.EVAL_BASE_URL || "http://localhost:3000";

(async () => {
  let passed = 0;
  const failures = [];

  console.log(`🏃 Running ${cases.length} eval cases against ${BASE_URL}...\n`);

  for (const testCase of cases) {
    try {
      const res = await fetch(`${BASE_URL}/api/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testCase.input }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const categoryMatch = data.category === testCase.expected.category;
      const urgencyMatch = data.urgency === testCase.expected.urgency;

      if (categoryMatch && urgencyMatch) {
        passed++;
        console.log(` Case ${testCase.id}: PASS`);
      } else {
        failures.push({
          id: testCase.id,
          input: testCase.input,
          expected: testCase.expected,
          actual: { category: data.category, urgency: data.urgency },
        });
        console.log(` Case ${testCase.id}: FAIL`);
      }
    } catch (err) {
      failures.push({ id: testCase.id, error: err.message });
      console.log(` Case ${testCase.id}: ERROR - ${err.message}`);
    }
  }

  const score = Math.round((passed / cases.length) * 100);
  console.log(` Results: ${passed}/${cases.length} passed (${score}%)`);

  if (failures.length > 0) {
    console.log("Failures:");
    failures.forEach((f) =>
      console.log(
        `  Case ${f.id}: Expected ${JSON.stringify(f.expected)}, Got ${JSON.stringify(f.actual)}`,
      ),
    );
  }

  process.exit(failures.length > 0 ? 1 : 0);
})();

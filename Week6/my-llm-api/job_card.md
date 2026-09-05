# Job Card
**What it does:** Classifies support messages for routing.
**Input:** `{"text": "string, 1-2000 characters"}`
**Output:** 
{
  "category": "billing" | "bug" | "feature" | "other",
  "urgency": "low" | "normal" | "high",
  "confidence": 0.0-1.0,
  "reason": "one short sentence"
}
**Must never:** Invent categories, return free text, give advice.
**When unsure:** Return category "other" with low confidence.
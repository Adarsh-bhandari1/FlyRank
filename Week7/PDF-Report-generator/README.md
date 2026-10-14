# PDF Report Generator

A backend service that queries a SQLite database, aggregates sales data, and generates a professional PDF report using Playwright. Built with Node.js 22+ and Express 5.

##  Features
- **SQL Aggregation**: Turns 200 raw orders into 4 meaningful metrics.
- **PDF Rendering**: Uses headless Chromium to convert HTML templates into print-ready PDFs.
- **Artifact Handling**: Implements "Store and Link" pattern; JSON responses stay tiny while files live on disk.
- **Idempotency**: Prevents duplicate generation when users double-click "Generate".

##  Tech Stack
- **Runtime**: Node.js 22+ (ESM)
- **Framework**: Express 5
- **Database**: SQLite (`node:sqlite`)
- **PDF Engine**: Playwright (Chromium)

##  Installation & Setup

1. **Clone & Install**
   ```bash
   git clone <your-repo-url>
   cd pdf-report-generator
   npm install
   npx playwright install chromium
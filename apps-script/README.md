# Application intake — Google Apps Script

`Code.gs` is the backend for the application portal at `/apply`. It receives a
JSON POST from the site, saves the applicant's resume to Google Drive, and
appends a row to the responses spreadsheet.

This file is **not deployed automatically**. Pushing to `main` deploys the site
via Vercel, but the Apps Script has to be updated by hand in the Apps Script
editor.

## Why the script must be updated

The currently deployed script writes five columns (`submittedAt`, `fullName`,
`email`, `year`, `interested`). The application portal sends more fields —
`school`, `experience`, `whyInterested`, `themedAnswer`, and the resume itself.
Until the script in this directory is deployed, those extra fields arrive in the
request and are silently discarded, and no resume is ever saved.

## Column layout

The existing sheet has no header row, and its five interest-form rows use the
order below. Columns A–E keep that exact order and meaning so those rows stay
aligned; everything new is appended in F–L.

| Col | Field | Source |
| --- | --- | --- |
| A | Submitted At | `submittedAt` |
| B | Full Name | `fullName` |
| C | Email | `email` |
| D | Year | `year` |
| E | Interested | `interested` (always `Yes` for an application) |
| F | School | `school` |
| G | Experience | `experience` |
| H | Why Interested | `whyInterested` |
| I | Themed Question | `themedQuestion` |
| J | Themed Answer | `themedAnswer` |
| K | Resume Link | Drive URL of the uploaded file |
| L | Resume Filename | Original filename as uploaded |

The five pre-existing rows keep empty cells in F–L. No header row is inserted,
since adding one would shift every existing row down.

Resumes are stored in a Drive folder named **GQH 2026 Resumes**, created on the
first submission. The file is never written into a cell — a base64-encoded PDF
exceeds the 50,000-character limit of a Google Sheets cell.

## Project type

This is a **standalone** Apps Script project, not one bound to the spreadsheet.
It reaches the sheet via `SpreadsheetApp.openById(SPREADSHEET_ID)`, matching
what the original interest-form script did. `getActiveSpreadsheet()` returns
null in a standalone project and must not be used here.

If the spreadsheet is ever replaced, update `SPREADSHEET_ID` at the top of
`Code.gs`.

## Deploying an update

1. Open the Apps Script project (script.google.com → the project).
2. Replace the contents of `Code.gs` with this repo's `apps-script/Code.gs`, save.
3. **Deploy → Manage deployments** → select the active deployment → pencil icon.
4. Set **Version** to *New version*, then **Deploy**.
5. Re-authorize when prompted. Drive access is new to this version, so the
   consent screen asks for it even though the script was authorized before.

The `/exec` URL does not change between versions, so
`VITE_INTEREST_FORM_WEBHOOK_URL` in `.env` and in the Vercel project settings
needs no update.

## A note on testing the endpoint with curl

A plain `curl` against the `/exec` URL returns **HTTP 403** and Google's "You
need access" page. This is expected and does **not** mean the endpoint is
broken — the deployment is reachable from browsers, which is how the interest
form successfully collected its existing responses. Don't use a curl 403 as
evidence of a misconfigured deployment.

## Verifying a deploy

Submit a test application from `/apply` and confirm a new row appears with a
working link in the **Resume Link** column. Execution errors show up under
**Executions** in the Apps Script editor.

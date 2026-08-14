/**
 * Gator Quant Hacks — application intake.
 *
 * Receives JSON from the site's application portal at /apply, saves the
 * applicant's resume to Google Drive, and appends one row per applicant to the
 * bound spreadsheet.
 *
 * Column layout is dictated by the rows the older interest form already wrote:
 *
 *   A  Submitted At      (existing)
 *   B  Full Name         (existing)
 *   C  Email             (existing)
 *   D  Year              (existing)
 *   E  Interested        (existing — always "Yes" for an application)
 *   F  School            (new)
 *   G  Experience        (new)
 *   H  Why Interested    (new)
 *   I  Themed Question   (new)
 *   J  Themed Answer     (new)
 *   K  Resume Link       (new)
 *   L  Resume Filename   (new)
 *
 * Columns A–E keep their original order and meaning so the five interest-form
 * rows already in the sheet stay correctly aligned. Those older rows simply
 * have empty cells in F–L. No header row is inserted, because the existing
 * sheet does not have one and adding it would shift every existing row down.
 *
 * Deploying an update (the /exec URL stays the same, so nothing in the site's
 * .env or the Vercel environment needs to change):
 *   1. Open the Apps Script project attached to the responses spreadsheet.
 *   2. Replace the contents of Code.gs with this file and save.
 *   3. Deploy → Manage deployments → the active deployment → pencil icon →
 *      Version: "New version" → Deploy.
 *   4. Re-authorize when prompted; Drive access is new and requires consent.
 */

// The script is standalone (not bound to the spreadsheet), so the target sheet
// is opened by ID rather than via getActiveSpreadsheet().
var SPREADSHEET_ID = '1PugyxDLcyLrUeDoUhoVlTXN8z5HlkZsuOeqJfLx3uPk';

// Resumes are written to this Drive folder, created on the first submission.
var RESUME_FOLDER_NAME = 'GQH 2026 Resumes';

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var resume = saveResume_(payload);

    getSheet_().appendRow([
      payload.submittedAt || new Date().toISOString(),
      payload.fullName || '',
      payload.email || '',
      payload.year || '',
      payload.interested || 'Yes',
      payload.school || '',
      payload.experience || '',
      payload.whyInterested || '',
      payload.themedQuestion || '',
      payload.themedAnswer || '',
      resume.url,
      resume.filename,
    ]);

    return jsonResponse_({ ok: true });
  } catch (error) {
    // Log so failures are visible in the Apps Script execution history rather
    // than disappearing into an opaque no-cors response on the client.
    console.error(error);
    return jsonResponse_({ ok: false, error: String(error) });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, message: 'GQH application endpoint is live.' });
}

/**
 * Matches what the original interest-form script did: open the spreadsheet by
 * ID and use its active sheet, so applications land alongside the existing
 * rows. getActiveSpreadsheet() is not usable here — this project is standalone,
 * not container-bound, so it would return null.
 */
function getSheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
}

/**
 * Decodes the base64 resume into a real Drive file and returns a link to it.
 * Base64 is never written into a cell: Sheets caps a cell at 50,000
 * characters, which even a modest PDF exceeds once encoded.
 */
function saveResume_(payload) {
  if (!payload.resumeBase64) {
    return { url: '', filename: '' };
  }

  var mimeType = payload.resumeMimeType || 'application/octet-stream';
  var filename = payload.resumeFilename || 'resume';
  var applicant = (payload.fullName || 'applicant').replace(/[^\w\s.-]/g, '').trim();

  var blob = Utilities.newBlob(
    Utilities.base64Decode(payload.resumeBase64),
    mimeType,
    applicant + ' - ' + filename
  );

  var file = getResumeFolder_().createFile(blob);

  return { url: file.getUrl(), filename: filename };
}

function getResumeFolder_() {
  var existing = DriveApp.getFoldersByName(RESUME_FOLDER_NAME);
  return existing.hasNext() ? existing.next() : DriveApp.createFolder(RESUME_FOLDER_NAME);
}

function jsonResponse_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON
  );
}

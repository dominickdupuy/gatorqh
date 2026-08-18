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
 *   4. Re-authorize when prompted; Drive and Mail access require consent.
 *
 * Note that anonymous web app executions do not appear in the editor's
 * Executions list, so a failing doPost cannot be diagnosed there. The GET
 * probes documented on doGet() below report mail quota and send outcomes
 * directly in the HTTP response instead.
 */

// The script is standalone (not bound to the spreadsheet), so the target sheet
// is opened by ID rather than via getActiveSpreadsheet().
var SPREADSHEET_ID = '1PugyxDLcyLrUeDoUhoVlTXN8z5HlkZsuOeqJfLx3uPk';

// Resumes are written to this Drive folder, created on the first submission.
var RESUME_FOLDER_NAME = 'GQH 2026 Resumes';

// Included in the confirmation email sent to every applicant. Keep this in
// sync with DISCORD_INVITE_URL in src/app/components/ApplicationForm.tsx.
var DISCORD_INVITE_URL = 'https://discord.gg/PhEnUQXCp';

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheet = getSheet_();

    // The site retries with an opaque no-cors POST when the browser refuses to
    // expose the first response, so the same submission can arrive twice with
    // an identical (email, submittedAt) pair. Drop the second copy before it
    // writes a duplicate row and resume.
    if (isDuplicate_(sheet, payload)) {
      return jsonResponse_({ ok: true, deduped: true });
    }

    var resume = saveResume_(payload);

    sheet.appendRow([
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

    var mail = sendConfirmationEmail_(payload);

    // The mail result rides along in the response body. The site ignores it,
    // but it makes a failed send visible to a direct curl of /exec without
    // needing the execution log, which does not record anonymous web app runs.
    return jsonResponse_({ ok: true, mail: mail });
  } catch (error) {
    // Log so failures are visible in the Apps Script execution history rather
    // than disappearing into an opaque no-cors response on the client.
    console.error(error);
    return jsonResponse_({ ok: false, error: String(error) });
  }
}

/**
 * GET /exec            -> liveness probe
 * GET /exec?diag=1     -> mail quota and effective user, for debugging a
 *                         confirmation email that never arrives
 * GET /exec?testmail=you@example.com
 *                      -> sends one real confirmation email and reports the
 *                         outcome, exercising the exact same code path a
 *                         submission uses
 */
function doGet(e) {
  var params = (e && e.parameter) || {};

  if (params.diag) {
    return jsonResponse_({
      ok: true,
      remainingDailyEmailQuota: MailApp.getRemainingDailyQuota(),
      effectiveUser: Session.getEffectiveUser().getEmail(),
    });
  }

  if (params.testmail) {
    var result = sendConfirmationEmail_({
      email: params.testmail,
      fullName: 'Mail Probe',
    });
    return jsonResponse_({ ok: true, mail: result });
  }

  return jsonResponse_({ ok: true, message: 'GQH application endpoint is live.' });
}

/**
 * True when a row with the same email (column C) and submittedAt (column A)
 * already exists among the most recent rows. Sheets may parse the ISO
 * timestamp into a Date, so both representations are compared.
 */
function isDuplicate_(sheet, payload) {
  var email = (payload.email || '').trim();
  var submittedAt = payload.submittedAt || '';
  if (!email || !submittedAt) return false;

  var lastRow = sheet.getLastRow();
  if (lastRow < 1) return false;

  var start = Math.max(1, lastRow - 19);
  var rows = sheet.getRange(start, 1, lastRow - start + 1, 3).getValues();
  var submittedMs = new Date(submittedAt).getTime();

  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][2]).trim() !== email) continue;
    var cell = rows[i][0];
    var cellMs = cell instanceof Date ? cell.getTime() : new Date(String(cell)).getTime();
    if (String(cell) === submittedAt || (!isNaN(cellMs) && cellMs === submittedMs)) {
      return true;
    }
  }
  return false;
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

/**
 * Confirmation email with the Discord invite, sent to every applicant right
 * after their row is written. Failures are logged but never fail the
 * submission — the row and resume are already saved at this point.
 *
 * Sent from the Google account that owns this script's deployment. MailApp on
 * a consumer Gmail account is capped at ~100 recipients/day; check remaining
 * quota with MailApp.getRemainingDailyQuota() if volume gets close.
 */
function sendConfirmationEmail_(payload) {
  var email = (payload.email || '').trim();
  if (!email || email.indexOf('@') === -1) {
    return { sent: false, reason: 'no valid email on payload' };
  }

  var firstName = (payload.fullName || '').trim().split(/\s+/)[0] || 'there';

  try {
    MailApp.sendEmail({
      to: email,
      subject: 'Gator Quant Hacks — application received',
      name: 'Gator Quant Hacks',
      body:
        'Hi ' + firstName + ',\n\n' +
        'Your application to Gator Quant Hacks (October 2–4, 2026) has been received.\n' +
        'We review on a rolling basis and will follow up with your decision and prep\n' +
        'resources before the event.\n\n' +
        'In the meantime, join our Discord — announcements, team-matching, and updates\n' +
        'all happen there:\n\n' +
        DISCORD_INVITE_URL + '\n\n' +
        'See you in the arena,\n' +
        'The Gator Quant Hacks Team\n' +
        'https://gqhacks.com',
    });
    return { sent: true, to: email };
  } catch (error) {
    console.error('Confirmation email failed for ' + email + ': ' + error);
    return { sent: false, to: email, reason: String(error) };
  }
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

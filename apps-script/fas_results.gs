const SHEET_NAME = "fas_results";
const SECRET_TOKEN = "berocca2024xyz";
const TIMEZONE = "Asia/Ho_Chi_Minh";

const HEADERS = [
  "timestamp",
  "userid",
  "Total_scorce",
  "Câu 1",
  "Câu 2",
  "Câu 3",
  "Câu 4",
  "Câu 5",
  "Câu 6",
  "Câu 7",
  "Câu 8",
  "Câu 9",
  "Câu 10",
  "result_level",
  "ageGroup",
  "gender",
  "jobGroup",
  "workNature",
  "question_open"
];

// Cột demographic (0-based index tương ứng với HEADERS)
const DEMO_FIELDS = {
  ageGroup:      14,
  gender:        15,
  jobGroup:      16,
  workNature:    17,
  question_open: 18
};

// Alias key từ client → field name chuẩn
const FIELD_ALIASES = {
  ageGroup:      ["ageGroup", "age_group"],
  gender:        ["gender"],
  jobGroup:      ["jobGroup", "job_type"],
  workNature:    ["workNature", "work_nature"],
  question_open: ["question_open", "questionOpen"]
};

// ─── ENTRY POINTS ────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return buildResponse({ success: false, error: "Empty request body" });
    }

    const payload = JSON.parse(e.postData.contents);

    if (payload.token !== SECRET_TOKEN) {
      return buildResponse({ success: false, error: "Unauthorized" });
    }

    const action = (payload.action || "create").toLowerCase();

    if (action === "update") {
      return handleUpdate_(payload);
    }

    return handleCreate_(payload);

  } catch (err) {
    return buildResponse({ success: false, error: err.message || String(err) });
  }
}

function doGet() {
  return buildResponse({ status: "FAS Quiz API is running" });
}

// ─── PHASE 1: TẠO DÒNG MỚI VỚI KẾT QUẢ QUIZ ────────────────────────────────

function handleCreate_(payload) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet_(ss, SHEET_NAME);

  migrateLegacySheet_(sheet);
  ensureHeaders_(sheet);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const userId  = nextUserId_(sheet);
    const answers = extractAnswers_(payload);

    const row = [
      formatTimestamp_(payload.timestamp),  // timestamp
      userId,                                // userid
      getTotalScore_(payload),               // Total_scorce
      answers[0],                            // Câu 1
      answers[1],                            // Câu 2
      answers[2],                            // Câu 3
      answers[3],                            // Câu 4
      answers[4],                            // Câu 5
      answers[5],                            // Câu 6
      answers[6],                            // Câu 7
      answers[7],                            // Câu 8
      answers[8],                            // Câu 9
      answers[9],                            // Câu 10
      getResultLevel_(payload),              // result_level
      "",                                    // ageGroup      ← để trống, Phase 2 sẽ fill
      "",                                    // gender
      "",                                    // jobGroup
      "",                                    // workNature
      ""                                     // question_open
    ];

    sheet.appendRow(row);

    return buildResponse({ success: true, userId: userId });

  } finally {
    lock.releaseLock();
  }
}

// ─── PHASE 2: CẬP NHẬT DEMOGRAPHIC VÀO ĐÚNG DÒNG ───────────────────────────

function handleUpdate_(payload) {
  const userId = payload.userId;

  if (!userId) {
    return buildResponse({ success: false, error: "Missing userId" });
  }

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    return buildResponse({ success: false, error: "Sheet not found" });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const rowIndex = findRowByUserId_(sheet, userId);

    if (!rowIndex) {
      return buildResponse({ success: false, error: "userId not found: " + userId });
    }

    // Patch từng cột demographic — không đụng vào cột quiz
    for (const field in DEMO_FIELDS) {
      const colIndex = DEMO_FIELDS[field];          // 0-based
      const aliases  = FIELD_ALIASES[field] || [field];
      const value    = getValue_(payload, aliases);
      sheet.getRange(rowIndex, colIndex + 1).setValue(value);  // +1 → 1-based
    }

    return buildResponse({ success: true });

  } finally {
    lock.releaseLock();
  }
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

// Xoá cột session_id cũ nếu còn tồn tại
function migrateLegacySheet_(sheet) {
  if (sheet.getLastRow() < 1) return;

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  const sessionIndex = headers.indexOf("session_id");
  if (sessionIndex >= 0) {
    sheet.deleteColumn(sessionIndex + 1);
  }
}

function ensureHeaders_(sheet) {
  const lastCol = Math.max(sheet.getLastColumn(), HEADERS.length);
  const currentHeaders = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, lastCol).getValues()[0]
    : [];

  const same = HEADERS.every(function(h, i) { return currentHeaders[i] === h; });

  if (!same) {
    const range = sheet.getRange(1, 1, 1, HEADERS.length);
    range.setValues([HEADERS]);
    range
      .setBackground("#F5A623")
      .setFontColor("#ffffff")
      .setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

// Tìm số dòng (1-based) theo userId — tìm trong cột B (index 2)
function findRowByUserId_(sheet, userId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const ids = sheet
    .getRange(2, 2, lastRow - 1, 1)
    .getValues()
    .flat();

  const idx = ids.indexOf(userId);
  return idx >= 0 ? idx + 2 : null;  // +2: dòng 1 là header, indexOf trả 0-based
}

// Tạo UUID ngẫu nhiên, đảm bảo không trùng
function nextUserId_(sheet) {
  const lastRow = sheet.getLastRow();
  const existingIds = lastRow > 1
    ? sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat()
    : [];

  var userId;
  do {
    userId = Utilities.getUuid();
  } while (existingIds.indexOf(userId) >= 0);

  return userId;
}

function formatTimestamp_(isoString) {
  var date = isoString ? new Date(isoString) : new Date();
  return Utilities.formatDate(date, TIMEZONE, "dd/MM/yyyy HH:mm:ss");
}

function getTotalScore_(payload) {
  return payload.total_score !== undefined ? payload.total_score :
         payload.score       !== undefined ? payload.score       : "";
}

function getResultLevel_(payload) {
  if (payload.result_level)   return String(payload.result_level).trim();
  if (payload.result_summary) return String(payload.result_summary).trim();

  var total = Number(getTotalScore_(payload) || 0);
  if (total >= 10 && total <= 21) return "VẪN ỔN - CHƯA GỒNG";
  if (total >= 22 && total <= 34) return "GỒNG THẤY RÕ";
  if (total >= 35)                return "GỒNG QUÁ MỨC";
  return "";
}

// Trích xuất câu trả lời q1–q10, fallback sang mảng answers[]
function extractAnswers_(payload) {
  var fallback = Array.isArray(payload.answers) ? payload.answers : [];
  var result   = [];

  for (var i = 1; i <= 10; i++) {
    var fromKey      = valueOrEmpty_(payload["q" + i]);
    var fromFallback = valueOrEmpty_(fallback[i - 1]);
    result.push(fromKey || fromFallback);
  }

  return result;
}

// Tìm giá trị đầu tiên có trong payload theo danh sách alias key
function getValue_(payload, keys) {
  for (var i = 0; i < keys.length; i++) {
    var val = payload[keys[i]];
    if (val !== null && val !== undefined && String(val).trim() !== "") {
      return String(val).trim();
    }
  }
  return "";
}

function valueOrEmpty_(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}
const SHEET_NAME = "fas_results";
const SECRET_TOKEN = "berocca2024xyz";
const TIMEZONE = "Asia/Ho_Chi_Minh";
const CACHE_TTL_SECONDS = 21600;

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
  "question_open",
  "submission_id"
];

const USER_ID_INDEX = 1;
const SUBMISSION_ID_INDEX = 19;

const DEMO_FIELDS = {
  ageGroup: 14,
  gender: 15,
  jobGroup: 16,
  workNature: 17,
  question_open: 18
};

const DEMO_FIELD_ORDER = [
  "ageGroup",
  "gender",
  "jobGroup",
  "workNature",
  "question_open"
];

const FIELD_ALIASES = {
  ageGroup: ["ageGroup", "age_group"],
  gender: ["gender"],
  jobGroup: ["jobGroup", "job_type"],
  workNature: ["workNature", "work_nature"],
  question_open: ["question_open", "questionOpen"]
};

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
    return buildResponse({
      success: false,
      error: err.message || String(err),
      retryable: true
    });
  }
}

function doGet() {
  return buildResponse({ status: "FAS Quiz API is running" });
}

function handleCreate_(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet_(ss, SHEET_NAME);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    migrateLegacySheet_(sheet);
    ensureHeaders_(sheet);

    const submissionId = getSubmissionId_(payload) || createFallbackSubmissionId_();
    const existingRecord = findRecordBySubmissionId_(sheet, submissionId);

    if (existingRecord) {
      cacheSubmissionLookup_(submissionId, existingRecord);
      return buildResponse({
        success: true,
        userId: existingRecord.userId,
        rowIndex: existingRecord.rowIndex,
        submissionId,
        duplicate: true
      });
    }

    const userId = createUserId_();
    const answers = extractAnswers_(payload);

    const row = [
      formatTimestamp_(payload.timestamp),
      userId,
      getTotalScore_(payload),
      answers[0],
      answers[1],
      answers[2],
      answers[3],
      answers[4],
      answers[5],
      answers[6],
      answers[7],
      answers[8],
      answers[9],
      getResultLevel_(payload),
      "",
      "",
      "",
      "",
      "",
      submissionId
    ];

    sheet.appendRow(row);

    const rowIndex = sheet.getLastRow();
    const record = { rowIndex, userId, submissionId };
    cacheSubmissionLookup_(submissionId, record);

    return buildResponse({
      success: true,
      userId,
      rowIndex,
      submissionId
    });
  } finally {
    lock.releaseLock();
  }
}

function handleUpdate_(payload) {
  const submissionId = getSubmissionId_(payload);
  const userId = valueOrEmpty_(payload.userId);
  const rowIndexHint = normalizeRowIndex_(payload.rowIndex);

  if (!submissionId && !userId && !rowIndexHint) {
    return buildResponse({
      success: false,
      error: "Missing submissionId or userId"
    });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    return buildResponse({ success: false, error: "Sheet not found", retryable: true });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    migrateLegacySheet_(sheet);
    ensureHeaders_(sheet);

    const record = findRecord_(sheet, {
      submissionId,
      userId,
      rowIndexHint
    });

    if (!record) {
      return buildResponse({
        success: false,
        error: "Record not found",
        retryable: true
      });
    }

    const storedSubmissionId = submissionId || record.submissionId || "";
    const demographicValues = DEMO_FIELD_ORDER.map(function(field) {
      return getValue_(payload, FIELD_ALIASES[field] || [field]);
    });

    sheet
      .getRange(
        record.rowIndex,
        DEMO_FIELDS.ageGroup + 1,
        1,
        demographicValues.length + 1
      )
      .setValues([demographicValues.concat([storedSubmissionId])]);

    const nextRecord = {
      rowIndex: record.rowIndex,
      userId: record.userId || userId,
      submissionId: storedSubmissionId
    };

    if (storedSubmissionId) {
      cacheSubmissionLookup_(storedSubmissionId, nextRecord);
    }

    return buildResponse({
      success: true,
      userId: nextRecord.userId,
      rowIndex: nextRecord.rowIndex,
      submissionId: nextRecord.submissionId
    });
  } finally {
    lock.releaseLock();
  }
}

function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

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

  const same = HEADERS.every(function(header, index) {
    return currentHeaders[index] === header;
  });

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

function findRecord_(sheet, options) {
  const submissionId = options.submissionId;
  const userId = options.userId;
  const rowIndexHint = options.rowIndexHint;

  if (submissionId && rowIndexHint) {
    const recordFromHint = getRecordAtRow_(sheet, rowIndexHint);

    if (recordFromHint && recordFromHint.submissionId === submissionId) {
      return recordFromHint;
    }
  }

  if (submissionId) {
    const recordFromSubmission = findRecordBySubmissionId_(sheet, submissionId);

    if (recordFromSubmission) {
      return recordFromSubmission;
    }
  }

  if (rowIndexHint) {
    const recordFromHint = getRecordAtRow_(sheet, rowIndexHint);

    if (recordFromHint && (!userId || recordFromHint.userId === userId)) {
      return recordFromHint;
    }
  }

  if (userId) {
    return findRecordByUserId_(sheet, userId);
  }

  return null;
}

function getRecordAtRow_(sheet, rowIndex) {
  const normalizedRowIndex = normalizeRowIndex_(rowIndex);

  if (!normalizedRowIndex || normalizedRowIndex > sheet.getLastRow()) {
    return null;
  }

  const row = sheet
    .getRange(normalizedRowIndex, 1, 1, HEADERS.length)
    .getValues()[0];

  return {
    rowIndex: normalizedRowIndex,
    userId: valueOrEmpty_(row[USER_ID_INDEX]),
    submissionId: valueOrEmpty_(row[SUBMISSION_ID_INDEX])
  };
}

function findRecordBySubmissionId_(sheet, submissionId) {
  const normalizedSubmissionId = valueOrEmpty_(submissionId);

  if (!normalizedSubmissionId) {
    return null;
  }

  const cachedRecord = getCachedSubmissionLookup_(normalizedSubmissionId);

  if (cachedRecord) {
    const recordAtCachedRow = getRecordAtRow_(sheet, cachedRecord.rowIndex);

    if (
      recordAtCachedRow &&
      recordAtCachedRow.submissionId === normalizedSubmissionId
    ) {
      return recordAtCachedRow;
    }
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const submissionIds = sheet
    .getRange(2, SUBMISSION_ID_INDEX + 1, lastRow - 1, 1)
    .getValues()
    .flat();

  const index = submissionIds.indexOf(normalizedSubmissionId);
  if (index < 0) return null;

  const rowIndex = index + 2;
  const record = getRecordAtRow_(sheet, rowIndex);
  cacheSubmissionLookup_(normalizedSubmissionId, record);
  return record;
}

function findRecordByUserId_(sheet, userId) {
  const normalizedUserId = valueOrEmpty_(userId);

  if (!normalizedUserId) {
    return null;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const ids = sheet
    .getRange(2, USER_ID_INDEX + 1, lastRow - 1, 1)
    .getValues()
    .flat();

  const index = ids.indexOf(normalizedUserId);
  if (index < 0) return null;

  return getRecordAtRow_(sheet, index + 2);
}

function getCachedSubmissionLookup_(submissionId) {
  try {
    const raw = CacheService
      .getScriptCache()
      .get(getSubmissionCacheKey_(submissionId));

    if (!raw) return null;

    const cachedRecord = JSON.parse(raw);
    const rowIndex = normalizeRowIndex_(cachedRecord.rowIndex);

    if (!rowIndex) return null;

    return {
      rowIndex,
      userId: valueOrEmpty_(cachedRecord.userId),
      submissionId: valueOrEmpty_(cachedRecord.submissionId)
    };
  } catch (err) {
    return null;
  }
}

function cacheSubmissionLookup_(submissionId, record) {
  const normalizedSubmissionId = valueOrEmpty_(submissionId);
  const rowIndex = normalizeRowIndex_(record && record.rowIndex);

  if (!normalizedSubmissionId || !rowIndex) {
    return;
  }

  try {
    CacheService
      .getScriptCache()
      .put(
        getSubmissionCacheKey_(normalizedSubmissionId),
        JSON.stringify({
          rowIndex,
          userId: valueOrEmpty_(record.userId),
          submissionId: normalizedSubmissionId
        }),
        CACHE_TTL_SECONDS
      );
  } catch (err) {
    // Cache misses only cost a lookup; writes should still succeed.
  }
}

function getSubmissionCacheKey_(submissionId) {
  return "fas_submission:" + submissionId;
}

function createUserId_() {
  return Utilities.getUuid();
}

function createFallbackSubmissionId_() {
  return "legacy-" + Utilities.getUuid();
}

function getSubmissionId_(payload) {
  return getValue_(payload, [
    "submissionId",
    "submission_id",
    "sessionId",
    "session_id"
  ]);
}

function normalizeRowIndex_(rowIndex) {
  const numericRowIndex = Number(rowIndex);
  return Number.isInteger(numericRowIndex) && numericRowIndex > 1
    ? numericRowIndex
    : null;
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
  if (payload.result_level) return String(payload.result_level).trim();
  if (payload.result_summary) return String(payload.result_summary).trim();

  var total = Number(getTotalScore_(payload) || 0);
  if (total >= 10 && total <= 21) return "VẪN ỔN - CHƯA GỒNG";
  if (total >= 22 && total <= 34) return "GỒNG THẤY RÕ";
  if (total >= 35) return "GỒNG QUÁ MỨC";
  return "";
}

function extractAnswers_(payload) {
  var fallback = Array.isArray(payload.answers) ? payload.answers : [];
  var result = [];

  for (var i = 1; i <= 10; i++) {
    var fromKey = valueOrEmpty_(payload["q" + i]);
    var fromFallback = valueOrEmpty_(fallback[i - 1]);
    result.push(fromKey || fromFallback);
  }

  return result;
}

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

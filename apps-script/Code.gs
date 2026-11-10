const RESULTS_SHEET_NAME = "GameResults";
const RESULT_HEADERS = [
  "RecordedAt",
  "Class",
  "StudentNumber",
  "SolvedCount",
  "TotalCount",
  "Status",
  "ElapsedSeconds",
  "StartedAt",
  "FinishedAt",
  "PuzzleTimes"
];
const PUZZLE_IDS = [
  "acrostic",
  "caesar",
  "unicode",
  "exif",
  "encoding",
  "cryptography",
  "spartan",
  "vigenere"
];
const TOTAL_QUESTIONS = PUZZLE_IDS.length;
const DURATION_SECONDS = 40 * 60;

function doPost(event) {
  try {
    const body = JSON.parse(event.postData.contents);
    if (body.type !== "result") {
      return jsonResponse({ ok: false, message: "Unsupported request type." });
    }

    const result = validateResult(body);
    const sheet = getResultsSheet();
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const rowNumber = sheet.getLastRow() + 1;
      sheet.getRange(rowNumber, 2, 1, 2).setNumberFormat("@");
      sheet.getRange(rowNumber, 1, 1, RESULT_HEADERS.length).setValues([[
        new Date(),
        result.className,
        result.studentNumber,
        result.solvedCount,
        result.totalCount,
        result.status,
        result.elapsedSeconds,
        result.startedAt,
        result.finishedAt,
        JSON.stringify(result.puzzleTimes)
      ]]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, message: error.message });
  }
}

function clearAllResults() {
  const sheet = getResultsSheet();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return;
    sheet.getRange(2, 1, lastRow - 1, RESULT_HEADERS.length).clearContent();
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  try {
    const rows = getResultsSheet().getDataRange().getValues().slice(1);
    const results = rows
      .filter((row) => row[1] && row[2])
      .map(rowToResult);

    return jsonResponse({
      rankings: getCompleteRankings(results),
      classAverages: getClassAverages(results),
      puzzleRankings: getPuzzleRankings(
        results.filter((result) => result.className !== "教員")
      ),
      puzzleRankingsWithTeachers: getPuzzleRankings(results)
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, message: error.message });
  }
}

function getResultsSheet() {
  const spreadsheetId = PropertiesService.getScriptProperties()
    .getProperty("RESULTS_SPREADSHEET_ID");
  if (!spreadsheetId) {
    throw new Error("Set the RESULTS_SPREADSHEET_ID script property.");
  }
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

  let sheet = spreadsheet.getSheetByName(RESULTS_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(RESULTS_SHEET_NAME);
    sheet.appendRow(RESULT_HEADERS);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(RESULT_HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function validateResult(body) {
  const className = String(body.className || "");
  const studentNumber = String(body.studentNumber || "");
  const solvedCount = Number(body.solvedCount);
  const totalCount = Number(body.totalCount);
  const elapsedSeconds = Number(body.elapsedSeconds);
  const status = String(body.status || "");

  const isTeacher = className === "教員";
  if (!isTeacher && !/^1-[1-8]$/.test(className)) {
    throw new Error("Invalid className.");
  }
  if (isTeacher && (!studentNumber.trim() || studentNumber.length > 40 ||
      /[\u0000-\u001f\u007f]/.test(studentNumber))) {
    throw new Error("Invalid teacher name.");
  }
  if (!isTeacher && !/^[1-9]\d*$/.test(studentNumber)) {
    throw new Error("Invalid studentNumber.");
  }
  if (!Number.isInteger(solvedCount) || solvedCount < 0 || solvedCount > TOTAL_QUESTIONS) {
    throw new Error("Invalid solvedCount.");
  }
  if (totalCount !== TOTAL_QUESTIONS) {
    throw new Error("Invalid totalCount.");
  }
  if (!Number.isInteger(elapsedSeconds) || elapsedSeconds < 0 || elapsedSeconds > DURATION_SECONDS) {
    throw new Error("Invalid elapsedSeconds.");
  }
  if (status !== "complete" && status !== "timeout") {
    throw new Error("Invalid status.");
  }
  if (status === "complete" && solvedCount !== TOTAL_QUESTIONS) {
    throw new Error("A complete result must have all questions solved.");
  }

  const inputTimes = body.puzzleTimes && typeof body.puzzleTimes === "object"
    ? body.puzzleTimes
    : {};
  const puzzleTimes = {};
  PUZZLE_IDS.forEach((puzzleId) => {
    const value = inputTimes[puzzleId];
    if (value === undefined) return;
    const seconds = Number(value);
    if (!Number.isInteger(seconds) || seconds < 0 || seconds > DURATION_SECONDS) {
      throw new Error(`Invalid time for ${puzzleId}.`);
    }
    puzzleTimes[puzzleId] = seconds;
  });
  if (Object.keys(puzzleTimes).length > solvedCount) {
    throw new Error("Puzzle times cannot exceed the solved question count.");
  }

  return {
    className,
    studentNumber: isTeacher ? studentNumber.trim() : studentNumber,
    solvedCount,
    totalCount,
    status,
    elapsedSeconds,
    startedAt: String(body.startedAt || ""),
    finishedAt: String(body.finishedAt || ""),
    puzzleTimes
  };
}

function rowToResult(row) {
  let puzzleTimes = {};
  try {
    puzzleTimes = JSON.parse(String(row[9] || "{}"));
  } catch (error) {
    console.error("Ignoring invalid puzzleTimes in results sheet.", error);
  }
  return {
    className: normalizeClassName(row[1]),
    studentNumber: String(row[2]),
    solvedCount: Number(row[3]) || 0,
    totalCount: Number(row[4]) || TOTAL_QUESTIONS,
    status: String(row[5]),
    elapsedSeconds: Number(row[6]) || 0,
    puzzleTimes
  };
}

function normalizeClassName(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime()) &&
      value.getMonth() === 0 && value.getDate() >= 1 && value.getDate() <= 8) {
    return `1-${value.getDate()}`;
  }
  return String(value);
}

function getCompleteRankings(results) {
  const fastestByParticipant = new Map();
  results.filter((result) => result.status === "complete").forEach((result) => {
    const key = `${result.className}:${result.studentNumber}`;
    const current = fastestByParticipant.get(key);
    if (!current || result.elapsedSeconds < current.elapsedSeconds) {
      fastestByParticipant.set(key, result);
    }
  });

  return Array.from(fastestByParticipant.values())
    .sort((a, b) => a.elapsedSeconds - b.elapsedSeconds)
    .map(({ className, studentNumber, elapsedSeconds }) => ({
      className,
      studentNumber,
      elapsedSeconds
    }));
}

function getClassAverages(results) {
  const bestByParticipant = new Map();
  results.forEach((result) => {
    const key = `${result.className}:${result.studentNumber}`;
    const solvedCount = result.status === "complete" ? TOTAL_QUESTIONS : result.solvedCount;
    const current = bestByParticipant.get(key);
    if (!current || solvedCount > current.solvedCount) {
      bestByParticipant.set(key, { className: result.className, solvedCount });
    }
  });

  const classes = new Map();
  bestByParticipant.forEach(({ className, solvedCount }) => {
    const current = classes.get(className) || { totalSolved: 0, participantCount: 0 };
    current.totalSolved += solvedCount;
    current.participantCount += 1;
    classes.set(className, current);
  });

  return Array.from(classes, ([className, values]) => ({
    className,
    totalSolved: values.totalSolved,
    averageSolved: values.totalSolved / values.participantCount,
    participantCount: values.participantCount
  })).sort((a, b) => a.className.localeCompare(b.className));
}

function getPuzzleRankings(results) {
  return PUZZLE_IDS.map((puzzleId) => {
    let fastest = null;
    results.forEach((result) => {
      const elapsedSeconds = Number(result.puzzleTimes[puzzleId]);
      if (!Number.isFinite(elapsedSeconds)) return;
      if (!fastest || elapsedSeconds < fastest.elapsedSeconds) {
        fastest = {
          puzzleId,
          className: result.className,
          studentNumber: result.studentNumber,
          elapsedSeconds
        };
      }
    });
    return fastest;
  }).filter(Boolean);
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

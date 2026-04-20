const QUIZ_DRAFT_STORAGE_KEY = "berocca-fas-quiz-draft-v2";
const SUBMISSION_QUEUE_STORAGE_KEY = "berocca-fas-submission-queue-v2";
const ACKNOWLEDGED_SUBMISSIONS_STORAGE_KEY = "berocca-fas-acknowledged-sessions-v1";
const SUBMISSION_QUEUE_LOCK_KEY = "berocca-fas-submission-queue-lock-v1";
const SUBMISSION_QUEUE_LEASE_KEY = "berocca-fas-submission-queue-lease-v1";
const VALID_STAGES = new Set(["quiz", "result", "collect"]);
const STORAGE_LOCK_TTL_MS = 4000;
const STORAGE_LOCK_WAIT_MS = 2500;
const STORAGE_LOCK_RETRY_MS = 40;
const STORAGE_LOCK_JITTER_MS = 20;
const QUEUE_LEASE_TTL_MS = 20000;
const QUEUE_LEASE_WAIT_MS = 180;
const STALE_QUEUE_ENTRY_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ACKNOWLEDGED_SESSION_TTL_MS = 2 * 24 * 60 * 60 * 1000;
const TERMINAL_FAILURE_RETRY_DELAY_MS = 12 * 60 * 60 * 1000;
const RETRY_DELAYS_MS = [1500, 3000, 7000, 15000, 30000, 60000, 120000, 300000];
const TAB_ID = createSessionId("tab");

function isBrowser() {
  return typeof window !== "undefined";
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getNowMs() {
  return Date.now();
}

function toTimestampMs(value) {
  const parsedValue = Date.parse(value ?? "");
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function readJsonStorage(key, fallbackValue) {
  if (!isBrowser()) {
    return fallbackValue;
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return fallbackValue;
    }

    return JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
}

function writeJsonStorage(key, value) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures and keep the UI usable.
  }
}

function removeStorageItem(key) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures and keep the UI usable.
  }
}

function sanitizeAnswers(answers, questionCount) {
  const emptyAnswers = Array(questionCount).fill(null);

  if (!Array.isArray(answers) || answers.length !== questionCount) {
    return emptyAnswers;
  }

  return answers.map((answerIndex) =>
    Number.isInteger(answerIndex) && answerIndex >= 0 ? answerIndex : null,
  );
}

function sanitizeForm(form, initialForm) {
  if (!form || typeof form !== "object") {
    return { ...initialForm };
  }

  return Object.keys(initialForm).reduce((nextForm, fieldName) => {
    nextForm[fieldName] =
      typeof form[fieldName] === "string" ? form[fieldName] : initialForm[fieldName];
    return nextForm;
  }, {});
}

function sanitizeStage(stage, answers) {
  if (!VALID_STAGES.has(stage)) {
    return "quiz";
  }

  const answeredAllQuestions = answers.every((answer) => answer !== null);

  if (!answeredAllQuestions && stage !== "quiz") {
    return "quiz";
  }

  return stage;
}

function isPristineDraft({ stage, answers, form, totalScore, initialForm }) {
  const answersAreEmpty = answers.every((answer) => answer === null);
  const formIsEmpty = Object.keys(initialForm).every(
    (fieldName) => form[fieldName] === initialForm[fieldName],
  );

  return stage === "quiz" && answersAreEmpty && formIsEmpty && totalScore === 0;
}

function normalizeQueueEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  if (typeof entry.id !== "string" || typeof entry.sessionId !== "string") {
    return null;
  }

  if (!entry.payload || typeof entry.payload !== "object") {
    return null;
  }

  return {
    id: entry.id,
    sessionId: entry.sessionId,
    payload: entry.payload,
    attempts: Number.isFinite(entry.attempts) ? entry.attempts : 0,
    queuedAt: typeof entry.queuedAt === "string" ? entry.queuedAt : new Date().toISOString(),
    updatedAt:
      typeof entry.updatedAt === "string" ? entry.updatedAt : new Date().toISOString(),
    nextAttemptAt: Number.isFinite(entry.nextAttemptAt) ? entry.nextAttemptAt : getNowMs(),
    lastError: typeof entry.lastError === "string" ? entry.lastError : "",
    lastStatusCode: Number.isFinite(entry.lastStatusCode) ? entry.lastStatusCode : 0,
    isTerminalFailure: Boolean(entry.isTerminalFailure),
  };
}

function pruneAcknowledgedSessions(acknowledgedSessions) {
  if (!acknowledgedSessions || typeof acknowledgedSessions !== "object") {
    return {};
  }

  const now = getNowMs();

  return Object.entries(acknowledgedSessions).reduce((nextSessions, [sessionId, value]) => {
    if (!value || typeof value !== "object") {
      return nextSessions;
    }

    const acknowledgedAtMs = toTimestampMs(value.acknowledgedAt);

    if (!acknowledgedAtMs || now - acknowledgedAtMs > ACKNOWLEDGED_SESSION_TTL_MS) {
      return nextSessions;
    }

    nextSessions[sessionId] = {
      submissionId:
        typeof value.submissionId === "string" && value.submissionId
          ? value.submissionId
          : "",
      acknowledgedAt: value.acknowledgedAt,
    };

    return nextSessions;
  }, {});
}

function readAcknowledgedSessions() {
  return pruneAcknowledgedSessions(
    readJsonStorage(ACKNOWLEDGED_SUBMISSIONS_STORAGE_KEY, {}),
  );
}

function writeAcknowledgedSessions(acknowledgedSessions) {
  writeJsonStorage(
    ACKNOWLEDGED_SUBMISSIONS_STORAGE_KEY,
    pruneAcknowledgedSessions(acknowledgedSessions),
  );
}

function pruneQueuedSubmissions(queue) {
  const acknowledgedSessions = readAcknowledgedSessions();
  const now = getNowMs();

  return queue
    .map(normalizeQueueEntry)
    .filter(Boolean)
    .filter((entry) => !acknowledgedSessions[entry.sessionId])
    .filter((entry) => {
      const updatedAtMs = Math.max(toTimestampMs(entry.updatedAt), toTimestampMs(entry.queuedAt));
      return updatedAtMs > 0 && now - updatedAtMs <= STALE_QUEUE_ENTRY_TTL_MS;
    })
    .sort((left, right) => left.nextAttemptAt - right.nextAttemptAt);
}

function writeQueuedSubmissions(queue) {
  const nextQueue = pruneQueuedSubmissions(queue);
  writeJsonStorage(SUBMISSION_QUEUE_STORAGE_KEY, nextQueue);
  return nextQueue;
}

async function acquireStorageLease(
  storageKey,
  { ttlMs, waitTimeoutMs = STORAGE_LOCK_WAIT_MS } = {},
) {
  if (!isBrowser()) {
    return {
      owner: `${TAB_ID}-server`,
      renew() {
        return true;
      },
      release() {},
    };
  }

  const owner = `${TAB_ID}-${getNowMs()}-${Math.random().toString(16).slice(2, 10)}`;
  const startedAt = getNowMs();

  while (getNowMs() - startedAt <= waitTimeoutMs) {
    const currentLease = readJsonStorage(storageKey, null);
    const leaseExpired = toTimestampMs(currentLease?.expiresAt) <= getNowMs();

    if (!currentLease?.owner || leaseExpired) {
      const nextLease = {
        owner,
        expiresAt: new Date(getNowMs() + ttlMs).toISOString(),
      };

      writeJsonStorage(storageKey, nextLease);

      const confirmedLease = readJsonStorage(storageKey, null);

      if (confirmedLease?.owner === owner) {
        return {
          owner,
          renew(nextTtlMs = ttlMs) {
            const latestLease = readJsonStorage(storageKey, null);

            if (latestLease?.owner !== owner) {
              return false;
            }

            writeJsonStorage(storageKey, {
              owner,
              expiresAt: new Date(getNowMs() + nextTtlMs).toISOString(),
            });

            return readJsonStorage(storageKey, null)?.owner === owner;
          },
          release() {
            const latestLease = readJsonStorage(storageKey, null);

            if (latestLease?.owner === owner) {
              removeStorageItem(storageKey);
            }
          },
        };
      }
    }

    await sleep(STORAGE_LOCK_RETRY_MS + Math.floor(Math.random() * STORAGE_LOCK_JITTER_MS));
  }

  return null;
}

async function withSubmissionQueueLock(work) {
  const lease = await acquireStorageLease(SUBMISSION_QUEUE_LOCK_KEY, {
    ttlMs: STORAGE_LOCK_TTL_MS,
  });

  if (!lease) {
    return work();
  }

  try {
    return await work();
  } finally {
    lease.release();
  }
}

async function mutateQueuedSubmissions(mutator) {
  return withSubmissionQueueLock(async () => {
    const currentQueue = readQueuedSubmissions();
    const nextQueue = (await mutator([...currentQueue])) ?? currentQueue;
    return writeQueuedSubmissions(nextQueue);
  });
}

function createSubmissionError(message, { retryable = true, statusCode = 0 } = {}) {
  const error = new Error(message);
  error.retryable = retryable;
  error.statusCode = statusCode;
  return error;
}

function isRetryableStatusCode(statusCode) {
  return (
    statusCode === 0 ||
    statusCode === 408 ||
    statusCode === 425 ||
    statusCode === 429 ||
    statusCode >= 500
  );
}

export function createSessionId(prefix = "session") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function createSubmissionId() {
  return createSessionId("submission");
}

export function getRetryDelayMs(attemptCount) {
  const safeAttemptCount = Math.max(1, attemptCount);
  const retryIndex = Math.min(safeAttemptCount - 1, RETRY_DELAYS_MS.length - 1);
  const jitter = Math.floor(Math.random() * 1000);
  return RETRY_DELAYS_MS[retryIndex] + jitter;
}

export function loadPersistedQuizState({
  questionCount,
  initialForm,
  calculateTotalScore,
}) {
  const fallbackState = {
    stage: "quiz",
    answers: Array(questionCount).fill(null),
    form: { ...initialForm },
    totalScore: 0,
    sessionId: createSessionId(),
  };

  const storedDraft = readJsonStorage(QUIZ_DRAFT_STORAGE_KEY, null);

  if (!storedDraft || typeof storedDraft !== "object") {
    return fallbackState;
  }

  const answers = sanitizeAnswers(storedDraft.answers, questionCount);
  const stage = sanitizeStage(storedDraft.stage, answers);
  const form = sanitizeForm(storedDraft.form, initialForm);
  const computedScore = calculateTotalScore(answers);
  const totalScore =
    Number.isFinite(storedDraft.totalScore) && storedDraft.totalScore > 0
      ? storedDraft.totalScore
      : computedScore;

  return {
    stage,
    answers,
    form,
    totalScore,
    sessionId:
      typeof storedDraft.sessionId === "string" && storedDraft.sessionId
        ? storedDraft.sessionId
        : createSessionId(),
  };
}

export function persistQuizState({
  stage,
  answers,
  form,
  totalScore,
  sessionId,
  initialForm,
}) {
  if (
    isPristineDraft({
      stage,
      answers,
      form,
      totalScore,
      initialForm,
    })
  ) {
    removeStorageItem(QUIZ_DRAFT_STORAGE_KEY);
    return;
  }

  writeJsonStorage(QUIZ_DRAFT_STORAGE_KEY, {
    version: 2,
    stage,
    answers,
    form,
    totalScore,
    sessionId,
    updatedAt: new Date().toISOString(),
  });
}

export function clearPersistedQuizState() {
  removeStorageItem(QUIZ_DRAFT_STORAGE_KEY);
}

export function readQueuedSubmissions() {
  const queue = readJsonStorage(SUBMISSION_QUEUE_STORAGE_KEY, []);

  if (!Array.isArray(queue)) {
    return [];
  }

  return pruneQueuedSubmissions(queue);
}

export function getQueuedSubmissionBySession(sessionId) {
  return readQueuedSubmissions().find((entry) => entry.sessionId === sessionId) ?? null;
}

export async function upsertQueuedSubmission(submission) {
  const normalizedSubmission = normalizeQueueEntry(submission);

  if (!normalizedSubmission) {
    return readQueuedSubmissions();
  }

  return mutateQueuedSubmissions((currentQueue) => {
    const nextQueue = currentQueue.filter(
      (entry) =>
        entry.id !== normalizedSubmission.id && entry.sessionId !== normalizedSubmission.sessionId,
    );

    nextQueue.push({
      ...normalizedSubmission,
      isTerminalFailure: false,
      lastStatusCode: normalizedSubmission.lastStatusCode ?? 0,
    });

    return nextQueue;
  });
}

export async function updateQueuedSubmission(submission) {
  const normalizedSubmission = normalizeQueueEntry(submission);

  if (!normalizedSubmission) {
    return readQueuedSubmissions();
  }

  return mutateQueuedSubmissions((currentQueue) =>
    currentQueue.map((entry) =>
      entry.id === normalizedSubmission.id ? normalizedSubmission : entry,
    ),
  );
}

export async function removeQueuedSubmissionById(submissionId) {
  return mutateQueuedSubmissions((currentQueue) =>
    currentQueue.filter((entry) => entry.id !== submissionId),
  );
}

export async function removeQueuedSubmissionBySession(sessionId) {
  return mutateQueuedSubmissions((currentQueue) =>
    currentQueue.filter((entry) => entry.sessionId !== sessionId),
  );
}

export function hasAcknowledgedSession(sessionId) {
  return Boolean(sessionId && readAcknowledgedSessions()[sessionId]);
}

export async function markSessionAcknowledged({ sessionId, submissionId }) {
  if (!sessionId) {
    return null;
  }

  return withSubmissionQueueLock(async () => {
    const acknowledgedSessions = readAcknowledgedSessions();

    acknowledgedSessions[sessionId] = {
      submissionId: typeof submissionId === "string" ? submissionId : "",
      acknowledgedAt: new Date().toISOString(),
    };

    writeAcknowledgedSessions(acknowledgedSessions);
    writeQueuedSubmissions(
      readQueuedSubmissions().filter((entry) => entry.sessionId !== sessionId),
    );

    return acknowledgedSessions[sessionId];
  });
}

export async function clearAcknowledgedSession(sessionId) {
  if (!sessionId) {
    return readAcknowledgedSessions();
  }

  return withSubmissionQueueLock(async () => {
    const acknowledgedSessions = readAcknowledgedSessions();
    delete acknowledgedSessions[sessionId];
    writeAcknowledgedSessions(acknowledgedSessions);
    return acknowledgedSessions;
  });
}

export async function acquireSubmissionQueueLease() {
  return acquireStorageLease(SUBMISSION_QUEUE_LEASE_KEY, {
    ttlMs: QUEUE_LEASE_TTL_MS,
    waitTimeoutMs: QUEUE_LEASE_WAIT_MS,
  });
}

export function getTerminalFailureRetryDelayMs() {
  return TERMINAL_FAILURE_RETRY_DELAY_MS;
}

export function subscribeToSubmissionPersistence(callback) {
  if (!isBrowser()) {
    return () => {};
  }

  function handleStorage(event) {
    if (
      event.key === null ||
      event.key === SUBMISSION_QUEUE_STORAGE_KEY ||
      event.key === ACKNOWLEDGED_SUBMISSIONS_STORAGE_KEY ||
      event.key === QUIZ_DRAFT_STORAGE_KEY
    ) {
      callback();
    }
  }

  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("storage", handleStorage);
  };
}

export async function submitQueuedPayload({ url, payload, timeoutMs = 12000 }) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw createSubmissionError("Client is offline", {
      retryable: true,
      statusCode: 0,
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      keepalive: true,
      signal: controller.signal,
    });

    const responseText = await response.text();
    let responseData = {};

    if (responseText) {
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw: responseText };
      }
    }

    if (!response.ok || responseData.success !== true) {
      throw createSubmissionError(
        responseData.error ||
          responseData.message ||
          responseData.raw ||
          `Submit failed with status ${response.status}`,
        {
          retryable: isRetryableStatusCode(response.status),
          statusCode: response.status,
        },
      );
    }

    return responseData;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createSubmissionError("Request timed out", {
        retryable: true,
        statusCode: 0,
      });
    }

    if (error?.retryable !== undefined) {
      throw error;
    }

    if (typeof TypeError !== "undefined" && error instanceof TypeError) {
      throw createSubmissionError("Network request failed", {
        retryable: true,
        statusCode: 0,
      });
    }

    throw createSubmissionError(error?.message ?? "Unknown submission error", {
      retryable: true,
      statusCode: 0,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

import { useEffect, useEffectEvent, useRef, useState } from "react";
import quizBanner from "./assets/banner.png";
import resultBanner from "./assets/banner 2.png";
import collectBanner from "./assets/banner 3.png";
import resultButtonImage from "./assets/btn 1.png";
import continueButtonImage from "./assets/nut 2.png";
import questionFrameImage from "./assets/frame cau hoi.png";
import answer1Default from "./assets/dap an 1 - Copy.png";
import answer1Selected from "./assets/dap an 1.png";
import answer2Default from "./assets/dap an 2 - Copy.png";
import answer2Selected from "./assets/dap an 2.png";
import answer3Default from "./assets/dap an 3 - Copy.png";
import answer3Selected from "./assets/dap an 3.png";
import answer4Default from "./assets/dapan 4 - Copy.png";
import answer4Selected from "./assets/dapan 4.png";
import answer5Default from "./assets/dapan 5 - Copy.png";
import answer5Selected from "./assets/dapan 5.png";
import {
  acquireSubmissionQueueLease,
  clearAcknowledgedSession,
  clearPersistedQuizState,
  createSessionId,
  createSubmissionId,
  getQueuedSubmissionBySession,
  getRetryDelayMs,
  getTerminalFailureRetryDelayMs,
  hasAcknowledgedSession,
  loadPersistedQuizState,
  markSessionAcknowledged,
  persistQuizState,
  readQueuedSubmissions,
  removeQueuedSubmissionById,
  removeQueuedSubmissionBySession,
  subscribeToSubmissionPersistence,
  submitQueuedPayload,
  updateQueuedSubmission,
  upsertQueuedSubmission,
} from "./beroccaSubmissionStorage";

const APPS_SCRIPT_URL =
  import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbwa2pEfOiZ1S-EcDox5y-tSvwH3Ifuc33tsr_YP-oW9kmgK05640mgvJG2DxFHTTagq_A/exec";

const SECRET_TOKEN =
  import.meta.env.VITE_GOOGLE_APPS_SCRIPT_TOKEN ?? "berocca2024xyz";

const SUCCESS_SUBMISSION_MESSAGE = "Thông tin đã được lưu thành công.";
const QUEUED_SUBMISSION_MESSAGE =
  "Máy chủ đang bận nên dữ liệu của bạn đã được giữ tạm an toàn và sẽ tự gửi lại khi ổn định.";
const TERMINAL_SUBMISSION_MESSAGE =
  "Hệ thống lưu dữ liệu đang gặp lỗi cấu hình. Dữ liệu vẫn được giữ trên trình duyệt để gửi lại sau.";

const ANSWER_OPTIONS = [
  {
    label: "Luôn luôn",
    score: 5,
    defaultImage: answer1Default,
    selectedImage: answer1Selected,
  },
  {
    label: "Thường xuyên",
    score: 4,
    defaultImage: answer2Default,
    selectedImage: answer2Selected,
  },
  {
    label: "Thỉnh thoảng",
    score: 3,
    defaultImage: answer3Default,
    selectedImage: answer3Selected,
  },
  {
    label: "Ít khi",
    score: 2,
    defaultImage: answer4Default,
    selectedImage: answer4Selected,
  },
  {
    label: "Không bao giờ",
    score: 1,
    defaultImage: answer5Default,
    selectedImage: answer5Selected,
  },
];

const QUESTIONS = [
  {
    id: "q1",
    label: "CÂU 1",
    prompt: "Dạo này, bạn có thường cảm thấy mệt không?",
  },
  {
    id: "q2",
    label: "CÂU 2",
    prompt: "Khi đang làm việc, bạn có nhanh bị mệt không?",
  },
  {
    id: "q3",
    label: "CÂU 3",
    prompt: "Mỗi ngày, bạn cảm thấy hiệu suất làm việc của mình như thế nào?",
  },
  {
    id: "q4",
    label: "CÂU 4",
    prompt: "Mức năng lượng của bạn trong ngày dạo này như thế nào?",
  },
  {
    id: "q5",
    label: "CÂU 5",
    prompt: "Dạo này, bạn cảm thấy thể trạng của mình như thế nào?",
  },
  {
    id: "q6",
    label: "CÂU 6",
    prompt: "Khi bắt đầu một việc, bạn cảm thấy mình sẵn sàng đến mức nào?",
  },
  {
    id: "q7",
    label: "CÂU 7",
    prompt: "Khi suy nghĩ hoặc làm việc, bạn có cảm thấy đầu óc minh mẫn không?",
  },
  {
    id: "q8",
    label: "CÂU 8",
    prompt:
      "Gần đây, bạn còn thấy hứng thú khi bắt đầu hoặc làm các việc mỗi ngày không?",
  },
  {
    id: "q9",
    label: "CÂU 9",
    prompt: "Tinh thần chung của bạn dạo này như thế nào?",
  },
  {
    id: "q10",
    label: "CÂU 10",
    prompt: "Khả năng tập trung của bạn dạo này như thế nào?",
  },
];

const PROFILE_FIELDS = [
  {
    id: "ageGroup",
    label: "Bạn đang ở nhóm tuổi nào? *",
    options: ["Dưới 25", "25 - 34", "35 - 44", "Trên 45"],
  },
  {
    id: "gender",
    label: "Giới tính của bạn: *",
    options: ["Nam", "Nữ", "Khác", "Không muốn chia sẻ"],
  },
  {
    id: "jobGroup",
    label: "Công việc hiện tại của bạn gần với nhóm nào nhất? *",
    options: [
      "IT / Công nghệ",
      "Marketing / Sáng tạo",
      "Kinh doanh / Sales",
      "Nhân viên văn phòng (hành chính, kế toán...)",
      "Sản xuất / Nhà máy / Kỹ thuật vận hành",
      "Dịch vụ / Bán lẻ / F&B",
      "Tự do / Freelance / Kinh doanh cá nhân",
      "Khác",
    ],
  },
  {
    id: "workNature",
    label: "Tính chất công việc của bạn gần với điều nào nhất? *",
    options: [
      "Chủ yếu ngồi nhiều / Làm việc trí óc",
      "Áp lực deadline / KPI cao",
      "Di chuyển nhiều / Làm việc ngoài trời",
      "Lao động tay chân / Vận hành máy móc",
    ],
  },
];

const RESULT_CONFIGS = [
  {
    key: "stable",
    min: 10,
    max: 21,
    heroTitle: "Vẫn ổn, chưa gồng!",
    meterLabel: "Ổn định",
    meterValue: 0.18,
    meterTone: "green",
    mascotImage: answer5Selected,
    statusCopy:
      "Bạn vẫn đang giữ được nhịp làm việc và sinh hoạt tương đối ổn. Tuy nhiên cơ thể vẫn đang tiêu hao năng lượng và vi chất để duy trì trạng thái này mỗi ngày.",
    whatCopy:
      "Đây là giai đoạn cơ thể còn đủ sức bù đắp, nhưng nếu phục hồi chậm, cảm giác hụt năng lượng có thể tích lại và khiến bạn bắt đầu “gồng” lúc nào không hay.",
    signals: [
      { icon: "energy", title: "Năng lượng", value: "Tạm ổn" },
      { icon: "focus", title: "Tập trung", value: "Giữ được nhịp" },
      { icon: "body", title: "Thể chất", value: "Chưa quá tải" },
    ],
    warning:
      "Chủ động phục hồi từ sớm để giữ trạng thái ổn định thay vì đợi đến lúc phải gồng mới xử lý.",
    habits: ["Ngủ đủ và sâu hơn", "Ăn uống cân bằng", "Vận động đều đặn"],
    supplement:
      "Bổ sung vitamin và khoáng chất thiết yếu mỗi ngày có thể hỗ trợ cơ thể duy trì sức bền, giảm cảm giác đuối sức và giữ phong độ ổn định hơn.",
    recoveryTitle: "Khi cơ thể được phục hồi đúng cách",
    recoveryCopy:
      "Bạn không cần cố quá nhiều mà vẫn sẵn sàng đón việc, giữ tinh thần tỉnh táo và duy trì nhịp sống thoải mái hơn mỗi ngày.",
  },
  {
    key: "fatigue",
    min: 22,
    max: 34,
    heroTitle: "Gồng thấy rõ!",
    meterLabel: "Mệt mỏi",
    meterValue: 0.58,
    meterTone: "yellow",
    mascotImage: answer3Selected,
    statusCopy:
      "Bạn bắt đầu cảm nhận rõ sự mệt mỏi. Không còn là “cũng ổn” nữa mà đã có những lúc đuối, mất tập trung hoặc thiếu năng lượng để duy trì nhịp làm việc như trước.",
    whatCopy:
      "Đây là dấu hiệu cơ thể đang tiêu hao nhiều hơn mức có thể phục hồi. Khi năng lượng và vi chất không được bổ sung đủ, thể chất xuống trước, tinh thần chậm theo sau.",
    signals: [
      { icon: "energy", title: "Năng lượng", value: "Đang giảm" },
      { icon: "focus", title: "Tập trung", value: "Không ổn định" },
      { icon: "body", title: "Thể chất", value: "Bắt đầu mệt" },
    ],
    warning:
      "Đừng để tình trạng này kéo dài. Càng phục hồi sớm, cơ thể càng dễ lấy lại nhịp tốt và tránh rơi vào trạng thái quá tải.",
    habits: ["Ngủ đủ và sâu hơn", "Ăn uống cân bằng", "Vận động hợp lý"],
    supplement:
      "Vitamin nhóm B, vitamin C, kẽm và magie có thể hỗ trợ giảm căng thẳng, bớt mệt mỏi và giúp cơ thể lấy lại đà tốt hơn mỗi ngày.",
    recoveryTitle: "Khi cơ thể bắt đầu phục hồi đúng cách",
    recoveryCopy:
      "Bạn sẽ không còn phải cố gắng quá sức để theo kịp mà có thể quay lại trạng thái sẵn sàng đón việc và xử lý áp lực nhẹ nhàng hơn.",
  },
  {
    key: "extreme-fatigue",
    min: 35,
    max: 50,
    heroTitle: "Gồng quá mức!",
    meterLabel: "Quá tải",
    meterValue: 0.9,
    meterTone: "red",
    mascotImage: answer2Selected,
    statusCopy:
      "Bạn đang ở trạng thái mệt mỏi rõ rệt. Năng lượng giảm sâu, cơ thể dễ đuối, tinh thần khó tập trung và mọi thứ bắt đầu trở nên nặng nề hơn bình thường.",
    whatCopy:
      "Đây là dấu hiệu cho thấy cơ thể đã tiêu hao vượt quá khả năng phục hồi. Nếu để kéo dài, không chỉ hiệu suất giảm mà sức khỏe tổng thể cũng dễ bị ảnh hưởng theo.",
    signals: [
      { icon: "energy", title: "Năng lượng", value: "Giảm sâu" },
      { icon: "focus", title: "Tập trung", value: "Dễ quá tải" },
      { icon: "body", title: "Thể chất", value: "Thiếu phục hồi" },
    ],
    warning:
      "Đây là lúc cần phục hồi nghiêm túc hơn: ngủ đủ, giảm tải áp lực và dành thời gian để cơ thể nghỉ ngơi thật sự.",
    habits: ["Ngủ đủ và sâu hơn", "Ăn uống đầy đủ", "Giảm tải áp lực"],
    supplement:
      "Bổ sung vitamin và khoáng chất thiết yếu là một phần hỗ trợ hữu ích, nhưng nếu mệt mỏi kéo dài bạn nên tìm chuyên gia y tế để được tư vấn phù hợp.",
    recoveryTitle: "Khi cơ thể dần lấy lại năng lượng",
    recoveryCopy:
      "Bạn sẽ bớt cảm giác phải gồng để vượt qua mỗi ngày, từ đó dần quay về trạng thái đủ sức đón việc, đón áp lực và đón nhịp sống phía trước.",
  },
];

const INITIAL_FORM = {
  ageGroup: "",
  gender: "",
  jobGroup: "",
  workNature: "",
  doctorQuestion: "",
};

const STAGE_DETAILS = {
  quiz: {
    step: 1,
    badge: "Bài test FAS",
    title: "Kiểm tra nhanh mức độ mệt mỏi hiện tại",
    description:
      "Trả lời 10 câu hỏi để xem cơ thể bạn đang ổn, bắt đầu gồng hay đã bước vào trạng thái quá tải.",
  },
  result: {
    step: 2,
    badge: "Kết quả cá nhân",
    title: "Đọc kết quả theo cách dễ hiểu và dễ hành động",
    description:
      "Tập trung vào tín hiệu nổi bật, mức điểm hiện tại và gợi ý phục hồi phù hợp cho nhịp sống hằng ngày.",
  },
  collect: {
    step: 3,
    badge: "Bước cuối",
    title: "Bổ sung vài thông tin để hoàn tất ghi nhận",
    description:
      "Thông tin được giữ tạm an toàn trên trình duyệt và có thể tự đồng bộ lại nếu đường truyền bị gián đoạn.",
  },
};

function createInitialAnswers() {
  return Array(QUESTIONS.length).fill(null);
}

function getResultConfig(totalScore) {
  return (
    RESULT_CONFIGS.find(
      ({ min, max }) => totalScore >= min && totalScore <= max,
    ) ?? RESULT_CONFIGS[1]
  );
}

function getSelectedOption(answerIndex) {
  if (answerIndex === null || answerIndex === undefined) {
    return null;
  }

  return ANSWER_OPTIONS[answerIndex] ?? null;
}

function calculateTotalScore(answers) {
  return answers.reduce((sum, answerIndex) => {
    const selected = getSelectedOption(answerIndex);
    return sum + (selected?.score ?? 0);
  }, 0);
}

function getResultLevelLabel(resultKey) {
  if (resultKey === "stable") {
    return "Vẫn ổn";
  }

  if (resultKey === "fatigue") {
    return "Gồng thấy rõ";
  }

  if (resultKey === "extreme-fatigue") {
    return "Gồng quá mức";
  }

  return "";
}

function normalizeAgeGroup(ageGroup) {
  const mappings = {
    "Dưới 25": "Dưới 25",
    "25 - 34": "25-34",
    "35 - 44": "35-44",
    "Trên 45": "Trên 45",
  };

  return mappings[ageGroup] ?? ageGroup;
}

function normalizeJobType(jobGroup) {
  const mappings = {
    "IT / Công nghệ": "IT/Công nghệ",
    "Marketing / Sáng tạo": "Marketing/Sáng tạo",
    "Kinh doanh / Sales": "Kinh doanh/Sales",
    "Nhân viên văn phòng (hành chính, kế toán...)": "Nhân viên văn phòng",
    "Sản xuất / Nhà máy / Kỹ thuật vận hành":
      "Sản xuất/Nhà máy/Kỹ thuật vận hành",
    "Dịch vụ / Bán lẻ / F&B": "Dịch vụ/Bán lẻ/F&B",
    "Tự do / Freelance / Kinh doanh cá nhân": "Freelancer",
    Khác: "Khác",
  };

  return mappings[jobGroup] ?? jobGroup;
}

function normalizeWorkNature(workNature) {
  const mappings = {
    "Chủ yếu ngồi nhiều / Làm việc trí óc": "Ngồi nhiều / Làm việc trí óc",
    "Áp lực deadline / KPI cao": "Áp lực deadline KPI",
    "Di chuyển nhiều / Làm việc ngoài trời":
      "Di chuyển nhiều / Làm việc ngoài trời",
    "Lao động tay chân / Vận hành máy móc":
      "Lao động tay chân / Vận hành máy móc",
  };

  return mappings[workNature] ?? workNature;
}

function buildQuizSubmissionPayload({
  answers,
  form,
  result,
  totalScore,
  sessionId,
  submissionId,
}) {
  const answerTexts = answers.map(
    (answerIndex) => getSelectedOption(answerIndex)?.label ?? "",
  );

  const resultLevel = getResultLevelLabel(result.key);

  return {
    token: SECRET_TOKEN,
    payloadVersion: "berocca-fas-flow-v3",
    timestamp: new Date().toISOString(),
    submission_id: submissionId,
    dedupe_key: sessionId,
    client_session_id: sessionId,
    session_id: sessionId,
    total_score: totalScore,
    score: totalScore,
    q1: answerTexts[0],
    q2: answerTexts[1],
    q3: answerTexts[2],
    q4: answerTexts[3],
    q5: answerTexts[4],
    q6: answerTexts[5],
    q7: answerTexts[6],
    q8: answerTexts[7],
    q9: answerTexts[8],
    q10: answerTexts[9],
    answers: answerTexts,
    result_level: resultLevel,
    level: resultLevel,
    age_group: normalizeAgeGroup(form.ageGroup),
    gender: form.gender,
    job_type: normalizeJobType(form.jobGroup),
    work_nature: normalizeWorkNature(form.workNature),
    question_open: form.doctorQuestion.trim() || "Không có",
  };
}

function StageBanner({ image, alt }) {
  return (
    <section className="stage-banner">
      <img src={image} alt={alt} />
    </section>
  );
}

function ImageButton({ image, label, ...props }) {
  return (
    <button className="image-button" aria-label={label} {...props}>
      <img src={image} alt="" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function NoticeIcon({ state }) {
  if (state === "success") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M20 7 10 17l-6-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (state === "warning") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 4 21 20H3L12 4Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M12 9v4.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="17.2" r="1.1" fill="currentColor" />
      </svg>
    );
  }

  if (state === "error") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="m9 9 6 6M15 9l-6 6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 10.2v5.1"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7.4" r="1.1" fill="currentColor" />
    </svg>
  );
}

function getStatusNoticeMeta(state) {
  if (state === "success") {
    return {
      title: "Lưu thành công",
      badge: "Thành công",
    };
  }

  if (state === "warning") {
    return {
      title: "Đang chờ gửi lại",
      badge: "Tự động",
    };
  }

  if (state === "error") {
    return {
      title: "Không thể lưu lúc này",
      badge: "Cảnh báo",
    };
  }

  return {
    title: "Đang gửi dữ liệu",
    badge: "Đồng bộ",
  };
}

function StatusNotice({ state = "info", message }) {
  const meta = getStatusNoticeMeta(state);
  const role = state === "error" ? "alert" : "status";

  return (
    <div
      className={`status-notice status-notice--${state}`}
      role={role}
      aria-live="polite"
    >
      <span className="status-notice__rail" aria-hidden="true" />

      <div className="status-notice__icon">
        <NoticeIcon state={state} />
      </div>

      <div className="status-notice__copy">
        <div className="status-notice__topline">
          <strong>{meta.title}</strong>
          <span className="status-notice__badge">{meta.badge}</span>
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
}

function getSubmissionTone(submitState) {
  if (submitState === "success") {
    return "success";
  }

  if (submitState === "queued") {
    return "warning";
  }

  if (submitState === "error") {
    return "danger";
  }

  return "neutral";
}

function StageHeader({
  stage,
  answeredCount,
  requiredCount,
  submitState,
  totalScore,
}) {
  const stageDetail = STAGE_DETAILS[stage];

  return (
    <header className="flow-header">
      <div className="flow-header__copy">
        <span className="flow-header__eyebrow">{stageDetail.badge}</span>
        <h1>{stageDetail.title}</h1>
        <p>{stageDetail.description}</p>

        <div className="flow-header__meta">
          <span className="flow-chip">
            Bước {stageDetail.step}/3
          </span>
          {stage === "quiz" ? (
            <span className="flow-chip flow-chip--soft">
              {answeredCount}/10 câu đã trả lời
            </span>
          ) : null}
          {stage === "result" ? (
            <span className="flow-chip flow-chip--soft">{totalScore} điểm FAS</span>
          ) : null}
          {stage === "collect" ? (
            <span className="flow-chip flow-chip--soft">
              {requiredCount}/{PROFILE_FIELDS.length} mục bắt buộc
            </span>
          ) : null}
          <span className={`flow-chip flow-chip--${getSubmissionTone(submitState)}`}>
            {submitState === "saving"
              ? "Đang đồng bộ"
              : submitState === "queued"
                ? "Đang chờ gửi lại"
                : submitState === "success"
                  ? "Đã ghi nhận"
                  : submitState === "error"
                    ? "Cần kiểm tra lại"
                    : "Sẵn sàng"}
          </span>
        </div>
      </div>

      <div className="flow-steps" aria-label="Tiến trình bài test">
        {Object.entries(STAGE_DETAILS).map(([key, detail]) => {
          const isCurrent = key === stage;
          const isCompleted = detail.step < stageDetail.step;

          return (
            <div
              key={key}
              className={`flow-step${isCurrent ? " is-current" : ""}${
                isCompleted ? " is-completed" : ""
              }`}
            >
              <span className="flow-step__index">{detail.step}</span>
              <div className="flow-step__text">
                <strong>{detail.badge}</strong>
                <span>{key === "quiz" ? "Làm bài" : key === "result" ? "Xem kết quả" : "Hoàn tất lưu"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </header>
  );
}

function QuestionNavigator({ answers, onJump }) {
  const firstMissingIndex = answers.findIndex((answer) => answer === null);
  const unansweredCount = answers.filter((answer) => answer === null).length;

  return (
    <section className="card-panel question-map">
      <div className="question-map__header">
        <div>
          <strong>Đi nhanh đến câu cần trả lời</strong>
          <span>
            {unansweredCount === 0
              ? "Bạn đã hoàn thành đủ 10 câu. Có thể xem lại đáp án trước khi lấy kết quả."
              : `Còn ${unansweredCount} câu chưa chọn. Bạn có thể nhảy nhanh tới từng câu bên dưới.`}
          </span>
        </div>

        {firstMissingIndex >= 0 ? (
          <button
            type="button"
            className="ghost-button"
            onClick={() => onJump(QUESTIONS[firstMissingIndex].id)}
          >
            Đến câu tiếp theo
          </button>
        ) : (
          <span className="question-map__done">Đã hoàn tất</span>
        )}
      </div>

      <div className="question-map__grid">
        {QUESTIONS.map((question, questionIndex) => {
          const isAnswered = answers[questionIndex] !== null;

          return (
            <button
              key={question.id}
              type="button"
              className={`question-map__chip${isAnswered ? " is-answered" : ""}`}
              onClick={() => onJump(question.id)}
            >
              <span>{question.label}</span>
              <strong>{isAnswered ? "Đã chọn" : "Chưa chọn"}</strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BatteryMeter({ tone, value }) {
  const knobPosition = Math.max(8, Math.min(96, value * 100));

  return (
    <div className={`battery-meter battery-meter--${tone}`}>
      <div className="battery-meter__track">
        <div className="battery-meter__pointer" style={{ left: `${knobPosition}%` }} />
      </div>
    </div>
  );
}

function SignalIcon({ type }) {
  if (type === "energy") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M25 5 11 26h10l-3 17 19-24H27l-2-14Z" fill="currentColor" />
      </svg>
    );
  }

  if (type === "focus") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle
          cx="24"
          cy="24"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        <circle cx="24" cy="24" r="3.5" fill="currentColor" />
        <path
          d="M24 8v5M24 35v5M8 24h5M35 24h5"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M24 9c7 0 14 5 14 14 0 10-8 16-14 16S10 33 10 23C10 14 17 9 24 9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        d="M16 18c2 4 4 6 8 6s6-2 8-6"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 27c0 4-2 7-5 9M28 27c0 4 2 7 5 9"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function ChoiceOption({ option, optionIndex, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`choice-card${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(optionIndex)}
      aria-pressed={selected}
    >
      <div className="choice-card__image">
        <img
          src={selected ? option.selectedImage : option.defaultImage}
          alt=""
          aria-hidden="true"
        />
      </div>
      <span className="choice-card__label">{option.label}</span>
    </button>
  );
}

function QuestionCard({ question, questionIndex, answerIndex, onSelect }) {
  const selectedOption = getSelectedOption(answerIndex);

  return (
    <section
      className={`question-card${selectedOption ? " is-answered" : ""}`}
      id={question.id}
      data-question-id={question.id}
    >
      <div className="question-card__frame">
        <img src={questionFrameImage} alt="" aria-hidden="true" />
        <div className="question-card__content">
          <div className="question-card__meta">
            <span className="question-card__label">{question.label}</span>
            <span
              className={`question-card__status${
                selectedOption ? " is-answered" : " is-pending"
              }`}
            >
              {selectedOption ? `Đã chọn: ${selectedOption.label}` : "Chưa chọn đáp án"}
            </span>
          </div>
          <h2>{question.prompt}</h2>
          <span className="question-card__step">Câu hỏi {questionIndex + 1} trên 10</span>
        </div>
      </div>

      <div className="question-card__options">
        {ANSWER_OPTIONS.map((option, optionIndex) => (
          <ChoiceOption
            key={option.label}
            option={option}
            optionIndex={optionIndex}
            selected={answerIndex === optionIndex}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

function QuizScreen({
  answers,
  onAnswerChange,
  onShowResult,
  onJumpToQuestion,
  validationMessage,
}) {
  const answeredCount = answers.filter((answer) => answer !== null).length;
  const progress = (answeredCount / QUESTIONS.length) * 100;

  return (
    <div className="content-column">
      <StageBanner
        image={quizBanner}
        alt="Bạn đang ổn hay đang gồng mà chưa nhận ra?"
      />

      <section className="card-panel quiz-progress">
        <div className="quiz-progress__header">
          <div>
            <strong>{answeredCount}/10 câu đã trả lời</strong>
            <span>Hoàn thành bài test FAS để xem cơ thể bạn đang ở mức nào.</span>
          </div>
          <strong>{Math.round(progress)}%</strong>
        </div>

        <div className="quiz-progress__bar">
          <span style={{ width: `${progress}%` }} />
        </div>
      </section>

      <QuestionNavigator answers={answers} onJump={onJumpToQuestion} />

      <div className="questions-stack">
        {QUESTIONS.map((question, questionIndex) => (
          <QuestionCard
            key={question.id}
            question={question}
            questionIndex={questionIndex}
            answerIndex={answers[questionIndex]}
            onSelect={(optionIndex) => onAnswerChange(questionIndex, optionIndex)}
          />
        ))}
      </div>

      <div className="actions-center">
        {validationMessage ? (
          <StatusNotice state="error" message={validationMessage} />
        ) : null}

        <ImageButton
          type="button"
          image={resultButtonImage}
          label="Xem kết quả"
          onClick={onShowResult}
        />
      </div>
    </div>
  );
}

function ResultScreen({ totalScore, answers, onContinue, onRestart }) {
  const result = getResultConfig(totalScore);
  const topSignals = QUESTIONS.map((question, index) => {
    const selected = getSelectedOption(answers[index]);

    return {
      question: question.label,
      score: selected?.score ?? 0,
      answer: selected?.label ?? "",
    };
  })
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  return (
    <div className="content-column">
      <StageBanner image={resultBanner} alt="Kết quả của bạn" />

      <section className={`result-summary result-summary--${result.key}`}>
        <div className="result-summary__copy">
          <span className="section-ribbon">Kết luận hiện tại</span>
          <h1>{result.heroTitle}</h1>
          <p>{result.statusCopy}</p>
          <BatteryMeter tone={result.meterTone} value={result.meterValue} />

          <div className="result-summary__meta">
            <span>{totalScore} điểm FAS</span>
            <span>{result.meterLabel}</span>
          </div>
        </div>

        <div className="result-summary__art">
          <img src={result.mascotImage} alt="" aria-hidden="true" />
        </div>
      </section>

      <section className="info-card">
        <span className="section-ribbon">Điều đang xảy ra?</span>
        <p>{result.whatCopy}</p>

        <div className="signal-grid">
          {result.signals.map((signal) => (
            <div key={signal.title} className="signal-card">
              <div className="signal-card__icon">
                <SignalIcon type={signal.icon} />
              </div>
              <div className="signal-card__text">
                <strong>{signal.title}</strong>
                <span>{signal.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="warning-banner">{result.warning}</div>
      </section>

      <section className="support-grid">
        <article className="info-card">
          <span className="section-ribbon">Bắt đầu từ điều cơ bản</span>
          <ul className="habit-list">
            {result.habits.map((habit) => (
              <li key={habit}>{habit}</li>
            ))}
          </ul>
        </article>

        <article className="info-card info-card--accent">
          <span className="accent-card__badge">Quan trọng</span>
          <h2>Gợi ý hỗ trợ thêm</h2>
          <p>{result.supplement}</p>
        </article>
      </section>

      <section className="recovery-card">
        <span className="section-ribbon section-ribbon--light">
          Sau khi phục hồi đúng cách
        </span>
        <h2>{result.recoveryTitle}</h2>
        <p>{result.recoveryCopy}</p>

        <div className="recovery-card__stats">
          {topSignals.map((signal) => (
            <span key={signal.question}>
              {signal.question}: {signal.answer}
            </span>
          ))}
        </div>
      </section>

      <div className="actions-center">
        <ImageButton
          type="button"
          image={continueButtonImage}
          label="Xem tiếp"
          onClick={onContinue}
        />
        <button type="button" className="secondary-button" onClick={onRestart}>
          Làm lại bài test
        </button>
      </div>
    </div>
  );
}

function CollectScreen({
  form,
  onChange,
  onSubmit,
  onBack,
  onRestart,
  submitState,
  formMessage,
}) {
  const completedRequiredCount = PROFILE_FIELDS.filter((field) => form[field.id]).length;
  const requiredProgress = (completedRequiredCount / PROFILE_FIELDS.length) * 100;

  return (
    <div className="content-column">
      <StageBanner image={collectBanner} alt="Chia sẻ thông tin" />

      <section className="card-panel">
        <span className="section-ribbon">Chia sẻ thêm một chút</span>
        <p>
          Bạn đã biết mình đang “gồng” ở mức nào. Điền thêm thông tin để hệ thống ghi
          nhận và hỗ trợ tư vấn phù hợp hơn cho bạn.
        </p>
      </section>

      <section className="card-panel collect-progress">
        <div className="collect-progress__header">
          <strong>{completedRequiredCount}/{PROFILE_FIELDS.length} mục bắt buộc đã hoàn tất</strong>
          <span>
            Bạn có thể chỉnh sửa thoải mái trước khi xác nhận. Hệ thống sẽ ưu tiên phiên bản mới nhất.
          </span>
        </div>

        <div className="quiz-progress__bar">
          <span style={{ width: `${requiredProgress}%` }} />
        </div>

        <div className="trust-strip">
          <span className="trust-pill">Lưu tạm an toàn trên trình duyệt</span>
          <span className="trust-pill">Tự gửi lại nếu mạng chập chờn</span>
          <span className="trust-pill">Có thể quay lại sửa trước khi gửi</span>
        </div>
      </section>

      <form className="collect-form" onSubmit={onSubmit}>
        {PROFILE_FIELDS.map((field) => (
          <fieldset key={field.id} className="collect-card collect-group">
            <legend>{field.label}</legend>
            <div className="collect-group__options">
              {field.options.map((option) => {
                const checked = form[field.id] === option;

                return (
                  <label
                    key={option}
                    className={`select-chip${checked ? " is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name={field.id}
                      value={option}
                      checked={checked}
                      onChange={(event) => onChange(field.id, event.target.value)}
                    />
                    <span className="select-chip__box" />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <fieldset className="collect-card collect-group">
          <legend>
            Nếu có 1 điều bạn đang thắc mắc về tình trạng của mình, bạn muốn hỏi bác sĩ
            điều gì?
          </legend>
          <textarea
            name="doctorQuestion"
            value={form.doctorQuestion}
            onChange={(event) => onChange("doctorQuestion", event.target.value)}
            rows={5}
            placeholder="Nhập câu hỏi hoặc điều bạn đang quan tâm..."
          />
        </fieldset>

        {formMessage ? (
          <StatusNotice
            state={
              submitState === "error"
                ? "error"
                : submitState === "success"
                  ? "success"
                  : submitState === "queued"
                    ? "warning"
                    : "info"
            }
            message={formMessage}
          />
        ) : null}

        <div className="actions-center">
          <button
            type="submit"
            className="brand-button"
            disabled={submitState === "saving" || submitState === "success"}
          >
            {submitState === "saving"
              ? "Đang gửi..."
              : submitState === "success"
                ? "Đã ghi nhận"
                : submitState === "queued"
                  ? "Gửi lại ngay"
                  : submitState === "error"
                    ? "Thử gửi lại"
                    : "Xác nhận"}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={submitState === "success" ? onRestart : onBack}
          >
            {submitState === "success" ? "Làm lại bài test" : "Xem lại kết quả"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BeroccaFASQuiz() {
  const [initialState] = useState(() =>
    loadPersistedQuizState({
      questionCount: QUESTIONS.length,
      initialForm: INITIAL_FORM,
      calculateTotalScore,
    }),
  );
  const [stage, setStage] = useState(initialState.stage);
  const [answers, setAnswers] = useState(initialState.answers);
  const [form, setForm] = useState(initialState.form);
  const [submitState, setSubmitState] = useState("idle");
  const [formMessage, setFormMessage] = useState("");
  const [totalScore, setTotalScore] = useState(initialState.totalScore);
  const [sessionId, setSessionId] = useState(initialState.sessionId);
  const syncTimerRef = useRef(null);
  const isSyncingQueueRef = useRef(false);
  const flushSubmissionQueueRef = useRef(async () => {});
  const answeredCount = answers.filter((answer) => answer !== null).length;
  const requiredCount = PROFILE_FIELDS.filter((field) => form[field.id]).length;

  function clearScheduledSync() {
    if (typeof window === "undefined" || syncTimerRef.current === null) {
      return;
    }

    window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = null;
  }

  function scheduleSubmissionSync(delayMs = 0) {
    if (typeof window === "undefined") {
      return;
    }

    clearScheduledSync();
    syncTimerRef.current = window.setTimeout(() => {
      void flushSubmissionQueueRef.current();
    }, Math.max(0, delayMs));
  }

  const syncCurrentSessionSubmissionState = useEffectEvent(
    ({ preserveSavingState = true } = {}) => {
      if (stage !== "collect") {
        return;
      }

      if (hasAcknowledgedSession(sessionId)) {
      setSubmitState("success");
      setFormMessage(SUCCESS_SUBMISSION_MESSAGE);
      return;
    }

    const queuedSubmission = getQueuedSubmissionBySession(sessionId);

    if (!queuedSubmission) {
      if (
        submitState === "queued" &&
        formMessage === QUEUED_SUBMISSION_MESSAGE
      ) {
        setSubmitState("idle");
        setFormMessage("");
      }

      return;
    }

    if (preserveSavingState && submitState === "saving") {
      return;
    }

    if (queuedSubmission.isTerminalFailure) {
      setSubmitState("error");
      setFormMessage(TERMINAL_SUBMISSION_MESSAGE);
      return;
    }

      setSubmitState("queued");
      setFormMessage(QUEUED_SUBMISSION_MESSAGE);
    },
  );

  flushSubmissionQueueRef.current = async function flushSubmissionQueue({
    priorityId = null,
  } = {}) {
    if (isSyncingQueueRef.current) {
      if (priorityId) {
        scheduleSubmissionSync(800);
      }

      return;
    }

    clearScheduledSync();
    isSyncingQueueRef.current = true;
    let queueLease = null;

    try {
      queueLease = await acquireSubmissionQueueLease();

      if (!queueLease) {
        if (priorityId) {
          scheduleSubmissionSync(1000);
        }

        return;
      }

      let nextPriorityId = priorityId;

      while (true) {
        if (!queueLease.renew()) {
          scheduleSubmissionSync(1000);
          return;
        }

        const queuedSubmissions = readQueuedSubmissions();

        if (queuedSubmissions.length === 0) {
          return;
        }

        const now = Date.now();
        const prioritizedSubmission =
          nextPriorityId === null
            ? null
            : queuedSubmissions.find((entry) => entry.id === nextPriorityId);
        const nextSubmission =
          prioritizedSubmission ??
          queuedSubmissions.find(
            (entry) => !entry.isTerminalFailure && entry.nextAttemptAt <= now,
          );

        if (!nextSubmission) {
          const nextRetryableSubmission = queuedSubmissions.find(
            (entry) => !entry.isTerminalFailure,
          );

          if (nextRetryableSubmission) {
            scheduleSubmissionSync(
              Math.max(750, nextRetryableSubmission.nextAttemptAt - now),
            );
          }

          return;
        }

        if (hasAcknowledgedSession(nextSubmission.sessionId)) {
          await removeQueuedSubmissionById(nextSubmission.id);
          nextPriorityId = null;
          continue;
        }

        try {
          await submitQueuedPayload({
            url: APPS_SCRIPT_URL,
            payload: nextSubmission.payload,
          });

          await markSessionAcknowledged({
            sessionId: nextSubmission.sessionId,
            submissionId: nextSubmission.id,
          });

          if (nextSubmission.sessionId === sessionId) {
            setSubmitState("success");
            setFormMessage(SUCCESS_SUBMISSION_MESSAGE);
          }

          nextPriorityId = null;
        } catch (error) {
          console.error(error);

          const attempts = (nextSubmission.attempts ?? 0) + 1;
          const retryable = error?.retryable !== false;
          const retryDelayMs = retryable
            ? getRetryDelayMs(attempts)
            : getTerminalFailureRetryDelayMs();

          await updateQueuedSubmission({
            ...nextSubmission,
            attempts,
            updatedAt: new Date().toISOString(),
            nextAttemptAt: Date.now() + retryDelayMs,
            lastError:
              error instanceof Error ? error.message : "Unknown submission error",
            lastStatusCode: Number.isFinite(error?.statusCode) ? error.statusCode : 0,
            isTerminalFailure: !retryable,
          });

          if (nextSubmission.sessionId === sessionId) {
            if (retryable) {
              setSubmitState("queued");
              setFormMessage(QUEUED_SUBMISSION_MESSAGE);
            } else {
              setSubmitState("error");
              setFormMessage(TERMINAL_SUBMISSION_MESSAGE);
            }
          }

          if (retryable) {
            scheduleSubmissionSync(retryDelayMs);
          }

          return;
        }
      }
    } finally {
      queueLease?.release();
      isSyncingQueueRef.current = false;
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage]);

  useEffect(() => {
    if (submitState === "success") {
      clearPersistedQuizState();
      return;
    }

    persistQuizState({
      stage,
      answers,
      form,
      totalScore,
      sessionId,
      initialForm: INITIAL_FORM,
    });
  }, [answers, form, sessionId, stage, submitState, totalScore]);

  useEffect(() => {
    syncCurrentSessionSubmissionState();
  }, [formMessage, sessionId, stage, submitState]);

  useEffect(() => {
    const unsubscribe = subscribeToSubmissionPersistence(() => {
      syncCurrentSessionSubmissionState({ preserveSavingState: false });
    });

    return unsubscribe;
  }, [formMessage, sessionId, stage, submitState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function handleOnline() {
      void flushSubmissionQueueRef.current();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void flushSubmissionQueueRef.current();
      }
    }

    void flushSubmissionQueueRef.current();

    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (syncTimerRef.current !== null) {
        window.clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }

      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  function handleAnswerChange(questionIndex, optionIndex) {
    setAnswers((currentAnswers) => {
      const nextAnswers = [...currentAnswers];
      nextAnswers[questionIndex] = optionIndex;
      return nextAnswers;
    });

    setFormMessage("");
  }

  function handleJumpToQuestion(questionId) {
    document.getElementById(questionId)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  function handleShowResult() {
    const firstMissingIndex = answers.findIndex((answer) => answer === null);

    if (firstMissingIndex >= 0) {
      const firstMissingQuestion = QUESTIONS[firstMissingIndex];
      setFormMessage("Bạn cần hoàn thành đủ 10 câu trước khi xem kết quả.");
      document.getElementById(firstMissingQuestion.id)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    const score = calculateTotalScore(answers);

    setTotalScore(score);
    setFormMessage("");
    setStage("result");
  }

  function handleFormChange(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    if (getQueuedSubmissionBySession(sessionId)) {
      void removeQueuedSubmissionBySession(sessionId);
    }

    if (submitState === "queued" || formMessage === TERMINAL_SUBMISSION_MESSAGE) {
      setSubmitState("idle");
    }

    setFormMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const missingField = PROFILE_FIELDS.find((field) => !form[field.id]);

    if (missingField) {
      setSubmitState("error");
      setFormMessage("Bạn vui lòng chọn đủ các mục bắt buộc trước khi xác nhận.");
      return;
    }

    if (hasAcknowledgedSession(sessionId)) {
      setSubmitState("success");
      setFormMessage(SUCCESS_SUBMISSION_MESSAGE);
      return;
    }

    const result = getResultConfig(totalScore);
    const existingQueuedSubmission = getQueuedSubmissionBySession(sessionId);
    const submissionId = existingQueuedSubmission?.id ?? createSubmissionId();
    const payload = buildQuizSubmissionPayload({
      answers,
      form,
      result,
      totalScore,
      sessionId,
      submissionId,
    });

    try {
      setSubmitState("saving");
      setFormMessage("Đang gửi dữ liệu...");

      await upsertQueuedSubmission({
        id: submissionId,
        sessionId,
        payload,
        attempts: 0,
        queuedAt: existingQueuedSubmission?.queuedAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nextAttemptAt: Date.now(),
        lastError: "",
        lastStatusCode: 0,
        isTerminalFailure: false,
      });

      await flushSubmissionQueueRef.current({ priorityId: submissionId });

      const latestQueuedSubmission = getQueuedSubmissionBySession(sessionId);

      if (latestQueuedSubmission?.id === submissionId) {
        if (latestQueuedSubmission.isTerminalFailure) {
          setSubmitState("error");
          setFormMessage(TERMINAL_SUBMISSION_MESSAGE);
        } else {
          setSubmitState("queued");
          setFormMessage(QUEUED_SUBMISSION_MESSAGE);
        }

        return;
      }

      if (hasAcknowledgedSession(sessionId)) {
        setSubmitState("success");
        setFormMessage(SUCCESS_SUBMISSION_MESSAGE);
        return;
      }

      setSubmitState("queued");
      setFormMessage(QUEUED_SUBMISSION_MESSAGE);
    } catch (error) {
      console.error(error);
      setSubmitState("error");
      setFormMessage("Không thể chuẩn bị dữ liệu để gửi. Bạn thử lại giúp mình nhé.");
    }
  }

  function handleRestart() {
    void removeQueuedSubmissionBySession(sessionId);
    void clearAcknowledgedSession(sessionId);
    clearPersistedQuizState();
    setAnswers(createInitialAnswers());
    setForm({ ...INITIAL_FORM });
    setSubmitState("idle");
    setFormMessage("");
    setTotalScore(0);
    setSessionId(createSessionId());
    setStage("quiz");
  }

  return (
    <main className="page-shell">
      <div className="page-frame">
        <StageHeader
          stage={stage}
          answeredCount={answeredCount}
          requiredCount={requiredCount}
          submitState={submitState}
          totalScore={totalScore}
        />

        {stage === "quiz" ? (
          <QuizScreen
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onJumpToQuestion={handleJumpToQuestion}
            onShowResult={handleShowResult}
            validationMessage={formMessage}
          />
        ) : null}

        {stage === "result" ? (
          <ResultScreen
            totalScore={totalScore}
            answers={answers}
            onContinue={() => setStage("collect")}
            onRestart={handleRestart}
          />
        ) : null}

        {stage === "collect" ? (
          <CollectScreen
            form={form}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onBack={() => setStage("result")}
            onRestart={handleRestart}
            submitState={submitState}
            formMessage={formMessage}
          />
        ) : null}
      </div>
    </main>
  );
}

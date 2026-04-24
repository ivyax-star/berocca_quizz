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
    meterLabel: "Vẫn ổn",
    meterValue: 0.82,
    meterTone: "green",
    mascotImage: answer5Selected,
    statusCopy:
      "Bạn vẫn đang làm tốt mỗi ngày - chưa có gì khiến bạn phải “đuối”.",
    whatCopy:
      "Cơ thể vẫn đang tiêu hao năng lượng và vi chất để giữ cho bạn ở trạng thái này.",
    insightNote:
      "Nếu không phục hồi sớm, sự thiếu hụt sẽ tích lại và đến một lúc, bạn sẽ phải “gồng” mà không kịp nhận ra.",
    signals: [
      { icon: "energy", title: "Năng lượng", value: "Bắt đầu giảm" },
      { icon: "focus", title: "Tập trung", value: "Vẫn ổn định" },
      { icon: "body", title: "Thể chất", value: "Bắt đầu mệt" },
    ],
    warning: "Hãy chủ động phục hồi thể chất và tinh thần từ sớm!",
    habits: [
      "Ăn uống cân bằng và đa dạng",
      "Vận động thường xuyên",
      "Ngủ đủ và sâu hơn",
    ],
    supplement:
      "Bổ sung vitamin và khoáng chất trong trường hợp thiếu hụt (như chế độ ăn không đa dạng) và tăng nhu cầu (như làm việc cường độ cao) để cải thiện sức khỏe tinh thần như giảm căng thẳng và bớt mệt mỏi.",
    recoveryTitle: "Khi cơ thể được phục hồi đúng cách",
    recoveryCopy:
      "Bạn sẽ không cần gồng mà vẫn luôn sẵn sàng để đón mọi thứ phía trước!",
    recoveryPoints: [
      "Việc đến, bạn đón.",
      "Áp lực đến, bạn xử lý.",
      "Nhịp sống vẫn chạy, bạn vẫn tận hưởng từng khoảnh khắc.",
    ],
  },
  {
    key: "fatigue",
    min: 22,
    max: 34,
    heroTitle: "Gồng thấy rõ!",
    meterLabel: "Mệt mỏi",
    meterValue: 0.48,
    meterTone: "yellow",
    mascotImage: answer3Selected,
    statusCopy:
      "Bạn bắt đầu cảm nhận rõ sự mệt mỏi. Không còn là “cũng ổn” nữa mà đã có những lúc đuối, mất tập trung hoặc thiếu năng lượng để duy trì nhịp làm việc như trước.",
    whatCopy:
      "Đây là dấu hiệu cơ thể đang tiêu hao nhiều hơn mức có thể phục hồi.",
    insightNote:
      "Khi năng lượng và vi chất không được bổ sung đầy đủ, thể chất xuống trước, tinh thần chậm theo sau và bạn phải “gồng” để ở trạng thái bình thường mỗi ngày.",
    signals: [
      { icon: "energy", title: "Năng lượng", value: "Đang giảm" },
      { icon: "focus", title: "Tập trung", value: "Không ổn định" },
      { icon: "body", title: "Thể chất", value: "Bắt đầu mệt" },
    ],
    warning:
      "Đừng để tình trạng này kéo dài. Hãy chủ động phục hồi thể chất và tinh thần càng sớm càng tốt.",
    habits: [
      "Ăn uống cân bằng và đa dạng",
      "Vận động thường xuyên",
      "Ngủ đủ và sâu hơn",
    ],
    supplement:
      "Bổ sung vitamin và khoáng chất trong trường hợp thiếu hụt (như chế độ ăn không đa dạng) và tăng nhu cầu (như làm việc cường độ cao) để cải thiện sức khỏe tinh thần như giảm căng thẳng và bớt mệt mỏi.",
    recoveryTitle: "Khi cơ thể được phục hồi đúng cách",
    recoveryCopy:
      "Bạn sẽ không cần gồng để vượt qua mà đủ sức để đón lấy!",
    recoveryPoints: [
      "Việc vẫn đến nhưng bạn không còn bị cuốn theo.",
      "Áp lực vẫn có nhưng bạn xử lý nhanh hơn.",
      "Nhịp sống vẫn chạy, bạn vẫn tận hưởng từng khoảnh khắc.",
    ],
  },
  {
    key: "extreme-fatigue",
    min: 35,
    max: 50,
    heroTitle: "Gồng quá mức!",
    meterLabel: "Quá tải",
    meterValue: 0.16,
    meterTone: "red",
    mascotImage: answer2Selected,
    statusCopy:
      "Bạn đang ở trạng thái mệt mỏi rõ rệt. Năng lượng giảm sâu, cơ thể dễ đuối, tinh thần khó tập trung và mọi thứ bắt đầu trở nên nặng nề hơn bình thường.",
    whatCopy:
      "Đây là dấu hiệu cho thấy cơ thể đã tiêu hao vượt quá khả năng phục hồi.",
    insightNote:
      "Khi tình trạng này kéo dài, không chỉ hiệu suất giảm mà cả sức khỏe cũng sẽ bị ảnh hưởng.",
    signals: [
      { icon: "energy", title: "Năng lượng", value: "Cạn kiệt" },
      { icon: "focus", title: "Tập trung", value: "Không ổn định" },
      { icon: "body", title: "Thể chất", value: "Mệt mỏi rõ rệt" },
    ],
    warning:
      "Đừng tiếp tục “gồng” thêm nữa! Bạn cần phục hồi một cách nghiêm túc và đúng cách ngay lúc này.",
    habits: [
      "Ăn uống cân bằng và đa dạng",
      "Vận động thường xuyên",
      "Ngủ đủ và sâu hơn",
    ],
    supplement:
      "Bổ sung vitamin và khoáng chất trong trường hợp thiếu hụt (như chế độ ăn không đa dạng) và tăng nhu cầu (như làm việc cường độ cao) để cải thiện sức khỏe tinh thần như giảm căng thẳng và bớt mệt mỏi.",
    supportNote:
      "Lưu ý: Nếu tình trạng mệt mỏi kéo dài hoặc ảnh hưởng nhiều đến sinh hoạt, bạn nên tìm đến chuyên gia y tế để được tư vấn phù hợp.",
    recoveryTitle: "Khi cơ thể được phục hồi đúng cách",
    recoveryCopy:
      "Bạn sẽ không cần gồng để vượt qua mà đủ sức để đón lấy!",
    recoveryPoints: [
      "Việc vẫn đến nhưng bạn không còn quá tải.",
      "Áp lực vẫn có nhưng bạn không còn kiệt sức.",
      "Nhịp sống vẫn chạy, bạn vẫn tận hưởng từng khoảnh khắc.",
    ],
  },
];

const INITIAL_FORM = {
  ageGroup: "",
  gender: "",
  jobGroup: "",
  workNature: "",
  doctorQuestion: "",
};

const QUIZ_HERO_CONTENT = {
  lead:
    "Mệt mỏi, căng thẳng không đến một lần mà tích luỹ mỗi ngày khi cơ thể tiêu hao năng lượng và vi chất nhưng không được phục hồi kịp thời. Khi việc phục hồi chậm lại, thể chất xuống trước, tinh thần chậm theo sau và bạn bắt đầu “gồng” lúc nào không hay.",
  highlight: "Đa số chúng ta chỉ nhận ra khi đã gồng quá lâu!",
  cta:
    "Test nhanh 2 phút với 10 câu hỏi để biết cơ thể bạn đang thật sự ổn — hay chỉ đang gồng?",
  footnote:
    "*Bài test được xây dựng dựa trên thang đo mệt mỏi FAS (Fatigue Assessment Scale) của Michielsen và cộng sự - một công cụ đã được nghiên cứu và sử dụng rộng rãi.",
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

function getResultBannerHeadline(resultKey) {
  if (resultKey === "stable") {
    return "VẪN ỔN\nCHƯA GỒNG";
  }

  if (resultKey === "fatigue") {
    return "GỒNG THẤY RÕ";
  }

  if (resultKey === "extreme-fatigue") {
    return "GỒNG QUÁ MỨC!";
  }

  return "";
}

function getCollectFieldLabelMeta(label) {
  const required = label.includes("*");

  return {
    text: label.replace(/\s*\*\s*$/, "").trim(),
    required,
  };
}

function getCollectOptionsLayout(fieldId) {
  if (fieldId === "ageGroup" || fieldId === "gender") {
    return "inline";
  }

  return "split";
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

function QuizHeroSection() {
  return (
    <section className="quiz-hero">
      <div className="quiz-hero__media">
        <img
          src={quizBanner}
          alt="Bạn đang ổn hay đang gồng mà chưa nhận ra?"
        />
      </div>

      <div className="quiz-hero__body">
        <div className="quiz-hero__copy">
          <p className="quiz-hero__lead">{QUIZ_HERO_CONTENT.lead}</p>
          <p className="quiz-hero__highlight">{QUIZ_HERO_CONTENT.highlight}</p>
          <p className="quiz-hero__cta">{QUIZ_HERO_CONTENT.cta}</p>
        </div>
        <p className="quiz-hero__footnote">{QUIZ_HERO_CONTENT.footnote}</p>
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

function QuestionCard({ question, answerIndex, onSelect }) {
  const selectedOption = getSelectedOption(answerIndex);

  return (
    <section
      className={`question-card${selectedOption ? " is-answered" : ""}`}
      id={question.id}
      data-question-id={question.id}
    >
      <div
        className="question-card__frame"
        style={{ backgroundImage: `url(${questionFrameImage})` }}
      >
        <div className="question-card__overlay">
          <div className="question-card__header">
            <div className="question-card__meta">
              <span className="question-card__label">{question.label}</span>
            </div>

            <div className="question-card__content">
              <h2>{question.prompt}</h2>
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
        </div>
      </div>
    </section>
  );
}

function QuizScreen({
  answers,
  onAnswerChange,
  onShowResult,
  validationMessage,
}) {
  return (
    <div className="content-column">
      <QuizHeroSection />

      <div className="questions-stack">
        {QUESTIONS.map((question, questionIndex) => (
          <QuestionCard
            key={question.id}
            question={question}
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

function ResultScreen({ totalScore, onContinue, onRestart }) {
  const result = getResultConfig(totalScore);
  const bannerHeadline = getResultBannerHeadline(result.key);

  return (
    <div className="content-column content-column--result">
      <section className="result-hero-banner">
        <img src={resultBanner} alt="Kết quả của bạn" />
        <div className="result-hero-banner__copy">
          <h1>{bannerHeadline}</h1>
        </div>
      </section>

      <section
        className="result-block result-block--framed result-block--status"
        style={{ "--result-frame-image": `url(${questionFrameImage})` }}
      >
        <div className="result-block__header">
          <h2>Tình trạng hiện tại của bạn</h2>
        </div>

        <div className="result-block__body result-block__body--soft">
          <p className="result-block__paragraph">{result.statusCopy}</p>
        </div>
      </section>

      <section
        className="result-block result-block--framed result-block--insight"
        style={{ "--result-frame-image": `url(${questionFrameImage})` }}
      >
        <div className="result-block__header">
          <h2>Điều đang xảy ra?</h2>
        </div>

        <div className="result-block__body result-block__body--soft">
          <p className="result-block__paragraph result-block__paragraph--lead">
            {result.whatCopy}
          </p>

          <div className="result-signal-row">
            {result.signals.map((signal) => (
              <div key={signal.title} className="result-signal">
                <div className="result-signal__icon">
                  <SignalIcon type={signal.icon} />
                </div>
                <div className="result-signal__text">
                  <strong>{signal.title}:</strong>
                  <span>{signal.value}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="result-block__paragraph">{result.insightNote}</p>

          <div className="result-alert">
            <div className="result-alert__icon" aria-hidden="true">
              !
            </div>
            <p>{result.warning}</p>
          </div>
        </div>
      </section>

      <section className="result-support-layout">
        <article className="result-basic-card">
          <h2>Bắt đầu từ những điều cơ bản:</h2>
          <ul className="result-basic-list">
            {result.habits.map((habit) => (
              <li key={habit}>{habit}</li>
            ))}
          </ul>
        </article>

        <article className="result-important-card">
          <div className="result-important-card__header">
            <span>Quan trọng</span>
          </div>

          <div className="result-important-card__body">
            <div className="result-important-card__copy">
              <p>{result.supplement}</p>
              {result.supportNote ? (
                <p className="result-important-card__note">{result.supportNote}</p>
              ) : null}
            </div>

            <div className="result-vitamin-cluster" aria-hidden="true">
              <span className="result-vitamin-cluster__center">
                CÁC VITAMIN
                <small>& KHOÁNG CHẤT</small>
              </span>
              <span className="result-vitamin-cluster__bubble result-vitamin-cluster__bubble--b">
                B
              </span>
              <span className="result-vitamin-cluster__bubble result-vitamin-cluster__bubble--c">
                C
              </span>
              <span className="result-vitamin-cluster__bubble result-vitamin-cluster__bubble--zn">
                KẼM
              </span>
              <span className="result-vitamin-cluster__bubble result-vitamin-cluster__bubble--mg">
                MAGIE
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="result-recovery-panel">
        <div className="result-recovery-panel__copy">
          <h2>{result.recoveryTitle}</h2>
          <p>{result.recoveryCopy}</p>

          <ul className="result-recovery-panel__points">
            {result.recoveryPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="result-recovery-panel__art">
          <img src={answer5Selected} alt="" aria-hidden="true" />
        </div>
      </section>

      <div className="actions-center result-actions">
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
  return (
    <div className="content-column content-column--collect">
      <StageBanner image={collectBanner} alt="Chia sẻ thông tin" />

      <section className="collect-intro">
        <p>
          Bạn đã biết mình đang “gồng” ở mức nào. Chia sẻ thêm một chút để nhận tư
          vấn phù hợp hơn cho chính bạn và có cơ hội được bác sĩ giải đáp trực tiếp
          trong buổi hội thảo.
        </p>
      </section>

      <form className="collect-form" onSubmit={onSubmit}>
        {PROFILE_FIELDS.map((field) => {
          const labelMeta = getCollectFieldLabelMeta(field.label);
          const optionsLayout = getCollectOptionsLayout(field.id);

          return (
            <fieldset key={field.id} className={`collect-group collect-group--${field.id}`}>
              <legend className="collect-group__legend">
                <span className="collect-group__accent" aria-hidden="true" />
                <span className="collect-group__legend-text">{labelMeta.text}</span>
                {labelMeta.required ? (
                  <span className="collect-group__required">*</span>
                ) : null}
              </legend>

              <div className="collect-group__rule" />

              <div
                className={`collect-group__options collect-group__options--${optionsLayout}`}
              >
              {field.options.map((option) => {
                const checked = form[field.id] === option;

                return (
                  <label
                    key={option}
                    className={`collect-choice${checked ? " is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name={field.id}
                      value={option}
                      checked={checked}
                      onChange={(event) => onChange(field.id, event.target.value)}
                    />
                    <span className="collect-choice__box" />
                    <span className="collect-choice__label">{option}</span>
                  </label>
                );
              })}
              </div>
            </fieldset>
          );
        })}

        <fieldset className="collect-group collect-group--question">
          <legend className="collect-group__legend collect-group__legend--plain">
            <span className="collect-group__legend-text">
              Nếu có 1 điều bạn đang thắc mắc về tình trạng của mình, bạn muốn hỏi bác sĩ
              điều gì?
            </span>
          </legend>
          <div className="collect-group__rule" />
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

        <div className="actions-center actions-center--collect">
          <button
            type="submit"
            className="collect-submit-button"
            disabled={submitState === "saving" || submitState === "success"}
          >
            <span>
              {submitState === "saving"
                ? "Đang gửi..."
                : submitState === "success"
                  ? "Đã ghi nhận"
                  : submitState === "queued"
                    ? "Gửi lại ngay"
                    : submitState === "error"
                      ? "Thử gửi lại"
                      : "Xác nhận"}
            </span>
          </button>

          <button
            type="button"
            className="secondary-button collect-secondary-button"
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
        {stage === "quiz" ? (
          <QuizScreen
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onShowResult={handleShowResult}
            validationMessage={formMessage}
          />
        ) : null}

        {stage === "result" ? (
          <ResultScreen
            totalScore={totalScore}
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

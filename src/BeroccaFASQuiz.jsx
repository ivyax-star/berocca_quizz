import { memo, useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import quizBanner from "./Element/Top Banner/1/top baner 1.png";
import stableResultBanner from "./Element/Top Banner/top banner KETQUA 1 960X350 co text.png";
import fatigueResultBanner from "./Element/Top Banner/top banner KETQUA 2 960X350 co text.png";
import extremeFatigueResultBanner from "./Element/Top Banner/top banner KETQUA 3 960X350 co text.png";
import collectBanner from "./Element/Top Banner/3/top banner 3.png";
import resultButtonImage from "./Element/Button/btn 1 KQ.png";
import continueButtonImage from "./Element/Button/btn 2 xem tep.png";
import collectSubmitButtonImage from "./Element/Button/button xac nhan.png";
import quizPageBackgroundImage from "./Element/Background/BG.jpg";
import quizHeroGradientImage from "./Element/Background/Bg gradient.png";
import quizFooterImage from "./Element/footer.png";
import questionFrameImage from "./Element/shape no shadow.jpg";
import answer1Default from "./Element/Emo BW/emo 1.png";
import answer1Selected from "./Element/Emopick/emo 1.png";
import answer2Default from "./Element/Emo BW/emo 2.png";
import answer2Selected from "./Element/Emopick/emo 2.png";
import answer3Default from "./Element/Emo BW/emo 3.png";
import answer3Selected from "./Element/Emopick/emo 3.png";
import answer4Default from "./Element/Emo BW/emo 4.png";
import answer4Selected from "./Element/Emopick/emo 4.png";
import answer5Default from "./Element/Emo BW/emo 5.png";
import answer5Selected from "./Element/Emopick/emo 5.png";
import recoveryMascotImage from "./Element/emo 6.png";
import basicTitleImage from "./Element/Headline/text 1.png";
import importantTitleImage from "./Element/Headline/text 2.png";
import recoveryTitleImage from "./Element/Headline/text 3.png";
import vitaminClusterImage from "./Element/cac chat copy.png";
import alertIconImage from "./Element/icon.png";
import supportNoteIconImage from "./Element/icon 2.png";
import bulletImage from "./Element/bullet.png";
import happeningEnergyImage from "./Element/Happening/a2.png";
import happeningFocusImage from "./Element/Happening/b2.png";
import happeningBodyImage from "./Element/Happening/c2.png";
import basicHabit1Icon from "./Element/Dieu co ban/hd1.png";
import basicHabit2Icon from "./Element/Dieu co ban/hd 2.png";
import basicHabit3Icon from "./Element/Dieu co ban/hd 3.png";
import checklistImage from "./Element/Dieu co ban/checklist.png";
import {
  acquireSubmissionQueueLease,
  clearAcknowledgedSession,
  clearPersistedQuizState,
  createSessionId,
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

function createImageAsset(src, width, height) {
  return { src, width, height };
}

const QUIZ_BANNER_IMAGE = createImageAsset(quizBanner, 960, 350);
const RESULT_STABLE_BANNER_IMAGE = createImageAsset(stableResultBanner, 960, 350);
const RESULT_FATIGUE_BANNER_IMAGE = createImageAsset(fatigueResultBanner, 960, 350);
const RESULT_EXTREME_BANNER_IMAGE = createImageAsset(
  extremeFatigueResultBanner,
  960,
  350,
);
const COLLECT_BANNER_IMAGE = createImageAsset(collectBanner, 960, 350);
const RESULT_BUTTON_IMAGE = createImageAsset(resultButtonImage, 290, 62);
const CONTINUE_BUTTON_IMAGE = createImageAsset(continueButtonImage, 290, 62);
const COLLECT_SUBMIT_BUTTON_IMAGE = createImageAsset(
  collectSubmitButtonImage,
  290,
  63,
);
const QUIZ_PAGE_BACKGROUND_IMAGE = createImageAsset(
  quizPageBackgroundImage,
  1920,
  1473,
);
const QUIZ_HERO_GRADIENT_IMAGE = createImageAsset(quizHeroGradientImage, 962, 276);
const QUIZ_FOOTER_IMAGE = createImageAsset(quizFooterImage, 960, 120);
const QUESTION_FRAME_IMAGE = createImageAsset(questionFrameImage, 720, 222);
const ANSWER_1_DEFAULT_IMAGE = createImageAsset(answer1Default, 400, 350);
const ANSWER_1_SELECTED_IMAGE = createImageAsset(answer1Selected, 400, 350);
const ANSWER_2_DEFAULT_IMAGE = createImageAsset(answer2Default, 400, 350);
const ANSWER_2_SELECTED_IMAGE = createImageAsset(answer2Selected, 400, 350);
const ANSWER_3_DEFAULT_IMAGE = createImageAsset(answer3Default, 400, 350);
const ANSWER_3_SELECTED_IMAGE = createImageAsset(answer3Selected, 400, 350);
const ANSWER_4_DEFAULT_IMAGE = createImageAsset(answer4Default, 400, 350);
const ANSWER_4_SELECTED_IMAGE = createImageAsset(answer4Selected, 400, 350);
const ANSWER_5_DEFAULT_IMAGE = createImageAsset(answer5Default, 400, 350);
const ANSWER_5_SELECTED_IMAGE = createImageAsset(answer5Selected, 400, 350);
const RECOVERY_MASCOT_IMAGE = createImageAsset(recoveryMascotImage, 280, 250);
const BASIC_TITLE_IMAGE = createImageAsset(basicTitleImage, 404, 100);
const IMPORTANT_TITLE_IMAGE = createImageAsset(importantTitleImage, 334, 100);
const RECOVERY_TITLE_IMAGE = createImageAsset(recoveryTitleImage, 892, 54);
const VITAMIN_CLUSTER_IMAGE = createImageAsset(vitaminClusterImage, 169, 186);
const ALERT_ICON_IMAGE = createImageAsset(alertIconImage, 120, 120);
const SUPPORT_NOTE_ICON_IMAGE = createImageAsset(supportNoteIconImage, 43, 36);
const BULLET_IMAGE = createImageAsset(bulletImage, 23, 11);
const HAPPENING_ENERGY_IMAGE = createImageAsset(happeningEnergyImage, 248, 101);
const HAPPENING_FOCUS_IMAGE = createImageAsset(happeningFocusImage, 249, 101);
const HAPPENING_BODY_IMAGE = createImageAsset(happeningBodyImage, 232, 101);
const CHECKLIST_IMAGE = createImageAsset(checklistImage, 34, 28);
const BASIC_HABIT_ICONS = [
  createImageAsset(basicHabit1Icon, 50, 50),
  createImageAsset(basicHabit2Icon, 50, 50),
  createImageAsset(basicHabit3Icon, 50, 50),
];
const HAPPENING_SIGNAL_IMAGES = {
  energy: HAPPENING_ENERGY_IMAGE,
  focus: HAPPENING_FOCUS_IMAGE,
  body: HAPPENING_BODY_IMAGE,
};

const SEO_URL = "https://www.berocca.com.vn/thang-do-met-moi-FAS";
const SEO_TITLE =
  "Ki\u1ec3m tra c\u01a1 th\u1ec3 b\u1ea1n \u0111ang th\u1eadt s\u1ef1 \u1ed5n \u2014 hay ch\u1ec9 \u0111ang g\u1ed3ng?";
const SEO_DESCRIPTION =
  "\u0110a s\u1ed1 ch\u00fang ta ch\u1ec9 nh\u1eadn ra khi \u0111\u00e3 g\u1ed3ng qu\u00e1 l\u00e2u! Test nhanh 2 ph\u00fat v\u1edbi 10 c\u00e2u h\u1ecfi \u0111\u1ec3 bi\u1ebft c\u01a1 th\u1ec3 b\u1ea1n \u0111ang th\u1eadt s\u1ef1 \u1ed5n \u2014 hay ch\u1ec9 \u0111ang g\u1ed3ng?";
const SEO_H1 =
  "Ki\u1ec3m tra t\u00ecnh tr\u1ea1ng c\u0103ng th\u1eb3ng m\u1ec7t m\u1ecfi";
const QUIZ_BANNER_ALT = SEO_H1;
const RESULT_BANNER_ALT = "Kết quả tình trạng căng thẳng mệt mỏi";
const COLLECT_BANNER_ALT = "Thông tin tư vấn tình trạng căng thẳng mệt mỏi";
const SITE_FOOTER_LINKS = [
  {
    label: "Liên hệ",
    href: "https://www.berocca.com.vn/contact-us",
  },
  {
    label: "Chính Sách Bảo Mật Thông Tin",
    href: "https://www.berocca.com.vn/chinh-sach-bao-mat-thong-tin",
  },
  {
    label: "Điều khoản sử dụng",
    href: "https://www.berocca.com.vn/conditions-of-use",
  },
];

const APPS_SCRIPT_URL =
  import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbwR8H6Srd-eePVeQtncO6aICkBynA_cBquP3U6zRdV0wBLsZt8tDc0b7IKNT3OplKYAIQ/exec";

const SECRET_TOKEN =
  import.meta.env.VITE_GOOGLE_APPS_SCRIPT_TOKEN ?? "berocca2024xyz";

const SUCCESS_SUBMISSION_MESSAGE = "Thông tin đã được lưu thành công.";
const QUEUED_SUBMISSION_MESSAGE =
  "Máy chủ đang bận nên dữ liệu của bạn đã được giữ tạm an toàn và sẽ tự gửi lại khi ổn định.";
const TERMINAL_SUBMISSION_MESSAGE =
  "Hệ thống lưu dữ liệu đang gặp lỗi cấu hình. Dữ liệu vẫn được giữ trên trình duyệt để gửi lại sau.";

const QUIZ_RESULT_SUBMISSION_PHASE = "quiz_result";
const COLLECT_INFO_SUBMISSION_PHASE = "collect_info";

const ANSWER_OPTIONS = [
  {
    label: "Luôn luôn",
    score: 5,
    defaultImage: ANSWER_1_DEFAULT_IMAGE,
    selectedImage: ANSWER_1_SELECTED_IMAGE,
  },
  {
    label: "Thường xuyên",
    score: 4,
    defaultImage: ANSWER_2_DEFAULT_IMAGE,
    selectedImage: ANSWER_2_SELECTED_IMAGE,
  },
  {
    label: "Thỉnh thoảng",
    score: 3,
    defaultImage: ANSWER_3_DEFAULT_IMAGE,
    selectedImage: ANSWER_3_SELECTED_IMAGE,
  },
  {
    label: "Ít khi",
    score: 2,
    defaultImage: ANSWER_4_DEFAULT_IMAGE,
    selectedImage: ANSWER_4_SELECTED_IMAGE,
  },
  {
    label: "Không bao giờ",
    score: 1,
    defaultImage: ANSWER_5_DEFAULT_IMAGE,
    selectedImage: ANSWER_5_SELECTED_IMAGE,
  },
];

const ANSWER_IMAGE_ASSETS = ANSWER_OPTIONS.flatMap((option) => [
  option.defaultImage,
  option.selectedImage,
]);

const CRITICAL_IMAGE_ASSETS = [
  QUIZ_PAGE_BACKGROUND_IMAGE,
  QUIZ_BANNER_IMAGE,
  QUIZ_HERO_GRADIENT_IMAGE,
  QUESTION_FRAME_IMAGE,
  RESULT_BUTTON_IMAGE,
  QUIZ_FOOTER_IMAGE,
  ...ANSWER_IMAGE_ASSETS,
];

const SECONDARY_IMAGE_ASSETS = [
  RESULT_STABLE_BANNER_IMAGE,
  RESULT_FATIGUE_BANNER_IMAGE,
  RESULT_EXTREME_BANNER_IMAGE,
  COLLECT_BANNER_IMAGE,
  CONTINUE_BUTTON_IMAGE,
  COLLECT_SUBMIT_BUTTON_IMAGE,
  RECOVERY_MASCOT_IMAGE,
  BASIC_TITLE_IMAGE,
  IMPORTANT_TITLE_IMAGE,
  RECOVERY_TITLE_IMAGE,
  VITAMIN_CLUSTER_IMAGE,
  ALERT_ICON_IMAGE,
  SUPPORT_NOTE_ICON_IMAGE,
  BULLET_IMAGE,
  HAPPENING_ENERGY_IMAGE,
  HAPPENING_FOCUS_IMAGE,
  HAPPENING_BODY_IMAGE,
  CHECKLIST_IMAGE,
  ...BASIC_HABIT_ICONS,
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

const QUESTION_ANSWER_LABELS = {
  q1: ["Luôn luôn", "Thường xuyên", "Thỉnh thoảng", "Ít khi", "Không bao giờ"],
  q2: ["Luôn luôn", "Thường xuyên", "Thỉnh thoảng", "Ít khi", "Không bao giờ"],
  q3: ["Rất thấp", "Thấp", "Bình thường", "Khá tốt", "Rất tốt"],
  q4: ["Rất thấp", "Thấp", "Bình thường", "Khá tốt", "Rất tốt"],
  q5: ["Rất mệt", "Hơi mệt", "Bình thường", "Khá khỏe", "Rất khỏe"],
  q6: [
    "Rất khó bắt đầu",
    "Khó bắt đầu",
    "Bình thường",
    "Khá sẵn sàng",
    "Rất sẵn sàng",
  ],
  q7: [
    "Hiếm khi",
    "Không ổn định",
    "Bình thường",
    "Khá rõ ràng",
    "Rất rõ ràng",
  ],
  q8: [
    "Không còn hứng thú",
    "Ít hứng thú",
    "Bình thường",
    "Khá hứng thú",
    "Rất hứng thú",
  ],
  q9: ["Rất không ổn", "Không ổn", "Bình thường", "Khá ổn", "Rất ổn"],
  q10: [
    "Rất kém",
    "Kém",
    "Bình thường",
    "Tốt",
    "Rất tốt",
  ],
};

const PROFILE_FIELDS = [
  {
    id: "ageGroup",
    layout: "inline",
    label: "Bạn đang ở nhóm tuổi nào? *",
    options: ["Dưới 25", "25 - 34", "35 - 44", "45+"],
  },
  {
    id: "gender",
    layout: "inline",
    label: "Giới tính của bạn: *",
    options: ["Nam", "Nữ", "Khác", "Không muốn chia sẻ"],
  },
  {
    id: "jobGroup",
    layout: "split",
    label: "Công việc hiện tại của bạn gần với nhóm nào nhất? *",
    options: [
      "IT / Công nghệ",
      "Học sinh / sinh viên",
      "Kinh doanh / Sales",
      "Nhân viên văn phòng (Marketing, hành chính, kế toán…)",
      "Sản xuất / Nhà máy / Kỹ thuật vận hành",
      "Dịch vụ / Bán lẻ / F&B",
      "Tự do / Freelance / Kinh doanh cá nhân",
      "Khác",
    ],
  },
  {
    id: "workNature",
    layout: "split",
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
    bannerImage: RESULT_STABLE_BANNER_IMAGE,
    mascotImage: ANSWER_5_SELECTED_IMAGE,
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
      "Ăn uống cân bằng và đa dạng. [1]",
      "Vận động thường xuyên. [2]",
      "Ngủ đủ và sâu hơn. [3]",
    ],
    supplement:
      "Bổ sung vitamin và khoáng chất trong trường hợp thiếu hụt (như chế độ ăn không đa dạng) và tăng nhu cầu (như làm việc cường độ cao) để cải thiện sức khỏe tinh thần như giảm căng thẳng và bớt mệt mỏi. [1]",
    recoveryTitle: "Khi cơ thể bắt đầu phục hồi đúng cách",
    recoveryTitleMobile: "Khi cơ thể bắt đầu|phục hồi đúng cách",
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
    bannerImage: RESULT_FATIGUE_BANNER_IMAGE,
    mascotImage: ANSWER_3_SELECTED_IMAGE,
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
      "Ăn uống cân bằng và đa dạng. [1]",
      "Vận động thường xuyên. [2]",
      "Ngủ đủ và sâu hơn. [3]",
    ],
    supplement:
      "Bổ sung vitamin và khoáng chất trong trường hợp thiếu hụt (như chế độ ăn không đa dạng) và tăng nhu cầu (như làm việc cường độ cao) để cải thiện sức khỏe tinh thần như giảm căng thẳng và bớt mệt mỏi. [1]",
    recoveryTitle: "Khi cơ thể bắt đầu phục hồi đúng cách",
    recoveryTitleMobile: "Khi cơ thể bắt đầu|phục hồi đúng cách",
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
    bannerImage: RESULT_EXTREME_BANNER_IMAGE,
    mascotImage: ANSWER_2_SELECTED_IMAGE,
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
      "Ăn uống cân bằng và đa dạng. [1]",
      "Vận động thường xuyên. [2]",
      "Ngủ đủ và sâu hơn. [3]",
    ],
    supplement:
      "Bổ sung vitamin và khoáng chất trong trường hợp thiếu hụt (như chế độ ăn không đa dạng) và tăng nhu cầu (như làm việc cường độ cao) để cải thiện sức khỏe tinh thần như giảm căng thẳng và bớt mệt mỏi. [1]",
    supportNote:
      "Lưu ý: Nếu tình trạng mệt mỏi kéo dài hoặc ảnh hưởng nhiều đến sinh hoạt, bạn nên tìm đến chuyên gia y tế để được tư vấn phù hợp.",
    recoveryTitle: "Khi cơ thể bắt đầu phục hồi đúng cách",
    recoveryTitleMobile: "Khi cơ thể bắt đầu|phục hồi đúng cách",
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

function getQuestionAnswerLabels(questionId) {
  return QUESTION_ANSWER_LABELS[questionId] ?? ANSWER_OPTIONS.map(({ label }) => label);
}

function getAnswerLabel(questionId, answerIndex) {
  if (answerIndex === null || answerIndex === undefined) {
    return "";
  }

  return getQuestionAnswerLabels(questionId)[answerIndex] ?? "";
}

function preloadImageAssets(assets, { fetchPriority = "auto", usePreloadLink = false } = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const seenSources = new Set();

  assets.forEach((asset) => {
    if (!asset?.src || seenSources.has(asset.src)) {
      return;
    }

    seenSources.add(asset.src);

    if (usePreloadLink && typeof document !== "undefined") {
      const existingLink = document.head.querySelector(
        `link[rel="preload"][href="${asset.src}"]`,
      );

      if (!existingLink) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = asset.src;
        link.fetchPriority = fetchPriority;
        document.head.append(link);
      }
    }

    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = fetchPriority;
    image.src = asset.src;
  });
}

function scheduleImagePreload(assets) {
  if (typeof window === "undefined") {
    return undefined;
  }

  if ("requestIdleCallback" in window) {
    const idleId = window.requestIdleCallback(
      () => preloadImageAssets(assets, { fetchPriority: "low" }),
      { timeout: 1800 },
    );

    return () => window.cancelIdleCallback(idleId);
  }

  const preloadTimer = window.setTimeout(
    () => preloadImageAssets(assets, { fetchPriority: "low" }),
    700,
  );

  return () => window.clearTimeout(preloadTimer);
}

function AssetImage({
  image,
  alt = "",
  decorative = false,
  loading = "lazy",
  fetchPriority = "auto",
  ...props
}) {
  return (
    <img
      src={image.src}
      width={image.width}
      height={image.height}
      alt={decorative ? "" : alt}
      aria-hidden={decorative ? "true" : undefined}
      decoding="async"
      loading={loading}
      fetchPriority={fetchPriority}
      {...props}
    />
  );
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

function getCollectSubmitLabel(submitState) {
  if (submitState === "saving") {
    return "ĐANG GỬI";
  }

  if (submitState === "success") {
    return "ĐÃ GHI NHẬN";
  }

  if (submitState === "queued") {
    return "GỬI LẠI";
  }

  if (submitState === "error") {
    return "THỬ LẠI";
  }

  return "XÁC NHẬN";
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
    "Kh\u00e1c": "Kh\u00e1c",
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

function getSubmissionPhaseSessionId(sessionId, phase) {
  return `${sessionId}:${phase}`;
}

function getSubmissionRecordId(sessionId) {
  return `submission-${sessionId}`;
}

function getSubmissionPhaseId(sessionId, phase) {
  return `${getSubmissionRecordId(sessionId)}:${phase}`;
}

function normalizeServerRowIndex(rowIndex) {
  const numericRowIndex = Number(rowIndex);
  return Number.isInteger(numericRowIndex) && numericRowIndex > 1
    ? numericRowIndex
    : null;
}

function buildQuizSubmissionPayload({
  answers,
  form,
  result,
  totalScore,
  sessionId,
  submissionId,
  serverUserId,
  serverRowIndex,
  phase = COLLECT_INFO_SUBMISSION_PHASE,
}) {
  const answerTexts = answers.map((answerIndex, questionIndex) => {
    const question = QUESTIONS[questionIndex];
    return getAnswerLabel(question?.id, answerIndex);
  });

  const resultLevel = getResultLevelLabel(result.key);
  const isCollectSubmission = phase === COLLECT_INFO_SUBMISSION_PHASE;
  const basePayload = {
    token: SECRET_TOKEN,
    timestamp: new Date().toISOString(),
    sessionId,
    submissionId,
  };

  if (isCollectSubmission) {
    return {
      ...basePayload,
      action: "update",
      userId: serverUserId,
      rowIndex: Number.isInteger(serverRowIndex) ? serverRowIndex : undefined,
      ageGroup: normalizeAgeGroup(form.ageGroup),
      gender: form.gender,
      jobGroup: normalizeJobType(form.jobGroup),
      workNature: normalizeWorkNature(form.workNature),
      question_open: form.doctorQuestion.trim() || "Không có",
    };
  }

  return {
    ...basePayload,
    action: "create",
    total_score: totalScore,
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
    result_level: resultLevel,
  };
}

function StageBanner({ image, alt }) {
  return (
    <section className="stage-banner">
      <AssetImage
        image={image}
        alt={alt}
        loading="eager"
        fetchPriority="high"
      />
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Liên kết hỗ trợ">
      <nav className="site-footer__nav" aria-label="Thông tin website Berocca">
        {SITE_FOOTER_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}

function ImageButton({ image, label, className = "", ...props }) {
  const buttonClassName = className
    ? `image-button ${className}`
    : "image-button";

  return (
    <button className={buttonClassName} aria-label={label} {...props}>
      <AssetImage image={image} decorative loading="eager" fetchPriority="high" />
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
      title: "Đã gửi câu hỏi của bạn đến bác sĩ. Cảm ơn bạn đã tham gia!",
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
      title: "Th\u00f4ng tin ch\u01b0a ho\u00e0n t\u1ea5t!",
      badge: "",
    };
  }

  return {
    title: "Đang gửi dữ liệu",
    badge: "Đồng bộ",
  };
}

function StatusNotice({ state = "info", title, message }) {
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
        {state === "error" ? (
          <AssetImage image={ALERT_ICON_IMAGE} decorative loading="eager" />
        ) : (
          <NoticeIcon state={state} />
        )}
      </div>

      <div className="status-notice__copy">
        <div className="status-notice__topline">
          <strong>{title ?? meta.title}</strong>
          {meta.badge ? <span className="status-notice__badge">{meta.badge}</span> : null}
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
}

function QuizHeroSection() {
  const [footnoteLead, ...footnoteTailParts] = QUIZ_HERO_CONTENT.footnote.split(
    " - ",
  );
  const footnoteTail = footnoteTailParts.join(" - ");

  return (
    <section className="quiz-hero">
      <div className="quiz-hero__media">
        <AssetImage
          image={QUIZ_BANNER_IMAGE}
          alt={QUIZ_BANNER_ALT}
          loading="eager"
          fetchPriority="high"
        />
      </div>

      <div className="quiz-hero__body">
        <div className="quiz-hero__copy">
          <p className="quiz-hero__lead">{QUIZ_HERO_CONTENT.lead}</p>
          <p className="quiz-hero__highlight">{QUIZ_HERO_CONTENT.highlight}</p>
          <p className="quiz-hero__cta">{QUIZ_HERO_CONTENT.cta}</p>
        </div>
        <p className="quiz-hero__footnote">
          <span className="quiz-hero__footnote-line">
            {footnoteTail ? `${footnoteLead} -` : footnoteLead}
          </span>
          {footnoteTail ? (
            <span className="quiz-hero__footnote-line"> {footnoteTail}</span>
          ) : null}
        </p>
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

const ChoiceOption = memo(function ChoiceOption({
  option,
  optionIndex,
  label,
  selected,
  onSelect,
}) {
  const optionImage = selected ? option.selectedImage : option.defaultImage;

  return (
    <button
      type="button"
      className={`choice-card${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(optionIndex)}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") {
          onSelect(optionIndex);
        }
      }}
      aria-pressed={selected}
    >
      <div className="choice-card__image">
        <AssetImage
          image={optionImage}
          decorative
          loading="eager"
          fetchPriority="high"
        />
      </div>
      <span className="choice-card__label">{label}</span>
    </button>
  );
});

const QuestionCard = memo(function QuestionCard({
  question,
  questionIndex,
  answerIndex,
  onAnswerChange,
}) {
  const selectedOption = getSelectedOption(answerIndex);
  const answerLabels = getQuestionAnswerLabels(question.id);
  const hasDoubleDigitLabel = /\d{2,}/.test(question.label);
  const hasLongPrompt = question.prompt.length >= 42;
  const hasExtraLongPrompt = question.prompt.length >= 72;
  const handleSelect = useCallback(
    (optionIndex) => onAnswerChange(questionIndex, optionIndex),
    [onAnswerChange, questionIndex],
  );

  return (
    <section
      className={`question-card${selectedOption ? " is-answered" : ""}${hasDoubleDigitLabel ? " question-card--double-digit" : ""}${hasLongPrompt ? " question-card--long-prompt" : ""}${hasExtraLongPrompt ? " question-card--extra-long-prompt" : ""}`}
      id={question.id}
      data-question-id={question.id}
    >
      <div
        className="question-card__frame"
        style={{ backgroundImage: `url(${QUESTION_FRAME_IMAGE.src})` }}
      >
        <div className="question-card__overlay">
          <div className="question-card__header">
            <div className="question-card__content">
              <h2>
                <span className="question-card__label">{`${question.label}:`}</span>{" "}
                {question.prompt}
              </h2>
            </div>
          </div>

          <div className="question-card__options">
            {ANSWER_OPTIONS.map((option, optionIndex) => (
              <ChoiceOption
                key={option.label}
                option={option}
                optionIndex={optionIndex}
                label={answerLabels[optionIndex] ?? option.label}
                selected={answerIndex === optionIndex}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

function QuizScreen({
  answers,
  onAnswerChange,
  onShowResult,
  validationMessage,
}) {
  return (
    <div
      className="content-column content-column--quiz"
      style={{
        "--quiz-hero-gradient-image": `url(${QUIZ_HERO_GRADIENT_IMAGE.src})`,
        "--quiz-footer-image": `url(${QUIZ_FOOTER_IMAGE.src})`,
      }}
    >
      <QuizHeroSection />

      <div className="questions-stack">
        {QUESTIONS.map((question, questionIndex) => (
          <QuestionCard
            key={question.id}
            question={question}
            questionIndex={questionIndex}
            answerIndex={answers[questionIndex]}
            onAnswerChange={onAnswerChange}
          />
        ))}
      </div>

      <div className="actions-center quiz-footer">
        {validationMessage ? (
          <StatusNotice state="error" message={validationMessage} />
        ) : null}

        <ImageButton
          type="button"
          className="quiz-footer__button"
          image={RESULT_BUTTON_IMAGE}
          label="Xem kết quả"
          onClick={onShowResult}
        />
      </div>
    </div>
  );
}

function ResultScreen({ totalScore, onContinue }) {
  const result = getResultConfig(totalScore);

  return (
    <div className="content-column content-column--result">
      <StageBanner image={result.bannerImage} alt={RESULT_BANNER_ALT} />

      <section
        className="result-block result-block--framed result-block--status"
        style={{
          "--result-frame-image": `url(${QUESTION_FRAME_IMAGE.src})`,
          backgroundImage: `url(${QUIZ_HERO_GRADIENT_IMAGE.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
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
        style={{ "--result-frame-image": `url(${QUESTION_FRAME_IMAGE.src})` }}
      >
        <div className="result-block__header">
          <h2>Điều đang xảy ra?</h2>
        </div>

        <div className="result-block__body result-block__body--soft">
          <p className="result-block__paragraph result-block__paragraph--lead">
            {result.whatCopy}
          </p>

          <div className="result-signal-row">
            {result.signals.map((signal) => {
              const signalImage =
                HAPPENING_SIGNAL_IMAGES[signal.icon] ?? HAPPENING_SIGNAL_IMAGES.energy;

              return (
                <div key={signal.title} className="result-signal">
                  <div className="result-signal__icon">
                    <AssetImage image={signalImage} decorative />
                  </div>
                  <div className="result-signal__text">
                    <strong>{signal.title}:</strong>
                    <span>{signal.value}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="result-block__paragraph">{result.insightNote}</p>

          <div className="result-alert">
            <div className="result-alert__icon" aria-hidden="true">
              <AssetImage image={ALERT_ICON_IMAGE} decorative />
            </div>
            <p>{result.warning}</p>
          </div>
        </div>
      </section>

      <section className="result-support-layout">
        <article className="result-basic-card">
          <h2 className="result-title-image" aria-hidden="true">
            <AssetImage image={BASIC_TITLE_IMAGE} decorative />
          </h2>
          <h2>Bắt đầu từ những điều cơ bản:</h2>
          <ul className="result-basic-list">
            {result.habits.map((habit, index) => {
              const habitIcon = BASIC_HABIT_ICONS[index] ?? BASIC_HABIT_ICONS[0];

              return (
                <li key={habit}>
                  <AssetImage
                    className="result-basic-list__icon"
                    image={habitIcon}
                    decorative
                  />
                  <span>{habit}</span>
                  <AssetImage
                    className="result-basic-list__check"
                    image={CHECKLIST_IMAGE}
                    decorative
                  />
                </li>
              );
            })}
          </ul>
        </article>

        <article
          className={`result-important-card${
            result.supportNote ? " result-important-card--with-note" : ""
          }`}
        >
          <div className="result-important-card__header">
            <AssetImage image={IMPORTANT_TITLE_IMAGE} decorative />
            <span>Quan trọng</span>
          </div>

          <div className="result-important-card__body">
            <div className="result-important-card__copy">
              <p>{result.supplement}</p>
            </div>

            <div className="result-vitamin-cluster" aria-hidden="true">
              <AssetImage image={VITAMIN_CLUSTER_IMAGE} decorative />
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

            {result.supportNote ? (
              <div className="result-important-card__note">
                <AssetImage
                  className="result-important-card__note-icon"
                  image={SUPPORT_NOTE_ICON_IMAGE}
                  decorative
                />
                <p>{result.supportNote}</p>
              </div>
            ) : null}
          </div>
        </article>
      </section>

      <section className="result-recovery-panel">
        <h2 className="result-title-image result-title-image--recovery result-recovery-panel__title">
          <AssetImage
            image={RECOVERY_TITLE_IMAGE}
            alt={result.recoveryTitle}
          />
        </h2>

        <div className="result-recovery-panel__body">
          <div className="result-recovery-panel__copy">
            <h2>
              {(result.recoveryTitleMobile ?? result.recoveryTitle)
                .split("|")
                .map((line) => (
                  <span key={line}>{line}</span>
                ))}
            </h2>
            <p>{result.recoveryCopy}</p>

            <ul className="result-recovery-panel__points">
              {result.recoveryPoints.map((point) => (
                <li key={point}>
                  <AssetImage
                    className="result-recovery-panel__bullet"
                    image={BULLET_IMAGE}
                    decorative
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="result-recovery-panel__art">
            <AssetImage image={RECOVERY_MASCOT_IMAGE} decorative />
          </div>
        </div>
      </section>

      <div className="actions-center result-actions">
        <div className="result-sources" aria-label="Nguồn tham khảo">
          <p>Nguồn:</p>
          <ol>
            <li>
              World Health Organization. (2020, April 29). Healthy diet.
              https://www.who.int/news-room/fact-sheets/detail/healthy-diet
            </li>
            <li>
              World Health Organization. (2020). WHO guidelines on physical activity
              and sedentary behaviour. World Health Organization.
              https://www.who.int/publications/i/item/9789240015128
            </li>
            <li>
              World Health Organization. (2004). Technical meeting on sleep and health.
              WHO Regional Office for Europe.
              https://iris.who.int/items/c51d4655-2b2a-4f1a-affb-a15155a67c95
            </li>
          </ol>
        </div>
        <ImageButton
          type="button"
          image={CONTINUE_BUTTON_IMAGE}
          label="Xem tiếp"
          onClick={onContinue}
        />
      </div>
    </div>
  );
}

function CollectScreen({
  form,
  onChange,
  onSubmit,
  onBack,
  submitState,
  formMessage,
}) {
  const fieldsDisabled = submitState === "saving" || submitState === "success";

  return (
    <div className="content-column content-column--collect">
      <StageBanner image={COLLECT_BANNER_IMAGE} alt={COLLECT_BANNER_ALT} />

      <section className="collect-intro">
        <p>
          Bạn đã biết mình đang “gồng” ở mức nào. Chia sẻ thêm một chút để nhận tư vấn
          phù hợp hơn cho chính bạn và có cơ hội được bác sĩ giải đáp trực tiếp.
        </p>
      </section>

      <form className="collect-form" onSubmit={onSubmit}>
        {PROFILE_FIELDS.map((field) => (
          <fieldset key={field.id} className="collect-card collect-group">
            <legend className="collect-group__legend">{field.label}</legend>
            <div className={`collect-group__options collect-group__options--${field.layout}`}>
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
                      disabled={fieldsDisabled}
                      onChange={(event) => onChange(field.id, event.target.value)}
                    />
                    <span className="select-chip__box" />
                    <span className="select-chip__label">{option}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <fieldset className="collect-card collect-group collect-group--doctor">
          <legend className="collect-group__legend collect-group__legend--plain">
            Nếu có 1 điều bạn đang thắc mắc về tình trạng của mình, bạn muốn hỏi bác sĩ
            điều gì?
          </legend>
          <div className="collect-group__rule collect-group__rule--doctor" aria-hidden="true" />
          <textarea
            name="doctorQuestion"
            value={form.doctorQuestion}
            onChange={(event) => onChange("doctorQuestion", event.target.value)}
            rows={5}
            disabled={fieldsDisabled}
            placeholder="Nhập câu hỏi hoặc điều bạn đang quan tâm..."
          />
          <p className="collect-group__note">
            Bảng câu hỏi trắc nghiệm này không thu thập tên hoặc bất kỳ thông tin nào giúp
            xác định bạn là ai. Chúng tôi tôn trọng quyền riêng tư và bảo vệ dữ liệu của bạn.
          </p>
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
            title={
              submitState === "error"
                ? "S\u1eafp ho\u00e0n th\u00e0nh r\u1ed3i!"
                : undefined
            }
            message={formMessage}
          />
        ) : null}

        <div className="actions-center actions-center--collect">
          <ImageButton
            type="submit"
            className="collect-submit-button"
            image={COLLECT_SUBMIT_BUTTON_IMAGE}
            label={getCollectSubmitLabel(submitState)}
            disabled={submitState === "saving" || submitState === "success"}
          />

          {submitState === "success" ? null : (
            <button
              type="button"
              className="secondary-button collect-secondary-button"
              onClick={onBack}
            >
              Xem lại kết quả
            </button>
          )}
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
  const [serverUserId, setServerUserId] = useState(initialState.serverUserId ?? null);
  const [serverRowIndex, setServerRowIndex] = useState(
    normalizeServerRowIndex(initialState.serverRowIndex),
  );
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

  function getPhaseSessionId(phase) {
    return getSubmissionPhaseSessionId(sessionId, phase);
  }

  const syncCurrentSessionSubmissionState = useEffectEvent(
    ({ preserveSavingState = true } = {}) => {
      if (stage !== "collect") {
        return;
      }

      const collectPhaseSessionId = getPhaseSessionId(COLLECT_INFO_SUBMISSION_PHASE);

      if (hasAcknowledgedSession(collectPhaseSessionId)) {
      setSubmitState("success");
      setFormMessage(SUCCESS_SUBMISSION_MESSAGE);
      return;
    }

    const queuedSubmission = getQueuedSubmissionBySession(collectPhaseSessionId);

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
          const responseData = await submitQueuedPayload({
            url: APPS_SCRIPT_URL,
            payload: nextSubmission.payload,
          });

          if (nextSubmission.payload?.action === "create") {
            if (responseData?.userId) {
              setServerUserId(responseData.userId);
            }

            const responseRowIndex = normalizeServerRowIndex(responseData?.rowIndex);

            if (responseRowIndex) {
              setServerRowIndex(responseRowIndex);
            }
          }

          await markSessionAcknowledged({
            sessionId: nextSubmission.sessionId,
            submissionId: nextSubmission.id,
          });

          if (
            nextSubmission.sessionId ===
            getSubmissionPhaseSessionId(sessionId, COLLECT_INFO_SUBMISSION_PHASE)
          ) {
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

          if (
            nextSubmission.sessionId ===
            getSubmissionPhaseSessionId(sessionId, COLLECT_INFO_SUBMISSION_PHASE)
          ) {
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

  const redirectToQuizAfterSuccessfulSubmit = useEffectEvent(() => {
    handleRestart();
  });

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.title = SEO_TITLE;

    let descriptionTag = document.head.querySelector('meta[name="description"]');

    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.setAttribute("name", "description");
      document.head.append(descriptionTag);
    }

    descriptionTag.setAttribute("content", SEO_DESCRIPTION);

    let canonicalTag = document.head.querySelector('link[rel="canonical"]');

    if (!canonicalTag) {
      canonicalTag = document.createElement("link");
      canonicalTag.setAttribute("rel", "canonical");
      document.head.append(canonicalTag);
    }

    canonicalTag.setAttribute("href", SEO_URL);
  }, []);

  useEffect(() => {
    preloadImageAssets(CRITICAL_IMAGE_ASSETS, {
      fetchPriority: "high",
      usePreloadLink: true,
    });

    return scheduleImagePreload(SECONDARY_IMAGE_ASSETS);
  }, []);

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
      serverUserId,
      serverRowIndex,
      initialForm: INITIAL_FORM,
    });
  }, [
    answers,
    form,
    serverRowIndex,
    serverUserId,
    sessionId,
    stage,
    submitState,
    totalScore,
  ]);

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

  useEffect(() => {
    if (stage !== "collect" || submitState !== "success") {
      return undefined;
    }

    const redirectTimer = window.setTimeout(() => {
      redirectToQuizAfterSuccessfulSubmit();
    }, 1000);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [stage, submitState]);

  const handleAnswerChange = useCallback((questionIndex, optionIndex) => {
    setAnswers((currentAnswers) => {
      if (currentAnswers[questionIndex] === optionIndex) {
        return currentAnswers;
      }

      const nextAnswers = [...currentAnswers];
      nextAnswers[questionIndex] = optionIndex;
      return nextAnswers;
    });

    setFormMessage("");
  }, []);

  async function queueQuizResultSubmission({ answersSnapshot, result, score }) {
    const quizPhaseSessionId = getPhaseSessionId(QUIZ_RESULT_SUBMISSION_PHASE);

    if (hasAcknowledgedSession(quizPhaseSessionId)) {
      return;
    }

    const existingQueuedSubmission = getQueuedSubmissionBySession(quizPhaseSessionId);
    const submissionQueueId =
      existingQueuedSubmission?.id ??
      getSubmissionPhaseId(sessionId, QUIZ_RESULT_SUBMISSION_PHASE);
    const payload = buildQuizSubmissionPayload({
      answers: answersSnapshot,
      form: INITIAL_FORM,
      result,
      totalScore: score,
      sessionId,
      submissionId: getSubmissionRecordId(sessionId),
      serverUserId: null,
      serverRowIndex: null,
      phase: QUIZ_RESULT_SUBMISSION_PHASE,
    });

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success && data.userId) {
        setServerUserId(data.userId);

        const responseRowIndex = normalizeServerRowIndex(data.rowIndex);

        if (responseRowIndex) {
          setServerRowIndex(responseRowIndex);
        }

        await markSessionAcknowledged({
          sessionId: quizPhaseSessionId,
          submissionId: submissionQueueId,
        });
      } else {
        await upsertQueuedSubmission({
          id: submissionQueueId,
          sessionId: quizPhaseSessionId,
          payload,
          attempts: 1,
          queuedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          nextAttemptAt: Date.now() + getRetryDelayMs(1),
          lastError: data.error || "No userId in response",
          lastStatusCode: 0,
          isTerminalFailure: false,
        });
      }
    } catch (error) {
      console.error("Phase 1 submit error:", error);

      try {
        await upsertQueuedSubmission({
          id: submissionQueueId,
          sessionId: quizPhaseSessionId,
          payload,
          attempts: 1,
          queuedAt: existingQueuedSubmission?.queuedAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          nextAttemptAt: Date.now() + getRetryDelayMs(1),
          lastError: error instanceof Error ? error.message : String(error),
          lastStatusCode: 0,
          isTerminalFailure: false,
        });
      } catch (queueError) {
        console.error("Failed to queue Phase 1:", queueError);
      }
    }
  }

  function handleShowResult() {
    const firstMissingIndex = answers.findIndex((answer) => answer === null);

    if (firstMissingIndex >= 0) {
      const firstMissingQuestion = QUESTIONS[firstMissingIndex];
      setFormMessage("\u0110\u1ec3 nh\u1eadn \u0111\u01b0\u1ee3c k\u1ebft qu\u1ea3 \u0111\u00e1nh gi\u00e1 ch\u00ednh x\u00e1c nh\u1ea5t, b\u1ea1n vui l\u00f2ng ho\u00e0n t\u1ea5t c\u00e1c c\u00e2u h\u1ecfi tr\u01b0\u1edbc khi nh\u1ea5n x\u00e1c nh\u1eadn nh\u00e9.");
      document.getElementById(firstMissingQuestion.id)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    const score = calculateTotalScore(answers);
    const result = getResultConfig(score);

    void queueQuizResultSubmission({
      answersSnapshot: answers,
      result,
      score,
    });
    setTotalScore(score);
    setFormMessage("");
    setStage("result");
  }

  function handleFormChange(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    const collectPhaseSessionId = getPhaseSessionId(COLLECT_INFO_SUBMISSION_PHASE);

    if (getQueuedSubmissionBySession(collectPhaseSessionId)) {
      void removeQueuedSubmissionBySession(collectPhaseSessionId);
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
      setFormMessage(
        "B\u1ea1n vui l\u00f2ng ho\u00e0n th\u00e0nh t\u1ea5t c\u1ea3 c\u00e1c th\u00f4ng tin b\u1eaft bu\u1ed9c tr\u01b0\u1edbc khi nh\u1ea5n x\u00e1c nh\u1eadn nh\u00e9.",
      );
      return;
    }

    if (!serverUserId) {
      setSubmitState("error");
      setFormMessage("Kết quả quiz chưa được lưu. Bạn vui lòng quay lại và thử xem kết quả một lần nữa.");
      return;
    }

    const collectPhaseSessionId = getPhaseSessionId(COLLECT_INFO_SUBMISSION_PHASE);

    if (hasAcknowledgedSession(collectPhaseSessionId)) {
      setSubmitState("success");
      setFormMessage(SUCCESS_SUBMISSION_MESSAGE);
      return;
    }

    const result = getResultConfig(totalScore);
    const existingQueuedSubmission = getQueuedSubmissionBySession(collectPhaseSessionId);
    const submissionQueueId =
      existingQueuedSubmission?.id ??
      getSubmissionPhaseId(sessionId, COLLECT_INFO_SUBMISSION_PHASE);
    const payload = buildQuizSubmissionPayload({
      answers,
      form,
      result,
      totalScore,
      sessionId,
      submissionId: getSubmissionRecordId(sessionId),
      serverUserId,
      serverRowIndex,
      phase: COLLECT_INFO_SUBMISSION_PHASE,
    });

    try {
      setSubmitState("saving");
      setFormMessage("Đang gửi dữ liệu...");

      await upsertQueuedSubmission({
        id: submissionQueueId,
        sessionId: collectPhaseSessionId,
        payload,
        attempts: 0,
        queuedAt: existingQueuedSubmission?.queuedAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nextAttemptAt: Date.now(),
        lastError: "",
        lastStatusCode: 0,
        isTerminalFailure: false,
      });

      await flushSubmissionQueueRef.current({ priorityId: submissionQueueId });

      const latestQueuedSubmission = getQueuedSubmissionBySession(collectPhaseSessionId);

      if (latestQueuedSubmission?.id === submissionQueueId) {
        if (latestQueuedSubmission.isTerminalFailure) {
          setSubmitState("error");
          setFormMessage(TERMINAL_SUBMISSION_MESSAGE);
        } else {
          setSubmitState("queued");
          setFormMessage(QUEUED_SUBMISSION_MESSAGE);
        }

        return;
      }

      if (hasAcknowledgedSession(collectPhaseSessionId)) {
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
    const quizPhaseSessionId = getPhaseSessionId(QUIZ_RESULT_SUBMISSION_PHASE);
    const collectPhaseSessionId = getPhaseSessionId(COLLECT_INFO_SUBMISSION_PHASE);

    void Promise.all([
      removeQueuedSubmissionBySession(sessionId),
      removeQueuedSubmissionBySession(quizPhaseSessionId),
      removeQueuedSubmissionBySession(collectPhaseSessionId),
      clearAcknowledgedSession(sessionId),
      clearAcknowledgedSession(quizPhaseSessionId),
      clearAcknowledgedSession(collectPhaseSessionId),
    ]);
    clearPersistedQuizState();
    setAnswers(createInitialAnswers());
    setForm({ ...INITIAL_FORM });
    setSubmitState("idle");
    setFormMessage("");
    setTotalScore(0);
    setSessionId(createSessionId());
    setServerUserId(null);
    setServerRowIndex(null);
    setStage("quiz");
  }

  return (
    <main
      className={`page-shell${stage === "quiz" ? " page-shell--quiz" : ""}${stage === "result" ? " page-shell--result" : ""}${stage === "collect" ? " page-shell--collect" : ""}`}
    >
      <div
        className={`page-frame${stage === "quiz" ? " page-frame--quiz" : ""}${stage === "result" ? " page-frame--result" : ""}${stage === "collect" ? " page-frame--collect" : ""}`}
      >
        <h1 className="sr-only">{SEO_H1}</h1>

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
          />
        ) : null}

        {stage === "collect" ? (
          <CollectScreen
            form={form}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onBack={() => setStage("result")}
            submitState={submitState}
            formMessage={formMessage}
          />
        ) : null}
      </div>

      <SiteFooter />
    </main>
  );
}

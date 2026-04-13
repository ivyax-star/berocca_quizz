// BeroccaFASQuiz_sheets.jsx
// Tích hợp Google Sheets qua Apps Script Web App

import { useState, useCallback } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
// Sau khi deploy Apps Script, paste Web App URL vào đây
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyvsbhdUrBWSXL-MMaDVOgP9Dcq5ur3inNHaPBVWKbmmBNGXvCbCkcFj4gpUKA688NXfw/exec"; // URL vừa copy
const SECRET_TOKEN    = "berocca2024xyz"; // phải khớp với Code.gs

// ─── Data ─────────────────────────────────────────────────────────────────────

const QUESTIONS = [
  { id: 1,  text: "Bạn có thường xuyên bị mệt mỏi không?",                                answers: ["Luôn luôn","Thường xuyên","Thỉnh thoảng","Hiếm khi","Không bao giờ"], scores: [1,2,3,4,5] },
  { id: 2,  text: "Khi bạn đang làm gì đó, bạn có nhanh chóng cảm thấy mệt mỏi không?",  answers: ["Luôn luôn","Thường xuyên","Thỉnh thoảng","Hiếm khi","Không bao giờ"], scores: [1,2,3,4,5] },
  { id: 3,  text: "Mỗi ngày bạn giải quyết được bao nhiêu công việc?",                     answers: ["Rất ít","Không nhiều","Bình thường","Khá nhiều","Rất nhiều"],          scores: [1,2,3,4,5] },
  { id: 4,  text: "Mức năng lượng hằng ngày của bạn như thế nào?",                         answers: ["Không ổn định","Không ổn","Bình thường","Tốt","Rất tốt"],              scores: [1,2,3,4,5] },
  { id: 5,  text: "Tình trạng thể chất của bạn như thế nào?",                              answers: ["Không tốt","Khá khó","Thỉnh thoảng","Thường xuyên","Luôn tốt"],      scores: [1,2,3,4,5] },
  { id: 6,  text: "Khi cần bắt đầu công việc, bạn sẵn sàng đến mức nào?",                 answers: ["Không bao giờ","Khá khó","Thỉnh thoảng","Thường xuyên","Luôn sẵn sàng"], scores: [1,2,3,4,5] },
  { id: 7,  text: "Bạn có thấy đầu óc luôn minh mẫn để suy nghĩ mọi thứ không?",          answers: ["Hiếm khi","Không đều","Thường xuyên","Thỉnh thoảng","Luôn luôn"],     scores: [1,2,3,4,5] },
  { id: 8,  text: "Bạn có luôn cảm thấy hứng khởi để làm mọi thứ không?",                 answers: ["Không bao giờ","Hiếm khi","Bình thường","Thỉnh thoảng","Luôn luôn"], scores: [1,2,3,4,5] },
  { id: 9,  text: "Sức khỏe tinh thần của bạn như thế nào?",                              answers: ["Không ổn định","Bất ổn","Bình thường","Ổn","Tốt"],                     scores: [1,2,3,4,5] },
  { id: 10, text: "Bạn tự đánh giá khả năng tập trung của mình như thế nào?",             answers: ["Rất kém","Khá kém","Bình thường","Tốt","Rất tốt"],                     scores: [1,2,3,4,5] },
];

const BATTERY_COLORS = [
  { fill: "#e0e0e0", border: "#bdbdbd", fillPct: 20, labelColor: "#9e9e9e" },
  { fill: "#e53935", border: "#c62828", fillPct: 38, labelColor: "#e53935" },
  { fill: "#FB8C00", border: "#E65100", fillPct: 56, labelColor: "#E65100" },
  { fill: "#FDD835", border: "#F9A825", fillPct: 74, labelColor: "#b8a200" },
  { fill: "#43A047", border: "#2E7D32", fillPct: 92, labelColor: "#2E7D32" },
];

const getResult = (total) => {
  if (total <= 21) return {
    level: "Không có dấu hiệu mệt mỏi", levelKey: "Bình thường", tag: "Bình thường",
    desc: "Chúc mừng! Bạn đang có năng lượng tốt. Hãy duy trì bằng chế độ ăn cân bằng, tập thể dục đều đặn và ngủ đủ giấc.",
    color: { bg: "#e8f5e9", text: "#2E7D32", tagBg: "#c8e6c9", tagText: "#1B5E20" },
  };
  if (total <= 34) return {
    level: "Có dấu hiệu mệt mỏi", levelKey: "Mệt mỏi", tag: "Mệt mỏi",
    desc: "Bạn đang có dấu hiệu mệt mỏi. Mệt mỏi có thể ảnh hưởng trực tiếp đến tâm trạng và khả năng làm việc.",
    color: { bg: "#fff3e0", text: "#E65100", tagBg: "#ffe0b2", tagText: "#BF360C" },
  };
  return {
    level: "Mệt mỏi ở mức độ cao", levelKey: "Mệt mỏi nặng", tag: "Mệt mỏi nặng",
    desc: "Bạn đang mệt mỏi nghiêm trọng. Hãy tham khảo ý kiến bác sĩ và bổ sung vitamin B phức hợp hàng ngày.",
    color: { bg: "#ffebee", text: "#c62828", tagBg: "#ffcdd2", tagText: "#B71C1C" },
  };
};

// ─── Gửi dữ liệu lên Google Sheets qua Apps Script ────────────────────────────

async function saveToSheets(score, answers, levelKey) {
  // Chuyển answers thành mảng text để ghi vào từng cột C1–C10
  const answerTexts = QUESTIONS.map((q, i) => {
    const idx = q.scores.indexOf(answers[i]);
    return idx >= 0 ? q.answers[idx] : "";
  });

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      // Apps Script không nhận Content-Type application/json từ cross-origin
      // dùng text/plain để tránh preflight CORS bị block
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        token:     SECRET_TOKEN,
        score,
        level:     levelKey,
        answers:   answerTexts,
        sessionId: crypto.randomUUID(),
      }),
    });

    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("Apps Script error:", err);
    return false;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BatteryIcon({ color, selected, fillPct }) {
  return (
    <div style={{ position: "relative", width: "100%", paddingTop: "200%" }}>
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "38%", height: "8%",
        background: selected ? color.fill : "#ccc",
        borderRadius: "3px 3px 0 0", transition: "background 0.25s",
      }}/>
      <div style={{
        position: "absolute", top: "8%", left: 0, right: 0, bottom: 0,
        border: `2.5px solid ${selected ? color.border : "#bbb"}`,
        borderRadius: 8, overflow: "hidden", background: "#f5f5f5",
        transition: "border-color 0.25s",
      }}>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: `${selected ? fillPct : 0}%`,
          background: color.fill,
          transition: "height 0.35s ease",
        }}/>
      </div>
    </div>
  );
}

function QuizScreen({ currentQ, answers, onSelect, onNext, onBack }) {
  const q        = QUESTIONS[currentQ];
  const answered = answers[currentQ] !== null;
  const soFar    = answers.slice(0, currentQ).filter(Boolean).reduce((s, a) => s + a, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 520 }}>
      <div style={{ width: "100%", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "#888" }}>
          <span>Câu {currentQ + 1} / 10</span>
          {currentQ > 0 && <span style={{ color: "#F5A623", fontWeight: 700 }}>Điểm tạm: {soFar}</span>}
        </div>
        <div style={{ height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(currentQ + 1) / 10 * 100}%`, background: "#F5A623", borderRadius: 3, transition: "width 0.4s ease" }}/>
        </div>
      </div>

      <div style={{ width: "100%", background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: "20px 20px 16px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#F5A623", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
          Câu hỏi {String(currentQ + 1).padStart(2, "0")}
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.4 }}>{q.text}</div>
      </div>

      <div style={{ display: "flex", gap: 10, width: "100%", justifyContent: "center" }}>
        {q.answers.map((ans, i) => {
          const c        = BATTERY_COLORS[i];
          const selected = answers[currentQ] === q.scores[i];
          return (
            <button key={i} onClick={() => onSelect(currentQ, q.scores[i])}
              style={{ flex: 1, minWidth: 60, maxWidth: 90, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
              <BatteryIcon color={c} selected={selected} fillPct={c.fillPct}/>
              <span style={{ fontSize: 11, fontWeight: 700, color: selected ? c.labelColor : "#aaa", textAlign: "center", lineHeight: 1.2, transition: "color 0.2s" }}>
                {ans}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24, width: "100%" }}>
        {currentQ > 0 && (
          <button onClick={onBack} style={{ background: "transparent", border: "1px solid #ddd", color: "#888", fontFamily: "inherit", fontSize: 14, fontWeight: 600, padding: "10px 20px", borderRadius: 50, cursor: "pointer" }}>
            ← Quay lại
          </button>
        )}
        <button onClick={onNext} disabled={!answered}
          style={{ flex: 1, background: answered ? "#F5A623" : "#e0e0e0", color: answered ? "#fff" : "#aaa", border: "none", fontFamily: "inherit", fontSize: 15, fontWeight: 700, padding: "12px 24px", borderRadius: 50, cursor: answered ? "pointer" : "not-allowed", transition: "background 0.2s" }}>
          {currentQ === 9 ? "Xem kết quả ✓" : "Tiếp theo →"}
        </button>
      </div>
    </div>
  );
}

function ResultScreen({ answers, onReset, saveStatus }) {
  const total  = answers.reduce((s, a) => s + (a || 0), 0);
  const result = getResult(total);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 520 }}>
      <div style={{ fontSize: 11, fontWeight: 700, background: "#F5A623", color: "#fff", padding: "4px 14px", borderRadius: 20, letterSpacing: 1, marginBottom: 16 }}>
        KẾT QUẢ CỦA BẠN
      </div>

      <div style={{ width: "100%", background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: "24px 20px", marginBottom: 12, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ width: 90, height: 90, borderRadius: "50%", background: result.color.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: result.color.text, lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: 9, color: result.color.text, letterSpacing: 0.5, marginTop: 2 }}>ĐIỂM FAS</div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", marginBottom: 8 }}>{result.level}</div>
        <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>{result.desc}</div>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20, background: result.color.tagBg, color: result.color.tagText }}>
          {result.tag}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%", marginBottom: 12 }}>
        {QUESTIONS.map((q, i) => {
          const sc   = answers[i];
          const ai   = q.scores.indexOf(sc);
          const c    = BATTERY_COLORS[Math.max(0, ai)];
          const shortQ = q.text.length > 34 ? q.text.slice(0, 32) + "…" : q.text;
          return (
            <div key={i} style={{ background: "#f9f9f9", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.fill, border: `1px solid ${c.border}`, flexShrink: 0 }}/>
              <div style={{ fontSize: 11, color: "#666", lineHeight: 1.3, flex: 1 }}>{shortQ}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginLeft: "auto", flexShrink: 0 }}>{sc}</div>
            </div>
          );
        })}
      </div>

      {saveStatus === "saving" && (
        <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Đang lưu kết quả...</div>
      )}
      {saveStatus === "saved" && (
        <div style={{ fontSize: 12, color: "#2E7D32", background: "#e8f5e9", padding: "5px 14px", borderRadius: 20, marginBottom: 8 }}>
          ✓ Kết quả đã được lưu vào Google Sheets
        </div>
      )}
      {saveStatus === "error" && (
        <div style={{ fontSize: 12, color: "#c62828", background: "#ffebee", padding: "5px 14px", borderRadius: 20, marginBottom: 8 }}>
          ⚠ Không thể lưu kết quả. Kiểm tra lại kết nối.
        </div>
      )}

      <button onClick={onReset}
        style={{ background: "#F5A623", color: "#fff", border: "none", fontFamily: "inherit", fontSize: 15, fontWeight: 700, padding: "12px 32px", borderRadius: 50, cursor: "pointer", marginTop: 8 }}>
        Làm lại bài kiểm tra
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BeroccaFASQuiz() {
  const [screen,     setScreen]     = useState("intro");
  const [currentQ,   setCurrentQ]   = useState(0);
  const [answers,    setAnswers]     = useState(new Array(10).fill(null));
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSelect = useCallback((qIdx, score) => {
    setAnswers((prev) => { const next = [...prev]; next[qIdx] = score; return next; });
  }, []);

  const handleNext = useCallback(async () => {
    if (currentQ < 9) {
      setCurrentQ((q) => q + 1);
    } else {
      setScreen("result");
      setSaveStatus("saving");
      const total  = answers.reduce((s, a) => s + (a || 0), 0);
      const result = getResult(total);
      const ok     = await saveToSheets(total, answers, result.levelKey);
      setSaveStatus(ok ? "saved" : "error");
    }
  }, [currentQ, answers]);

  const handleBack  = useCallback(() => setCurrentQ((q) => Math.max(0, q - 1)), []);
  const handleReset = useCallback(() => {
    setCurrentQ(0);
    setAnswers(new Array(10).fill(null));
    setSaveStatus(null);
    setScreen("intro");
  }, []);

  return (
    <div style={{ fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 32px", minHeight: 500 }}>
      {screen === "intro" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 480, width: "100%" }}>
          <div style={{ fontSize: 11, fontWeight: 800, background: "#F5A623", color: "#fff", padding: "4px 14px", borderRadius: 20, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>
            Berocca × FAS
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", marginBottom: 10, color: "#1a1a1a" }}>
            Kiểm tra mức độ<br/>mệt mỏi của bạn
          </h1>
          <p style={{ fontSize: 14, color: "#777", textAlign: "center", lineHeight: 1.7, marginBottom: 20, maxWidth: 380 }}>
            Bài kiểm tra FAS gồm 10 câu hỏi giúp đánh giá mức năng lượng thể chất và tinh thần. Chỉ mất khoảng 2 phút.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
            {["10 câu hỏi", "~2 phút", "Kết quả tức thì"].map((t) => (
              <div key={t} style={{ fontSize: 12, color: "#888", background: "#f5f5f5", padding: "4px 12px", borderRadius: 20 }}>{t}</div>
            ))}
          </div>
          <button onClick={() => setScreen("quiz")}
            style={{ background: "#F5A623", color: "#fff", border: "none", fontFamily: "inherit", fontSize: 16, fontWeight: 700, padding: "14px 36px", borderRadius: 50, cursor: "pointer" }}>
            Bắt đầu kiểm tra
          </button>
        </div>
      )}
      {screen === "quiz"   && <QuizScreen   currentQ={currentQ} answers={answers} onSelect={handleSelect} onNext={handleNext} onBack={handleBack}/>}
      {screen === "result" && <ResultScreen answers={answers} onReset={handleReset} saveStatus={saveStatus}/>}
    </div>
  );
}
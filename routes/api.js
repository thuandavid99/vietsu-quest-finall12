const express   = require('express');
const mongoose  = require('mongoose');
const siteData  = require('../data/siteData');
const ChatLog   = require('../models/ChatLog');

const router = express.Router();

/* ═══════════════════════════════════════════════════════
   GEMINI AI HELPERR
═══════════════════════════════════════════════════════ */
async function callGemini(userMessage, customSystemPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallbackReply(userMessage);

  const systemPrompt = customSystemPrompt || `Bạn là "Sử Thần AI" — trợ lý học tập Lịch sử Việt Nam của nền tảng Việt Sử Quest, dành cho học sinh THCS và THPT (lớp 6-12) theo chương trình sách giáo khoa Kết nối tri thức.

Nhiệm vụ:
- Giải thích các sự kiện, nhân vật, giai đoạn lịch sử Việt Nam ngắn gọn, dễ hiểu
- Giúp học sinh ôn tập, ghi nhớ, làm bài tập
- Đưa ra mẹo học, sơ đồ tư duy, câu hỏi ôn tập khi được yêu cầu
- Trả lời bằng tiếng Việt, dùng emoji và bullet points cho sinh động
- Câu trả lời ngắn gọn dưới 250 từ, có cấu trúc rõ ràng
- Phong cách: thân thiện, khích lệ như người thầy tốt bụng`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: systemPrompt + '\n\nHọc sinh hỏi: ' + userMessage }]
      }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 700 }
    })
  });

  if (!response.ok) { console.error('Gemini error:', await response.text()); return fallbackReply(userMessage); }
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || fallbackReply(userMessage);
}

/* ── Fallback khi chưa có API key ─────────────────────── */
function fallbackReply(input) {
  const msg = (input || '').toLowerCase();
  if (msg.includes('cách mạng tháng tám') || msg.includes('tháng 8')) return '⭐ **Cách mạng tháng Tám 1945**\n\n• **Thời cơ:** Nhật đầu hàng 8/1945\n• **Diễn biến:** Tổng khởi nghĩa 14-25/8, giành chính quyền 15 ngày\n• **Kết quả:** VNDCCH ra đời, Bác Hồ đọc Tuyên ngôn 2/9/1945\n\n💡 Nhớ: **Thời cơ → Tổng KN → Độc lập**';
  if (msg.includes('bạch đằng')) return '⚔️ **Chiến thắng Bạch Đằng**\n\n• **938:** Ngô Quyền đánh Nam Hán — kết thúc 1000 năm Bắc thuộc\n• **1288:** Trần Hưng Đạo phá Nguyên Mông lần 3\n• **Nghệ thuật:** Cọc nhọn + triều xuống\n\n💡 Nhớ: **938 Ngô Quyền | 1288 Trần Hưng Đạo**';
  if (msg.includes('điện biên')) return '🚩 **Điện Biên Phủ 1954**\n\n• **56 ngày đêm** (13/3 – 7/5/1954)\n• **Chỉ huy:** Đại tướng Võ Nguyên Giáp\n• **Kết quả:** 16.200 Pháp bị tiêu diệt → Hiệp định Genève\n\n💡 Nhớ: **56 ngày – Võ Nguyên Giáp – 7/5/1954**';
  if (msg.includes('lịch sử 9')) return '📚 **Ôn Lịch sử 9 theo 4 cụm:**\n\n• 1919–1930: Phong trào yêu nước, Đảng ra đời\n• 1930–1945: Mặt trận Việt Minh, CM tháng 8\n• 1945–1954: Kháng Pháp, Điện Biên Phủ\n• 1954–1975: Kháng Mỹ, thống nhất 30/4\n\n💡 Học theo: **Hoàn cảnh → Diễn biến → Ý nghĩa**';
  return '🤖 Xin chào! Mình là **Sử Thần AI**.\n\nHỏi mình về:\n• ⚔️ Trận đánh lịch sử\n• 👑 Nhân vật lịch sử\n• 📅 Mốc thời gian\n• 📚 Mẹo ôn thi\n\nVí dụ: *"Giải thích Chiến dịch Điện Biên Phủ"*';
}

/* ═══════════════════════════════════════════════════════
   ROUTES
═══════════════════════════════════════════════════════ */
router.get('/courses', (req, res) => {
  const level = req.query.level;
  const courses = level && level !== 'all'
    ? siteData.courses.filter(c => c.level === level)
    : siteData.courses;
  res.json({ success: true, courses });
});

// Route chính — chatbot trang chủ
router.post('/chat-demo', async (req, res) => {
  const message = (req.body.message || '').trim();
  if (!message) return res.status(400).json({ success: false, reply: 'Bạn hãy nhập câu hỏi nhé.' });

  try {
    const reply = await callGemini(message);
    if (mongoose.connection.readyState === 1) {
      try { await ChatLog.create({ message, reply }); } catch (e) { }
    }
    res.json({ success: true, reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.json({ success: true, reply: fallbackReply(message) });
  }
});

// Route cho trang chi tiết khóa học
router.post('/chat', async (req, res) => {
  const { message, systemPrompt } = req.body;
  if (!message?.trim()) return res.status(400).json({ success: false, reply: 'Vui lòng nhập câu hỏi.' });
  try {
    const reply = await callGemini(message, systemPrompt);
    res.json({ success: true, reply });
  } catch (err) {
    res.json({ success: true, reply: fallbackReply(message) });
  }
});

module.exports = router;

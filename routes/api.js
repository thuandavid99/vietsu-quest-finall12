const express   = require('express');
const https     = require('https');
const mongoose  = require('mongoose');
const siteData  = require('../data/siteData');
const ChatLog   = require('../models/ChatLog');

const router = express.Router();

function callGemini(userMessage, customSystemPrompt) {
  return new Promise((resolve) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { resolve(fallbackReply(userMessage)); return; }

    const systemPrompt = customSystemPrompt || `Bạn là "Sử Thần AI" — trợ lý học tập Lịch sử Việt Nam của Việt Sử Quest, dành cho học sinh lớp 6-12 theo sách Kết nối tri thức. Trả lời bằng tiếng Việt, ngắn gọn dưới 250 từ, dùng emoji và bullet points. Phong cách thân thiện, dễ hiểu.`;

    const bodyData = JSON.stringify({
      contents: [{
        parts: [{ text: systemPrompt + '\n\nHọc sinh hỏi: ' + userMessage }]
      }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 700 }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          resolve(text || fallbackReply(userMessage));
        } catch (e) {
          console.error('Gemini parse error:', e);
          resolve(fallbackReply(userMessage));
        }
      });
    });

    req.on('error', (e) => {
      console.error('Gemini request error:', e);
      resolve(fallbackReply(userMessage));
    });

    req.write(bodyData);
    req.end();
  });
}

function fallbackReply(input) {
  const msg = (input || '').toLowerCase();
  if (msg.includes('cách mạng tháng tám')) return '⭐ **Cách mạng tháng Tám 1945**\n\n• **Thời cơ:** Nhật đầu hàng 8/1945\n• **Diễn biến:** Tổng khởi nghĩa 14-25/8, giành chính quyền 15 ngày\n• **Kết quả:** VNDCCH ra đời, Bác Hồ đọc Tuyên ngôn 2/9/1945';
  if (msg.includes('bạch đằng')) return '⚔️ **Chiến thắng Bạch Đằng**\n\n• **938:** Ngô Quyền đánh Nam Hán\n• **1288:** Trần Hưng Đạo phá Nguyên Mông lần 3\n• **Nghệ thuật:** Cọc nhọn + triều xuống';
  if (msg.includes('điện biên')) return '🚩 **Điện Biên Phủ 1954**\n\n• **56 ngày đêm** (13/3–7/5/1954)\n• **Chỉ huy:** Đại tướng Võ Nguyên Giáp\n• **Kết quả:** Pháp đầu hàng → Hiệp định Genève';
  return '🤖 Xin chào! Mình là **Sử Thần AI**. Hỏi mình về lịch sử Việt Nam nhé!';
}

router.get('/courses', (req, res) => {
  const level = req.query.level;
  const courses = level && level !== 'all'
    ? siteData.courses.filter(c => c.level === level)
    : siteData.courses;
  res.json({ success: true, courses });
});

router.post('/chat-demo', async (req, res) => {
  const message = (req.body.message || '').trim();
  if (!message) return res.status(400).json({ success: false, reply: 'Bạn hãy nhập câu hỏi nhé.' });
  try {
    const reply = await callGemini(message);
    if (mongoose.connection.readyState === 1) {
      try { await ChatLog.create({ message, reply }); } catch (e) {}
    }
    res.json({ success: true, reply });
  } catch (err) {
    res.json({ success: true, reply: fallbackReply(message) });
  }
});

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

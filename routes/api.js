const express = require('express');
const mongoose = require('mongoose');
const siteData = require('../data/siteData');
const ChatLog = require('../models/ChatLog');

const router = express.Router();

function buildChatReply(input) {
  const message = input.toLowerCase();

  if (message.includes('cách mạng tháng tám')) {
    return 'Cách mạng tháng Tám năm 1945 là cuộc tổng khởi nghĩa giành chính quyền trong cả nước, đưa đến sự ra đời của nước Việt Nam Dân chủ Cộng hòa. Bạn nên nhớ theo 3 ý: thời cơ - tổng khởi nghĩa - ý nghĩa lịch sử.';
  }

  if (message.includes('bạch đằng')) {
    return 'Chiến thắng Bạch Đằng gắn với nghệ thuật quân sự lợi dụng địa hình sông nước và bãi cọc. Muốn học nhanh, bạn hãy nhớ: nhân vật - Ngô Quyền, năm - 938, ý nghĩa - chấm dứt ách đô hộ phương Bắc.';
  }

  if (message.includes('mốc thời gian') || message.includes('học thuộc')) {
    return 'Để học mốc thời gian hiệu quả, bạn hãy chia theo cụm chủ đề, đặt lên timeline và ôn lặp lại sau 1 ngày - 3 ngày - 7 ngày. Trên website, bạn có thể dùng game kéo thả timeline để nhớ lâu hơn.';
  }

  if (message.includes('lịch sử 9') || message.includes('ôn lịch sử 9')) {
    return 'Với Lịch sử 9, bạn nên ôn theo 4 cụm lớn: Việt Nam 1919-1930, 1930-1945, 1945-1954 và 1954-1975. Mỗi cụm học theo khung: hoàn cảnh - diễn biến - kết quả - ý nghĩa.';
  }

  if (message.includes('triều đại')) {
    return 'Mẹo nhớ triều đại: chia thành cụm lớn như Ngô - Đinh - Tiền Lê, rồi Lý - Trần - Hồ, rồi Lê sơ - Mạc - Lê trung hưng - Tây Sơn - Nguyễn. Đừng cố học rời từng tên, hãy học theo chuỗi kế tiếp.';
  }

  return 'Mình là chatbot demo của Việt Sử Quest. Bạn có thể hỏi về Cách mạng tháng Tám, chiến thắng Bạch Đằng, cách học thuộc mốc thời gian, ôn Lịch sử 9 hoặc mẹo nhớ triều đại.';
}

router.get('/courses', (req, res) => {
  const level = req.query.level;
  const courses = level && level !== 'all'
    ? siteData.courses.filter((course) => course.level === level)
    : siteData.courses;

  res.json({ success: true, courses });
});

router.post('/chat-demo', async (req, res) => {
  const message = (req.body.message || '').trim();

  if (!message) {
    return res.status(400).json({
      success: false,
      reply: 'Bạn hãy nhập câu hỏi để mình hỗ trợ nhé.'
    });
  }

  const reply = buildChatReply(message);

  if (mongoose.connection.readyState === 1) {
    try {
      await ChatLog.create({ message, reply });
    } catch (error) {
      console.error('Không thể lưu chat log:', error.message);
    }
  }

  res.json({ success: true, reply });
});

module.exports = router;

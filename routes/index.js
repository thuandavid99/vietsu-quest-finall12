const express  = require('express');
const router   = express.Router();
const siteData = require('../data/siteData');

router.get('/', (req, res) => {
  res.render('index', { pageTitle: 'Trang chủ', data: siteData });
});

// Lớp 6 — trang chi tiết riêng với sơ đồ tư duy
router.get('/courses/ls6', (req, res) => {
  res.render('courses/ls6', {
    pageTitle: 'Lịch sử 6 – Kết nối tri thức',
    siteName: siteData.brand.name,
    brand: siteData.brand
  });
});

// Các khóa học khác (placeholder)
router.get('/courses/:id', (req, res) => {
  const course = siteData.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).render('404', { pageTitle: '404', siteName: siteData.brand.name, brand: siteData.brand });
  res.render('index', { pageTitle: course.title, data: siteData });
});

router.get('/games/dien-bien-phu', (req, res) => {
  res.render('games/dien-bien-phu', { pageTitle: 'Điện Biên Phủ 1954 – Game Lịch Sử', brand: siteData.brand });
});
router.get('/games/ai-la-nhan-vat', (req, res) => {
  res.render('games/ai-la-nhan-vat', { pageTitle: 'Ai là nhân vật? – Game Đoán Lịch Sử', brand: siteData.brand });
});
router.get('/games/flashcard', (req, res) => {
  res.render('games/flashcard', { pageTitle: 'Flashcard Quizlet – Ôn Lịch Sử', brand: siteData.brand });
});

module.exports = router;

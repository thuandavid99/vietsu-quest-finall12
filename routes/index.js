const express  = require('express');
const router   = express.Router();
const siteData = require('../data/siteData');

router.get('/', (req, res) => {
  res.render('index', { pageTitle: 'Trang chủ', data: siteData });
});

router.get('/games/dien-bien-phu', (req, res) => {
  res.render('games/dien-bien-phu', {
    pageTitle: 'Điện Biên Phủ 1954 – Game Lịch Sử',
    brand: siteData.brand
  });
});

router.get('/games/ai-la-nhan-vat', (req, res) => {
  res.render('games/ai-la-nhan-vat', {
    pageTitle: 'Ai là nhân vật? – Game Đoán Lịch Sử',
    brand: siteData.brand
  });
});

router.get('/games/flashcard', (req, res) => {
  res.render('games/flashcard', {
    pageTitle: 'Flashcard Quizlet – Ôn Lịch Sử',
    brand: siteData.brand
  });
});

module.exports = router;

require('dotenv').config();

const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const siteData = require('./data/siteData');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.siteName = siteData.brand.name;
  res.locals.currentYear = new Date().getFullYear();
  res.locals.dbEnabled = Boolean(process.env.MONGODB_URI);
  next();
});

app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: siteData.brand.name,
    dbMode: process.env.MONGODB_URI ? 'mongodb' : 'demo-data'
  });
});

app.use((req, res) => {
  res.status(404).render('404', {
    pageTitle: 'Không tìm thấy trang',
    brand: siteData.brand
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.');
});

app.listen(PORT, () => {
  console.log(`\n${siteData.brand.name} đang chạy tại http://localhost:${PORT}`);
  console.log(process.env.MONGODB_URI
    ? 'Đã bật kết nối MongoDB.'
    : 'Đang chạy ở chế độ demo data. Bạn có thể thêm MONGODB_URI sau.');
});

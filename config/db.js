const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('MONGODB_URI chưa được cấu hình. Bỏ qua kết nối database và dùng dữ liệu mẫu.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Kết nối MongoDB thành công.');
  } catch (error) {
    console.error('Không thể kết nối MongoDB:', error.message);
    console.log('Ứng dụng vẫn tiếp tục chạy với dữ liệu mẫu.');
  }
}

module.exports = connectDB;

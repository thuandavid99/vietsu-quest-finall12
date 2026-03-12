# Việt Sử Quest 🇻🇳

Nền tảng học Lịch sử Việt Nam bằng trải nghiệm — cho học sinh lớp 6-12.

## 🚀 Deploy lên Vercel

```bash
# 1. Cài Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy từ thư mục project
vercel

# 4. Deploy production
vercel --prod
```

**Biến môi trường trên Vercel (tùy chọn):**
- `MONGODB_URI` — MongoDB Atlas connection string (nếu muốn lưu chat log)
- App hoạt động bình thường không cần MongoDB (demo mode)

## 🏃 Chạy local

```bash
npm install
npm run dev
# → http://localhost:3000
```

## 📁 Cấu trúc dự án

```
vietsu-quest/
├── app.js                    # Entry point Express
├── vercel.json               # Vercel deployment config
├── routes/
│   ├── index.js              # Page routes
│   └── api.js                # API routes (chatbot)
├── views/
│   ├── index.ejs             # Trang chủ
│   ├── games/
│   │   ├── dien-bien-phu.ejs  # Game Điện Biên Phủ 1954
│   │   └── ai-la-nhan-vat.ejs # Game Ai là nhân vật?
│   └── partials/
├── public/
│   ├── css/style.css
│   └── js/main.js
└── data/siteData.js          # Toàn bộ nội dung website
```

## 🎮 Games hiện có

| Game | Route | Trạng thái |
|------|-------|-----------|
| Điện Biên Phủ 1954 | `/games/dien-bien-phu` | ✅ Live |
| Ai là nhân vật? | `/games/ai-la-nhan-vat` | ✅ Live |
| Kéo thả timeline | - | 🔜 Sắp ra |
| Đấu trường quiz | - | 🔜 Sắp ra |

## 📝 Tech Stack

- **Backend:** Node.js + Express 4
- **Template:** EJS
- **Database:** MongoDB (optional, via Mongoose)
- **Deploy:** Vercel (Serverless Node.js)
- **Frontend:** Vanilla JS + CSS3 (no frameworks)

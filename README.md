# 📚 English Quiz App — Web Luyện Thi Trắc Nghiệm Tiếng Anh JSON

> **Live Demo (Vercel)**: [https://english-quiz-app.vercel.app](https://english-quiz-app.vercel.app)  
> **GitHub Repository**: [https://github.com/HiepF5/english-quiz-app](https://github.com/HiepF5/english-quiz-app)

Ứng dụng web luyện thi trắc nghiệm tiếng Anh hiện đại, hỗ trợ nạp đề thi từ các file JSON, tự động phân tích cú pháp từ AI (ChatGPT/Gemini), tích hợp đẩy đề tự động lên GitHub để Vercel Re-deploy và lưu trữ tiến độ học tập bền vững trên từng máy khách.

---

## 🌟 Tính Năng Nổi Bật

### 1. 🗂️ Quản Lý Đề Thi JSON Đa Dạng
- **Bộ đề bài mẫu sẵn có**: Thì Hiện tại đơn & TOEIC (Day 1), Quá khứ đơn & Quá khứ tiếp diễn (Day 2), Từ vựng TOEIC thương mại (Day 3).
- **Kéo & Thả File JSON**: Kéo trực tiếp bất kỳ file `.json` đề bài nào từ máy tính vào trang web.
- **Dán Mã JSON Direct Paste**: Dán trực tiếp đoạn mã JSON copy từ AI để hệ thống tự động đọc và phát hiện câu hỏi (Auto-Parse).
- **Trình Tạo JSON Trực Quan**: Tự biên soạn bài thi trực tiếp trên giao diện web, hỗ trợ tải file `.json` hoặc sao chép mã.

### 2. 🤖 Tích Hợp Prompt AI Tự Động Tạo JSON
- Tích hợp sẵn mẫu **Prompt AI chuẩn 100%** trong ứng dụng (tab *"Prompt AI Tạo JSON Tự Động"*).
- Chỉ cần dán bài thi dạng chữ/Word/PDF vào ChatGPT/Gemini ➔ AI sẽ trả về đúng khối mã JSON để nạp vào web.

### 3. 🚀 Tự Động Commit GitHub & Re-deploy Vercel
- Tích hợp **GitHub Content REST API**: Nhập mã Personal Access Token 1 lần để tự động tạo file `.json` mới trong thư mục `src/data/` trên GitHub.
- Tự động chuyển đổi tên bài thi tiếng Việt thành tên file chuẩn (`slugify`) kèm mã thời gian duy nhất (`Timestamp`).
- Vercel tự động nhận diện commit và Re-deploy bài thi mới cố định cho **TẤT CẢ** người dùng trên thế giới trong ~30 giây.
- Cho phép gõ `git pull origin main` ở máy tính để kéo file `.json` mới về ổ đĩa local.

### 4. 💾 Lưu Trữ Bền Vững & Dấu Hiệu Đã Thi (LocalStorage)
- **Lưu đề bài tự nạp**: Tất cả đề bài bạn nạp/dán sẽ tự động lưu vào `LocalStorage`, **không bao giờ bị mất khi bấm F5** hay tắt trình duyệt.
- **Dấu hiệu Đã Thi / Đã Luyện**: Thẻ bài thi tự động gắn huy hiệu màu xanh nõn chuối (`Emerald Badge`) hiển thị điểm cao nhất, tỷ lệ %, và số lần làm bài.
- **Bộ lọc thông minh**: Lọc bài thi theo danh mục (Grammar, Vocab...) hoặc theo trạng thái (*Tất cả*, *Đã làm*, *Chưa làm*).

### 5. 🎧 Trải Nghiệm Luyện Thi Hiện Đại
- **Thi tính giờ (Exam Mode)**: Đồng hồ đếm ngược, thanh tiến độ, bảng nhảy câu hỏi (Tracker), tổng kết điểm số & hiệu ứng Confetti.
- **Luyện tập (Practice Mode)**: Hiện đáp án đúng/sai & bài giải giải thích ngữ pháp tiếng Việt chi tiết ngay lập tức.
- **Phát âm tiếng Anh (TTS)**: Đọc phát âm chuẩn câu hỏi tiếng Anh qua Web Speech API.
- **Đánh dấu (Bookmark)**: Lưu câu hỏi khó để xem lại.

---

## 🛠️ Công Nghệ Sử Dụng

- **Core**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + Custom Glassmorphism UI
- **Icons**: Lucide React
- **Animations**: Canvas Confetti
- **Deployment**: Vercel Static Single Page Application

---

## 🚀 Hướng Dẫn Chạy & Deploy

### 1. Chạy Tại Máy Local:
```bash
cd english-quiz-app

# Cài đặt thư viện
npm install

# Chạy bản Dev
npm run dev

# Kiểm tra bản Build
npm run build
```

### 2. Deploy Lên Vercel:
```bash
# Deploy trực tiếp bằng Vercel CLI
npx vercel --prod
```

---

## 📄 Nhật Ký Nâng Cấp (Release Notes)

Chi tiết tất cả các phiên bản và lịch sử cập nhật tính năng được ghi chép đầy đủ tại file [CHANGELOG.md](./CHANGELOG.md).

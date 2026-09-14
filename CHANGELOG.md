# 📜 Nhật Ký Cập Nhật & Nâng Cấp (Release Notes)

Tất cả những nâng cấp, sửa lỗi và cải tiến của dự án **English Quiz App** được ghi chép chi tiết tại đây.

---

## 🌟 [v1.5.0] - 2026-09-15
### ✨ Tính Năng Mới Đột Phá
- **Tự Động Chuyển Đề Thi Thô Thành JSON Bằng AI & Push Vercel (`AiConverterModal.tsx` & `gemini.ts`)**:
  - Tích hợp trực tiếp **Google Gemini 2.0 Flash API** vào ứng dụng web.
  - Cho phép người dùng **ném/dán bất kỳ bài thi thô nào** (Word, PDF, văn bản thô).
  - AI tự động phân tích câu hỏi, mảng lựa chọn A/B/C/D, nhận diện đáp án đúng `correct` (0-3) và **tự viết lời giải thích ngữ pháp tiếng Việt chi tiết**.
  - Tích hợp nút 1-click **"🚀 Push Lên GitHub & Vercel"** trực tiếp sau khi AI sinh bài thi!

---

## 🟢 [v1.4.0] - 2026-09-15
### ✨ Tính Năng Mới
- **Ghi Nhớ Tiến Độ & Dấu Hiệu Đã Thi Per-Client**:
  - Tự động lưu lịch sử hoàn thành bài thi vào `LocalStorage` trên từng thiết bị.
  - Hiển thị huy hiệu **"Đã Hoàn Thành"** (`Emerald Badge`) trên thẻ bài thi kèm điểm số cao nhất (Ví dụ: `18/20 - 90%`).
  - Hiển thị số lần đã làm bài (*Ví dụ: Đã làm 2 lần*).
  - Đổi nút hành động thành *"Thi Lại"* / *"Luyện Lại"* giúp giao diện trực quan hơn.
  - Thêm bộ lọc nhanh bài thi theo trạng thái: **Tất cả**, **Đã làm**, **Chưa làm**.

---

## 🔵 [v1.3.0] - 2026-09-14
### ✨ Tính Năng Mới
- **Vite Glob Import Tự Động**: Cập nhật `import.meta.glob('./data/*.json')` tự động quét & nạp toàn bộ file `.json` mới trong `src/data/` khi Vercel Re-deploy.
- **Bổ Sung Trình Dán Mã JSON Direct Paste (`JsonPasteModal.tsx`)**:
  - Ô dán mã JSON hỗ trợ phân tích dữ liệu tự động (Auto-Parse).
  - Tự động kiểm tra lỗi cú pháp JSON tức thì (Real-time Validation).
- **Lưu Trữ Đề Bài Trong LocalStorage**: Đảm bảo tất cả đề dán/nạp thủ công **không bị mất khi F5 hoặc tải lại trang**.

### 🐛 Sửa Lỗi (Bug Fixes)
- Sửa lỗi tạo tên file tiếng Việt bị trùng (`_.json`): Thêm hàm khử dấu tiếng Việt chuẩn (`slugify`) + gắn mã thời gian duy nhất (`Timestamp`), đảm bảo mỗi lần push lên GitHub tạo ra một file `.json` riêng biệt.

---

## 🟣 [v1.2.0] - 2026-09-14
### ✨ Tính Năng Mới
- **Đẩy Đề Bài Tự Động Lên GitHub & Vercel (`GithubPushModal.tsx`)**:
  - Tích hợp **GitHub Content REST API** hỗ trợ commit file `.json` trực tiếp vào repo `HiepF5/english-quiz-app` mà không cần mở Terminal.
  - Lưu mã GitHub Personal Access Token an toàn trên trình duyệt người dùng.
  - Kích hoạt Vercel tự động Re-deploy bài thi mới cho toàn bộ người dùng sau ~30 giây.
- **Tab Prompt AI Tạo JSON Tự Động (`JsonTemplateModal.tsx`)**:
  - Bổ sung câu lệnh Prompt chuẩn giúp chuyển đổi mọi đề trắc nghiệm Word/PDF thành file JSON bằng ChatGPT/Gemini.
  - Nút *Sao Chép Prompt AI* tiện lợi 1-click.

---

## 🟡 [v1.1.0] - 2026-09-14
### ✨ Tính Năng Mới
- Chuyển đổi dự án sang repo mới: `HiepF5/english-quiz-app`.
- Cấu hình file `vercel.json` chuẩn cho ứng dụng Single Page Application (SPA).
- Bổ sung Nút & Modal **"Cấu Trúc JSON Mẫu"** giải thích chi tiết các trường trong file JSON.

---

## 🔴 [v1.0.0] - 2026-09-14
### 🚀 Khởi Tạo Dự Án
- Xây dựng ứng dụng Web Luyện Thi Trắc Nghiệm Tiếng Anh với React + Vite + TypeScript + Tailwind CSS.
- Trích xuất 20 câu hỏi & giải thích từ file gốc `Untitled-1.html` thành `day1_present_simple.json`.
- Xây dựng 2 bộ đề bài cố định: Quá khứ đơn (`day2_past_tenses.json`) và Từ vựng TOEIC (`day3_toeic_vocab.json`).
- Hỗ trợ 2 chế độ thi: **Thi tính giờ (Exam Mode)** & **Luyện tập (Practice Mode)**.
- Tích hợp giọng đọc phát âm tiếng Anh (Text-To-Speech), Đánh dấu câu hỏi (Bookmark), Đồng hồ đếm ngược và Bảng nhảy câu hỏi (Tracker Grid).

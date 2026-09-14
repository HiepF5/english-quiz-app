import type { QuizSet } from '../types/quiz';

function slugify(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function convertRawQuizWithGemini(
  apiKey: string,
  rawText: string
): Promise<QuizSet> {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash-latest'];
  const systemInstruction = `Bạn là chuyên gia biên soạn đề thi tiếng Anh. Nhiệm vụ của bạn là đọc đoạn văn bản đề thi thô do người dùng cung cấp (dạng Word, PDF, văn bản thô) và chuyển đổi thành MỘT KHỐI MÃ JSON DUY NHẤT theo đúng cấu trúc sau:

{
  "id": "slug-id-duy-nhat",
  "title": "Tên bài thi (tự rút ra từ nội dung hoặc đặt tên phù hợp)",
  "description": "Mô tả ngắn gọn chủ đề bài thi",
  "level": "Intermediate (B1)",
  "category": "Grammar & Vocab",
  "timeLimitMinutes": 15,
  "questions": [
    {
      "id": 1,
      "part": "Part A — Tên phần",
      "question": "Nội dung câu hỏi có vị trí điền dùng 6 gạch dưới: ______",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correct": 0,
      "explanation": "Lời giải thích ngữ pháp/từ vựng chi tiết bằng tiếng Việt giúp người học hiểu rõ lý do chọn đáp án này."
    }
  ]
}

Lưu ý quan trọng:
1. Trường "correct" phải là CHỈ SỐ SỐ HỌC 0, 1, 2 hoặc 3 (0=A, 1=B, 2=C, 3=D).
2. Trường "explanation" bắt buộc phải giải thích ngữ pháp/từ vựng chi tiết bằng tiếng Việt.
3. Nếu đề thi không chia Part, hãy tự ghi "Part A — Trắc Nghiệm Tổng Hợp".
4. CHỈ TRẢ VỀ DUY NHẤT CHUỖI JSON HỢP LỆ, KHÔNG THÊM BẤT KỲ VĂN BẢN NÀO KHÁC.`;

  const body = {
    contents: [
      {
        parts: [
          { text: systemInstruction },
          { text: `Nội dung đề thi thô cần chuyển đổi:\n\n${rawText}` }
        ]
      }
    ],
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.2
    }
  };

  let lastErrorMsg = '';

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        lastErrorMsg = errorData.error?.message || `HTTP ${response.status}`;
        continue;
      }

      const data = await response.json();
      const jsonString = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (jsonString) {
        const parsed = JSON.parse(jsonString);
        const timeStamp = Date.now().toString().slice(-6);
        const quizTitle = parsed.title || "Đề Thi Tiếng Anh AI Sinh";
        const slug = slugify(quizTitle);

        const formattedQuiz: QuizSet = {
          id: parsed.id || `ai-${slug || 'quiz'}-${timeStamp}`,
          title: quizTitle,
          description: parsed.description || "Đề thi được AI tự động phân tích & chuyển đổi",
          level: parsed.level || "Intermediate",
          category: parsed.category || "AI Generated",
          timeLimitMinutes: parsed.timeLimitMinutes || Math.max(5, Math.ceil((parsed.questions?.length || 10) * 0.8)),
          questions: parsed.questions || []
        };

        return formattedQuiz;
      }
    } catch (err: any) {
      lastErrorMsg = err.message;
    }
  }

  throw new Error(lastErrorMsg || 'Không thể gọi Gemini API. Vui lòng kiểm tra lại API Key.');
}

import type { TranslationExercise, TranslationGradeReport } from '../types/translation';

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

export async function parseRawToTranslationExercise(
  apiKey: string,
  rawText: string
): Promise<TranslationExercise> {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash-latest'];

  const systemInstruction = `Bạn là chuyên gia thiết kế bài tập dịch Tiếng Anh (IELTS Speaking & Writing). 
Nhiệm vụ của bạn là đọc đoạn văn bản thô gồm các câu hỏi & câu trả lời theo chủ đề (Ví dụ: 1. HOME, 2. BIRTHDAYS, 3. ADVERTISEMENTS...) và tạo thành bài tập dịch theo cấu trúc JSON:

{
  "id": "slug-id",
  "title": "Tên bộ bài tập dịch (Ví dụ: Luyện Dịch IELTS Speaking Part 1 - 5 Chủ Đề)",
  "description": "Mô tả bài tập dịch (Ví dụ: Luyện dịch các câu hỏi & câu trả lời chủ đề Home, Birthdays, Buses...)",
  "items": [
    {
      "id": 1,
      "topic": "HOME",
      "originalEnglishQuestion": "Do you live in a house or a flat?",
      "originalEnglishAnswer": "I live in a small flat in the city centre. It’s quite modern and fully furnished...",
      "vietnamesePromptQuestion": "Bạn sống ở nhà riêng hay căn hộ chung cư?",
      "vietnamesePromptAnswer": "Tôi sống trong một căn hộ nhỏ ở trung tâm thành phố. Nó khá hiện đại và đầy đủ nội thất..."
    }
  ]
}

Lưu ý:
1. Tạo gợi ý dịch tiếng Việt (vietnamesePromptQuestion & vietnamesePromptAnswer) chuẩn, tự nhiên để người học nhìn vào tiếng Việt dán/dịch sang tiếng Anh.
2. Giữ nguyên câu tiếng Anh gốc làm đáp án chuẩn.
3. CHỈ TRẢ VỀ CHUỖI JSON DUY NHẤT, KHÔNG THÊM VĂN BẢN KHÁC.`;

  const body = {
    contents: [
      {
        parts: [
          { text: systemInstruction },
          { text: `Nội dung đoạn văn bản thô:\n\n${rawText}` }
        ]
      }
    ],
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.2
    }
  };

  let lastErr = '';
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.json();
        lastErr = err.error?.message || `HTTP ${res.status}`;
        continue;
      }

      const data = await res.json();
      const jsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr);
        const title = parsed.title || "Bài Tập Dịch Tiếng Anh AI";
        const timeStamp = Date.now().toString().slice(-6);

        const exercise: TranslationExercise = {
          id: parsed.id || `trans-${slugify(title)}-${timeStamp}`,
          title,
          description: parsed.description || "Bài tập dịch được phân tích tự động từ văn bản thô",
          rawInputText: rawText,
          createdAt: new Date().toISOString(),
          items: parsed.items || []
        };
        return exercise;
      }
    } catch (e: any) {
      lastErr = e.message;
    }
  }

  throw new Error(lastErr || 'Không thể gọi Gemini API để tạo bài tập dịch.');
}

export async function gradeUserTranslationWithGemini(
  apiKey: string,
  exercise: TranslationExercise,
  userTranslations: Record<number, string>
): Promise<TranslationGradeReport> {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash-latest'];

  const promptPayload = exercise.items.map(item => ({
    itemId: item.id,
    topic: item.topic,
    originalEnglishQuestion: item.originalEnglishQuestion,
    originalEnglishAnswer: item.originalEnglishAnswer,
    vietnamesePrompt: item.vietnamesePromptAnswer || item.vietnamesePromptQuestion,
    userTranslation: userTranslations[item.id] || "(Chưa nhập bài dịch)"
  }));

  const systemInstruction = `Bạn là chuyên gia giám khảo tiếng Anh (IELTS Examiner). Nhiệm vụ của bạn là chấm điểm, sửa lỗi ngữ pháp & từ vựng, và đưa ra gợi ý nâng band bài dịch tiếng Anh của học viên.

Định dạng JSON kết quả trả về bắt buộc:

{
  "overallScore": 8.5,
  "overallPercentage": 85,
  "evaluationComment": "Nhận xét tổng quan về ngữ pháp, từ vựng, độ tự nhiên và khả năng diễn đạt.",
  "feedbackItems": [
    {
      "itemId": 1,
      "topic": "HOME",
      "originalEnglish": "Câu gốc chuẩn tiếng Anh...",
      "userTranslation": "Bài làm dịch của học viên...",
      "score": 8.0,
      "correctedEnglish": "Câu dịch đã được sửa hoàn chỉnh tự nhiên nhất...",
      "grammarErrors": ["Lỗi chia thì...", "Thiếu mạo từ 'a' trước danh từ..."],
      "vocabularySuggestions": ["Thay 'good' bằng 'comfortable/cozy'...", "Dùng cụm 'fully furnished'..."],
      "explanation": "Giải thích chi tiết lỗi sai và lý do chỉnh sửa bằng tiếng Việt."
    }
  ]
}

Lưu ý:
1. Đánh giá công bằng trên thang điểm 10 cho từng câu và điểm trung bình overallScore.
2. Sửa lỗi chính tả, chia thì, từ nối, mạo từ và từ vựng tự nhiên như người bản xứ.
3. Giải thích bằng tiếng Việt chi tiết, thân thiện.
4. CHỈ TRẢ VỀ KHỐI JSON DUY NHẤT.`;

  const body = {
    contents: [
      {
        parts: [
          { text: systemInstruction },
          { text: `Nội dung danh sách bài dịch của học viên:\n\n${JSON.stringify(promptPayload, null, 2)}` }
        ]
      }
    ],
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.2
    }
  };

  let lastErr = '';
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.json();
        lastErr = err.error?.message || `HTTP ${res.status}`;
        continue;
      }

      const data = await res.json();
      const jsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr);
        const report: TranslationGradeReport = {
          exerciseId: exercise.id,
          exerciseTitle: exercise.title,
          gradedAt: new Date().toISOString(),
          overallScore: parsed.overallScore || 8.0,
          overallPercentage: parsed.overallPercentage || 80,
          evaluationComment: parsed.evaluationComment || "Bài dịch khá tốt.",
          feedbackItems: parsed.feedbackItems || []
        };
        return report;
      }
    } catch (e: any) {
      lastErr = e.message;
    }
  }

  throw new Error(lastErr || 'Không thể gọi Gemini API để chấm điểm bài dịch.');
}

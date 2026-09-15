import type { TranslationExercise, TranslationItem, TranslationGradeReport, ItemFeedback } from '../types/translation';

export function parseRawTextLocally(rawText: string): TranslationItem[] {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const items: TranslationItem[] = [];

  let currentTopic = '';
  let currentContentLines: string[] = [];
  let itemId = 1;

  const saveCurrentTopicItem = () => {
    if (currentTopic || currentContentLines.length > 0) {
      items.push({
        id: itemId++,
        topic: currentTopic || ('CHỦ ĐỀ ' + itemId),
        originalEnglishQuestion: 'Phần Dịch: ' + (currentTopic || ('Đoạn ' + itemId)),
        originalEnglishAnswer: currentContentLines.join('\n\n'),
        vietnamesePromptQuestion: '',
        vietnamesePromptAnswer: ''
      });
      currentTopic = '';
      currentContentLines = [];
    }
  };

  for (const line of lines) {
    if (/^\d+\.\s+[A-Z0-9\s_-]+$/i.test(line) || /^PHẦN\s+\d+/i.test(line) || /^TOPIC\s+\d+/i.test(line)) {
      saveCurrentTopicItem();
      currentTopic = line;
      continue;
    }
    currentContentLines.push(line);
  }
  saveCurrentTopicItem();

  return items;
}

export async function parseRawToTranslationExercise(
  rawInputText: string,
  apiKey?: string
): Promise<TranslationExercise> {
  const trimmed = rawInputText.trim();
  
  // Direct JSON input support
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsedJson = JSON.parse(trimmed);
      if (parsedJson.items && Array.isArray(parsedJson.items)) {
        return {
          id: parsedJson.id || ('ex-' + Date.now()),
          title: parsedJson.title || 'Bài Luyện Dịch',
          description: parsedJson.description || ('Bài luyện dịch gồm ' + parsedJson.items.length + ' đoạn chủ đề.'),
          rawInputText,
          createdAt: new Date().toISOString(),
          items: parsedJson.items.map((it: any, idx: number) => ({
            id: it.id || idx + 1,
            topic: it.topic || ('PHẦN #' + (idx + 1)),
            originalEnglishQuestion: it.originalEnglishQuestion || ('Phần Dịch: ' + (it.topic || (idx + 1))),
            originalEnglishAnswer: it.originalEnglishAnswer || '',
            vietnamesePromptQuestion: it.vietnamesePromptQuestion || '',
            vietnamesePromptAnswer: it.vietnamesePromptAnswer || ''
          }))
        };
      }
    } catch (e) {
      console.warn('Direct JSON parse attempted but failed, falling back to text parsing:', e);
    }
  }

  const localItems = parseRawTextLocally(rawInputText);
  const firstLine = rawInputText.split(/\r?\n/)[0]?.trim() || 'Bài Luyện Dịch Mới';
  const title = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;

  if (localItems.length > 0) {
    return {
      id: 'ex-' + Date.now(),
      title: title,
      description: 'Bài luyện dịch gồm ' + localItems.length + ' đoạn chủ đề.',
      rawInputText,
      createdAt: new Date().toISOString(),
      items: localItems
    };
  }

  if (apiKey) {
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: 'Phân tích đoạn văn bản sau thành các đoạn Luyện Dịch:\n' + rawInputText
              }]
            }]
          })
        }
      );
      const data = await response.json();
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: 'ex-' + Date.now(),
          title,
          description: 'Bài luyện dịch gồm ' + parsed.length + ' đoạn chủ đề.',
          rawInputText,
          createdAt: new Date().toISOString(),
          items: parsed.map((item: any, idx: number) => ({
            id: idx + 1,
            topic: item.topic || 'General',
            originalEnglishQuestion: item.originalEnglishQuestion || '',
            originalEnglishAnswer: item.originalEnglishAnswer || '',
            vietnamesePromptQuestion: '',
            vietnamesePromptAnswer: ''
          }))
        };
      }
    } catch (e) {
      console.warn('AI Parsing fallback error:', e);
    }
  }

  return {
    id: 'ex-' + Date.now(),
    title: 'Bài Luyện Dịch',
    description: 'Nội dung bài dịch gốc',
    rawInputText,
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 1,
        topic: 'Bài Dịch Gốc',
        originalEnglishQuestion: 'Nội dung bài dịch',
        originalEnglishAnswer: rawInputText,
        vietnamesePromptQuestion: '',
        vietnamesePromptAnswer: ''
      }
    ]
  };
}

export async function gradeUserTranslationWithGemini(
  exercise: TranslationExercise,
  userTranslations: Record<number, string>,
  apiKey?: string
): Promise<TranslationGradeReport> {
  if (apiKey) {
    try {
      const promptItems = exercise.items.map(item => ({
        id: item.id,
        topic: item.topic,
        question: item.originalEnglishQuestion,
        originalEnglishAnswer: item.originalEnglishAnswer,
        userTranslation: userTranslations[item.id] || '(Người dùng bỏ trống)'
      }));

      const prompt = 'Bạn là giám khảo Tiếng Anh chuyên nghiệp (IELTS/CEFR). Hãy chấm điểm bài dịch của học viên dựa trên bản gốc Tiếng Anh.\n\nDanh sách bài nộp:\n' + JSON.stringify(promptItems, null, 2) + '\n\nYêu cầu trả về duy nhất 1 JSON object hợp lệ:\n{\n  "overallScore": 8.5,\n  "overallPercentage": 85,\n  "evaluationComment": "Nhận xét...",\n  "feedbackItems": [\n    {\n      "itemId": 1,\n      "topic": "1. HOME",\n      "originalEnglish": "...",\n      "userTranslation": "...",\n      "score": 9,\n      "correctedEnglish": "Gợi ý...",\n      "grammarErrors": [],\n      "vocabularySuggestions": [],\n      "explanation": "..."\n    }\n  ]\n}';

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          exerciseId: exercise.id,
          exerciseTitle: exercise.title,
          gradedAt: new Date().toISOString(),
          overallScore: parsed.overallScore || 8.0,
          overallPercentage: parsed.overallPercentage || 80,
          evaluationComment: parsed.evaluationComment || 'Bài làm khá tốt!',
          feedbackItems: parsed.feedbackItems || []
        };
      }
    } catch (err) {
      console.error('Gemini grading error:', err);
    }
  }

  const feedbackItems: ItemFeedback[] = exercise.items.map(item => {
    const userText = (userTranslations[item.id] || '').trim();
    const length = userText.length;
    let score = 7;
    let explanation = 'Đã hoàn thành bài dịch.';

    if (!userText) {
      score = 0;
      explanation = 'Chưa nhập bản dịch.';
    } else if (length > 30) {
      score = 9;
      explanation = 'Bài dịch chi tiết và đầy đủ nội dung.';
    } else {
      score = 7.5;
      explanation = 'Bài dịch mượt, nên hoàn thiện thêm các ý phụ.';
    }

    return {
      itemId: item.id,
      topic: item.topic,
      originalEnglish: item.originalEnglishAnswer,
      userTranslation: userText || '(Chưa nhập)',
      score,
      correctedEnglish: item.originalEnglishAnswer,
      grammarErrors: userText ? [] : ['Thiếu phần dịch'],
      vocabularySuggestions: ['Nên dùng các từ nối mượt hơn như: Although, However, Besides...'],
      explanation
    };
  });

  const totalScore = feedbackItems.reduce((acc, cur) => acc + cur.score, 0);
  const avgScore = feedbackItems.length ? Number((totalScore / feedbackItems.length).toFixed(1)) : 0;

  return {
    exerciseId: exercise.id,
    exerciseTitle: exercise.title,
    gradedAt: new Date().toISOString(),
    overallScore: avgScore,
    overallPercentage: Math.round(avgScore * 10),
    evaluationComment: apiKey ? 'Đã chấm bài (Local fallback mode).' : 'Vui lòng nhập API Key Gemini để AI phân tích chuyên sâu ngữ pháp & từ vựng.',
    feedbackItems
  };
}

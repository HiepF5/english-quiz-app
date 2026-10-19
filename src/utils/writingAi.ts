import type { AptisWritingTopic, WritingUserAnswers, WritingEvaluationReport } from '../types/writing';

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

export async function gradeWritingWithGemini(
  topic: AptisWritingTopic,
  answers: WritingUserAnswers,
  apiKey: string
): Promise<WritingEvaluationReport> {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash-latest'];

  const promptData = {
    clubTopic: topic.title,
    submission: {
      part1: topic.part1.map(q => ({
        question: q.question,
        targetWords: '1-5 words',
        userAnswer: answers.part1[q.questionNumber] || '(Bỏ trống)'
      })),
      part2: {
        instruction: topic.part2.instruction,
        prompt: topic.part2.prompt,
        targetWords: '20-30 words',
        userAnswer: answers.part2 || '(Bỏ trống)'
      },
      part3: topic.part3.items.map((item, idx) => ({
        speaker: item.speaker,
        question: item.question,
        targetWords: '30-40 words',
        userAnswer: answers.part3[idx] || '(Bỏ trống)'
      })),
      part4: {
        context: topic.part4.context,
        task1_friendEmail: {
          targetWords: 'khoảng 50 words (informal tone)',
          userAnswer: answers.part4_friend || '(Bỏ trống)'
        },
        task2_managerEmail: {
          targetWords: '120-150 words (formal tone)',
          userAnswer: answers.part4_manager || '(Bỏ trống)'
        }
      }
    }
  };

  const systemInstruction = `Bạn là Giám khảo chấm thi Aptis ESOL Writing chính thức của Hội đồng Anh (British Council).
Nhiệm vụ của bạn là đánh giá bài thi viết của thí sinh theo 4 tiêu chí chuẩn Aptis:
1. Task Fulfillment (Hoàn thành yêu cầu đề bài, đúng số lượng từ quy định)
2. Grammatical Knowledge & Accuracy (Độ chính xác và đa dạng ngữ pháp)
3. Vocabulary Range & Precision (Vốn từ vựng, độ tự nhiên, chính tả)
4. Cohesion & Register (Tính liên kết, văn phong thân mật cho bạn bè ở Part 4 Task 1, văn phong trang trọng cho Quản lý ở Part 4 Task 2).

Thang điểm chuẩn Aptis Writing (Tổng 50 điểm):
- Part 1: Tối đa 5 điểm (1 điểm / câu, 1 - 5 từ, trả lời đúng trọng tâm)
- Part 2: Tối đa 7 điểm (20 - 30 từ)
- Part 3: Tối đa 15 điểm (5 điểm / câu, 30 - 40 từ)
- Part 4: Tối đa 23 điểm (Task 1: 8 điểm; Task 2: 15 điểm)

Quy đổi CEFR:
- 0 - 15: A1
- 16 - 25: A2
- 26 - 37: B1
- 38 - 45: B2
- 46 - 50: C1 / C2

YÊU CẦU: Phải trả về DUY NHẤT một chuỗi JSON hợp lệ theo đúng cấu trúc sau (không kèm markdown \`\`\`json):
{
  "overallScore": 42,
  "maxScore": 50,
  "cefrLevel": "B2",
  "overallComment": "Nhận xét tổng quan ưu điểm và các điểm cần cải thiện bằng tiếng Việt...",
  "partScores": {
    "part1": { "score": 5, "max": 5, "feedback": "Nhận xét Part 1..." },
    "part2": { "score": 6, "max": 7, "feedback": "Nhận xét Part 2..." },
    "part3": { "score": 13, "max": 15, "feedback": "Nhận xét Part 3..." },
    "part4": { "score": 18, "max": 23, "feedback": "Nhận xét Part 4..." }
  },
  "corrections": [
    {
      "part": "Part 2",
      "original": "In last day, I had dinner with my girl friend",
      "corrected": "Yesterday, I had dinner with my girlfriend",
      "type": "grammar",
      "explanation": "'In last day' sai diễn đạt thời gian, nên dùng 'Yesterday'. 'Girl friend' viết liền thành 'girlfriend'."
    }
  ],
  "vocabularySuggestions": [
    {
      "originalWord": "cheap",
      "suggestedWord": "budget-friendly / affordable",
      "reason": "Giúp bài viết mang văn phong học thuật và tự nhiên hơn."
    }
  ],
  "improvedSample": {
    "part2": "Đoạn văn viết lại tối ưu Part 2...",
    "part3": [
      "Câu trả lời A viết lại tối ưu...",
      "Câu trả lời B viết lại tối ưu...",
      "Câu trả lời C viết lại tối ưu..."
    ],
    "part4_friend": "Bản mẫu thư gửi bạn bè band B2/C1...",
    "part4_manager": "Bản mẫu thư gửi quản lý band B2/C1..."
  }
}`;

  const body = {
    contents: [
      {
        parts: [
          { text: systemInstruction },
          { text: `Bài thi của thí sinh cần chấm:\n${JSON.stringify(promptData, null, 2)}` }
        ]
      }
    ],
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.3
    }
  };

  let lastError = '';

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errJson = await response.json();
        lastError = errJson.error?.message || `HTTP ${response.status}`;
        continue;
      }

      const data = await response.json();
      const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        return {
          overallScore: parsed.overallScore ?? 35,
          maxScore: 50,
          cefrLevel: parsed.cefrLevel || 'B1',
          overallComment: parsed.overallComment || 'Bài viết đã đáp ứng tương đối tốt các yêu cầu đề bài.',
          partScores: parsed.partScores || {
            part1: { score: 4, max: 5, feedback: 'Đạt yêu cầu' },
            part2: { score: 5, max: 7, feedback: 'Đạt yêu cầu' },
            part3: { score: 11, max: 15, feedback: 'Đạt yêu cầu' },
            part4: { score: 16, max: 23, feedback: 'Đạt yêu cầu' }
          },
          corrections: parsed.corrections || [],
          vocabularySuggestions: parsed.vocabularySuggestions || [],
          improvedSample: parsed.improvedSample || {}
        };
      }
    } catch (e: any) {
      lastError = e.message;
    }
  }

  console.warn('Gemini API call failed, falling back to local evaluation:', lastError);
  return gradeWritingLocally(topic, answers);
}

export function gradeWritingLocally(
  topic: AptisWritingTopic,
  answers: WritingUserAnswers
): WritingEvaluationReport {
  let p1Score = 0;
  topic.part1.forEach(q => {
    const text = (answers.part1[q.questionNumber] || '').trim();
    const count = countWords(text);
    if (count >= 1 && count <= 7) p1Score += 1;
    else if (count > 0) p1Score += 0.5;
  });

  const p2Count = countWords(answers.part2);
  let p2Score = 0;
  if (p2Count >= 20 && p2Count <= 35) p2Score = 6;
  else if (p2Count >= 15) p2Score = 5;
  else if (p2Count > 0) p2Score = 3;

  let p3Score = 0;
  topic.part3.items.forEach((_, idx) => {
    const count = countWords(answers.part3[idx]);
    if (count >= 28 && count <= 45) p3Score += 4.5;
    else if (count >= 20) p3Score += 3.5;
    else if (count > 0) p3Score += 2;
  });

  const p4FriendCount = countWords(answers.part4_friend);
  const p4ManagerCount = countWords(answers.part4_manager);
  let p4Score = 0;
  if (p4FriendCount >= 40 && p4FriendCount <= 65) p4Score += 7;
  else if (p4FriendCount > 0) p4Score += 4;

  if (p4ManagerCount >= 110 && p4ManagerCount <= 160) p4Score += 13;
  else if (p4ManagerCount >= 80) p4Score += 9;
  else if (p4ManagerCount > 0) p4Score += 5;

  const totalScore = Math.min(50, Math.round(p1Score + p2Score + p3Score + p4Score));
  let cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' = 'B1';
  if (totalScore >= 45) cefr = 'C1';
  else if (totalScore >= 38) cefr = 'B2';
  else if (totalScore >= 26) cefr = 'B1';
  else if (totalScore >= 16) cefr = 'A2';
  else cefr = 'A1';

  const corrections = [];
  if (answers.part2 && (p2Count < 20 || p2Count > 35)) {
    corrections.push({
      part: 'Part 2',
      original: `Số từ hiện tại: ${p2Count} từ`,
      corrected: 'Mục tiêu: 20 - 30 từ',
      type: 'word_limit' as const,
      explanation: 'Bạn cần kiểm soát độ dài câu trả lời sát với khoảng 20-30 từ để tối ưu điểm Task Fulfillment.'
    });
  }

  return {
    overallScore: totalScore,
    maxScore: 50,
    cefrLevel: cefr,
    overallComment: `Đánh giá nhanh Offline: Bạn đạt khoảng ${totalScore}/50 điểm (Tương đương bậc ${cefr}). Nhập Gemini API Key ở góc trên để AI sửa chi tiết từng lỗi ngữ pháp, chính tả và gợi ý câu từ nâng cao nhé!`,
    partScores: {
      part1: { score: Math.round(p1Score), max: 5, feedback: `Điền được ${Math.round(p1Score)}/5 câu đúng độ dài.` },
      part2: { score: Math.round(p2Score), max: 7, feedback: `Độ dài: ${p2Count} từ (Mục tiêu: 20-30 từ).` },
      part3: { score: Math.round(p3Score), max: 15, feedback: `Hoàn thành 3 câu đối thoại.` },
      part4: { score: Math.round(p4Score), max: 23, feedback: `Thư bạn bè: ${p4FriendCount} từ, Thư quản lý: ${p4ManagerCount} từ.` }
    },
    corrections,
    vocabularySuggestions: [
      {
        originalWord: 'like',
        suggestedWord: 'be keen on / be passionate about',
        reason: 'Diễn đạt đa dạng hơn khi nói về sở thích cá nhân.'
      },
      {
        originalWord: 'convenient and cheap',
        suggestedWord: 'accessible and cost-effective',
        reason: 'Nâng cấp từ vựng sang trình độ B2/C1.'
      }
    ],
    improvedSample: {
      part2: topic.part2.sampleAnswer,
      part3: topic.part3.items.map(it => it.sampleAnswer || ''),
      part4_friend: topic.part4.task1.sampleAnswer,
      part4_manager: topic.part4.task2.sampleAnswer
    }
  };
}

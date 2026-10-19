import type { AptisWritingTopic, WritingUserAnswers, WritingEvaluationReport } from '../types/writing';

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

export type GradedScope = 'all' | 'part1' | 'part2' | 'part3' | 'part4';

export async function gradeWritingWithGemini(
  topic: AptisWritingTopic,
  answers: WritingUserAnswers,
  apiKey: string,
  targetScope: GradedScope = 'all'
): Promise<WritingEvaluationReport> {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash-latest'];

  let scopeDescription = 'Toàn bộ bài thi Aptis ESOL Writing (Part 1, 2, 3, 4 - Thang 50 điểm)';
  let targetMaxScore = 50;
  if (targetScope === 'part1') {
    scopeDescription = 'Chỉ đánh giá Part 1: Điền biểu mẫu 5 câu hỏi ngắn (1-5 từ mỗi câu - Thang 5 điểm)';
    targetMaxScore = 5;
  } else if (targetScope === 'part2') {
    scopeDescription = 'Chỉ đánh giá Part 2: Trả lời form khảo sát (20-30 từ theo câu hoàn chỉnh - Thang 7 điểm)';
    targetMaxScore = 7;
  } else if (targetScope === 'part3') {
    scopeDescription = 'Chỉ đánh giá Part 3: Chat nhóm mạng xã hội với 3 thành viên (30-40 từ mỗi câu - Thang 15 điểm)';
    targetMaxScore = 15;
  } else if (targetScope === 'part4') {
    scopeDescription = 'Chỉ đánh giá Part 4: Hai email gồm Thư thân mật cho bạn bè (~50 từ, 8 điểm) và Thư trang trọng cho Quản lý (120-150 từ, 15 điểm) - Thang 23 điểm';
    targetMaxScore = 23;
  }

  const promptData = {
    clubTopic: topic.title,
    evaluationScope: scopeDescription,
    targetMaxScore,
    submission: {
      part1: (targetScope === 'all' || targetScope === 'part1') ? topic.part1.map(q => ({
        question: q.question,
        targetWords: '1-5 words',
        userAnswer: answers.part1[q.questionNumber] || '(Bỏ trống)'
      })) : undefined,
      part2: (targetScope === 'all' || targetScope === 'part2') ? {
        instruction: topic.part2.instruction,
        prompt: topic.part2.prompt,
        targetWords: '20-30 words',
        userAnswer: answers.part2 || '(Bỏ trống)'
      } : undefined,
      part3: (targetScope === 'all' || targetScope === 'part3') ? topic.part3.items.map((item, idx) => ({
        speaker: item.speaker,
        question: item.question,
        targetWords: '30-40 words',
        userAnswer: answers.part3[idx] || '(Bỏ trống)'
      })) : undefined,
      part4: (targetScope === 'all' || targetScope === 'part4') ? {
        context: topic.part4.context,
        task1_friendEmail: {
          targetWords: 'khoảng 50 words (informal tone)',
          userAnswer: answers.part4_friend || '(Bỏ trống)'
        },
        task2_managerEmail: {
          targetWords: '120-150 words (formal tone)',
          userAnswer: answers.part4_manager || '(Bỏ trống)'
        }
      } : undefined
    }
  };

  const systemInstruction = `Bạn là Giám khảo chấm thi Aptis ESOL Writing chính thức của Hội đồng Anh (British Council).
Nhiệm vụ của bạn là đánh giá bài làm của thí sinh theo đúng phạm vi: ${scopeDescription}.

Tiêu chí đánh giá chuẩn Aptis:
1. Task Fulfillment (Hoàn thành yêu cầu đề bài, đúng khoảng số lượng từ quy định).
2. Grammatical Knowledge & Accuracy (Độ chính xác ngữ pháp, đa dạng cấu trúc thì, liên từ).
3. Vocabulary Range & Precision (Vốn từ vựng, độ tự nhiên, độ chính xác chính tả).
4. Cohesion & Register (Tính liên kết mạch lạc; văn phong thân mật cho bạn bè ở Part 4 Task 1; văn phong trang trọng, lịch sự, không dùng viết tắt cho Quản lý ở Part 4 Task 2).

Thang điểm:
- Nếu chấm Part 1: Tối đa 5 điểm.
- Nếu chấm Part 2: Tối đa 7 điểm (20 - 30 từ).
- Nếu chấm Part 3: Tối đa 15 điểm (5 điểm / câu hỏi, 30 - 40 từ mỗi câu).
- Nếu chấm Part 4: Tối đa 23 điểm (Task 1: 8 điểm, Task 2: 15 điểm).
- Nếu chấm Toàn bài (Full Test): Tối đa 50 điểm (Part 1: 5đ, Part 2: 7đ, Part 3: 15đ, Part 4: 23đ).

Quy đổi CEFR ước lượng theo tỷ lệ điểm đạt được:
- >= 88%: C1 / C2
- 76% - 87%: B2
- 52% - 75%: B1
- 32% - 51%: A2
- < 32%: A1

YÊU CẦU QUAN TRỌNG:
- Trả về DUY NHẤT một chuỗi JSON hợp lệ theo cấu trúc sau (không kèm markdown \`\`\`json):
{
  "overallScore": ${targetMaxScore === 50 ? 42 : targetMaxScore === 23 ? 19 : targetMaxScore === 15 ? 13 : targetMaxScore === 7 ? 6 : 4},
  "maxScore": ${targetMaxScore},
  "cefrLevel": "B2",
  "overallComment": "Nhận xét tổng quan bằng tiếng Việt: nêu rõ điểm tốt, điểm yếu, và lời khuyên nâng điểm...",
  "partScores": {
    "part1": { "score": 5, "max": 5, "feedback": "Nhận xét Part 1..." },
    "part2": { "score": 6, "max": 7, "feedback": "Nhận xét Part 2..." },
    "part3": { "score": 13, "max": 15, "feedback": "Nhận xét Part 3..." },
    "part4": { "score": 19, "max": 23, "feedback": "Nhận xét Part 4..." }
  },
  "corrections": [
    {
      "part": "Part 2",
      "original": "câu hoặc cụm từ bị lỗi của thí sinh",
      "corrected": "câu hoặc cụm từ đã được sửa đúng",
      "type": "grammar",
      "explanation": "giải thích chi tiết tại sao sai và quy tắc ngữ pháp bằng tiếng Việt"
    }
  ],
  "vocabularySuggestions": [
    {
      "originalWord": "từ đơn giản",
      "suggestedWord": "từ vựng / cụm collocation B2/C1 hay hơn",
      "reason": "lý do giúp tăng band điểm từ vựng"
    }
  ],
  "improvedSample": {
    "part2": "Đoạn văn hoàn chỉnh viết lại cho Part 2 ở trình độ B2/C1...",
    "part3": [
      "Câu trả lời A viết lại chuẩn B2/C1...",
      "Câu trả lời B viết lại chuẩn B2/C1...",
      "Câu trả lời C viết lại chuẩn B2/C1..."
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
          { text: `Bài thi thí sinh gửi lên:\n${JSON.stringify(promptData, null, 2)}` }
        ]
      }
    ],
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.2
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
          overallScore: parsed.overallScore ?? (targetMaxScore * 0.7),
          maxScore: targetMaxScore,
          cefrLevel: parsed.cefrLevel || 'B1',
          overallComment: parsed.overallComment || 'Bài viết đã đáp ứng tương đối tốt các yêu cầu đề bài.',
          gradedScope: targetScope,
          partScores: parsed.partScores || {},
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
  return gradeWritingLocally(topic, answers, targetScope);
}

export function gradeWritingLocally(
  topic: AptisWritingTopic,
  answers: WritingUserAnswers,
  targetScope: GradedScope = 'all'
): WritingEvaluationReport {
  let p1Score = 0;
  topic.part1.forEach(q => {
    const text = (answers.part1[q.questionNumber] || '').trim();
    const count = countWords(text);
    if (count >= 1 && count <= 5) p1Score += 1;
    else if (count > 5 && count <= 7) p1Score += 0.75;
    else if (count > 0) p1Score += 0.5;
  });

  const p2Count = countWords(answers.part2);
  let p2Score = 0;
  if (p2Count >= 20 && p2Count <= 30) p2Score = 7;
  else if ((p2Count >= 18 && p2Count < 20) || (p2Count > 30 && p2Count <= 35)) p2Score = 5.5;
  else if (p2Count >= 12) p2Score = 4;
  else if (p2Count > 0) p2Score = 2;

  let p3Score = 0;
  topic.part3.items.forEach((_, idx) => {
    const count = countWords(answers.part3[idx]);
    if (count >= 30 && count <= 40) p3Score += 5;
    else if ((count >= 25 && count < 30) || (count > 40 && count <= 45)) p3Score += 4;
    else if (count >= 18) p3Score += 3;
    else if (count > 0) p3Score += 1.5;
  });

  const p4FriendCount = countWords(answers.part4_friend);
  const p4ManagerCount = countWords(answers.part4_manager);
  let p4Score = 0;
  // Task 1: 8 pts (around 50 words: 45-60)
  if (p4FriendCount >= 45 && p4FriendCount <= 60) p4Score += 8;
  else if (p4FriendCount >= 38 && p4FriendCount <= 70) p4Score += 6.5;
  else if (p4FriendCount >= 25) p4Score += 4;
  else if (p4FriendCount > 0) p4Score += 2;

  // Task 2: 15 pts (120-150 words)
  if (p4ManagerCount >= 120 && p4ManagerCount <= 150) p4Score += 15;
  else if (p4ManagerCount >= 105 && p4ManagerCount <= 165) p4Score += 12.5;
  else if (p4ManagerCount >= 85) p4Score += 9;
  else if (p4ManagerCount >= 50) p4Score += 5;
  else if (p4ManagerCount > 0) p4Score += 2.5;

  let totalScore = 0;
  let maxScore = 50;

  if (targetScope === 'part1') {
    totalScore = Math.round(p1Score);
    maxScore = 5;
  } else if (targetScope === 'part2') {
    totalScore = Math.round(p2Score);
    maxScore = 7;
  } else if (targetScope === 'part3') {
    totalScore = Math.round(p3Score);
    maxScore = 15;
  } else if (targetScope === 'part4') {
    totalScore = Math.round(p4Score);
    maxScore = 23;
  } else {
    totalScore = Math.min(50, Math.round(p1Score + p2Score + p3Score + p4Score));
    maxScore = 50;
  }

  const ratio = maxScore > 0 ? totalScore / maxScore : 0;
  let cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' = 'B1';
  if (ratio >= 0.88) cefr = 'C1';
  else if (ratio >= 0.76) cefr = 'B2';
  else if (ratio >= 0.52) cefr = 'B1';
  else if (ratio >= 0.32) cefr = 'A2';
  else cefr = 'A1';

  const corrections = [];
  if ((targetScope === 'all' || targetScope === 'part2') && answers.part2) {
    if (p2Count < 20 || p2Count > 30) {
      corrections.push({
        part: 'Part 2',
        original: `Độ dài bài viết: ${p2Count} từ`,
        corrected: 'Mục tiêu chuẩn: 20 - 30 từ',
        type: 'word_limit' as const,
        explanation: 'Trong Aptis Writing Part 2, viết dưới 20 từ bị trừ điểm Task Fulfillment, viết quá 30 từ dễ mắc thêm lỗi ngữ pháp không đáng có.'
      });
    }
  }

  if ((targetScope === 'all' || targetScope === 'part4') && answers.part4_manager) {
    if (/\b(I'm|don't|can't|won't|it's|we're|didn't|haven't)\b/i.test(answers.part4_manager)) {
      corrections.push({
        part: 'Part 4 (Thư gửi Quản lý)',
        original: 'Sử dụng từ viết tắt (contractions) như I\'m, don\'t, can\'t,...',
        corrected: 'Viết đầy đủ: I am, do not, cannot, it is, we are,...',
        type: 'tone' as const,
        explanation: 'Thư gửi Quản lý CLB là văn phong trang trọng (Formal Register). Tuyệt đối KHÔNG sử dụng từ viết tắt trong email này để tránh bị trừ điểm Cohesion & Register.'
      });
    }
  }

  return {
    overallScore: totalScore,
    maxScore,
    cefrLevel: cefr,
    gradedScope: targetScope,
    overallComment: `Đánh giá nhanh Offline (${targetScope === 'all' ? 'Toàn bài' : targetScope.toUpperCase()}): Bạn đạt ${totalScore}/${maxScore} điểm (Bậc ${cefr}). Để được AI phân tích chi tiết từng câu, sửa lỗi ngữ pháp và viết lại theo văn phong B2/C1, hãy cấu hình Gemini API Key nhé!`,
    partScores: {
      part1: (targetScope === 'all' || targetScope === 'part1') ? { score: Math.round(p1Score), max: 5, feedback: `Điền được ${Math.round(p1Score)}/5 câu đúng độ dài yêu cầu.` } : undefined,
      part2: (targetScope === 'all' || targetScope === 'part2') ? { score: Math.round(p2Score), max: 7, feedback: `Độ dài: ${p2Count} từ (Chuẩn Aptis: 20-30 từ).` } : undefined,
      part3: (targetScope === 'all' || targetScope === 'part3') ? { score: Math.round(p3Score), max: 15, feedback: `Hoàn thành phản hồi chat với 3 thành viên.` } : undefined,
      part4: (targetScope === 'all' || targetScope === 'part4') ? { score: Math.round(p4Score), max: 23, feedback: `Thư bạn bè: ${p4FriendCount} từ (chuẩn ~50 từ); Thư quản lý: ${p4ManagerCount} từ (chuẩn 120-150 từ).` } : undefined
    },
    corrections,
    vocabularySuggestions: [
      {
        originalWord: 'like / enjoy',
        suggestedWord: 'be passionate about / be deeply keen on',
        reason: 'Diễn đạt đa dạng và giàu cảm xúc hơn khi chia sẻ sở thích.'
      },
      {
        originalWord: 'cheap and convenient',
        suggestedWord: 'cost-effective and accessible',
        reason: 'Nâng cấp từ vựng thường dùng lên mức độ học thuật B2/C1.'
      },
      {
        originalWord: 'I want to suggest',
        suggestedWord: 'I would like to put forward a suggestion that...',
        reason: 'Cấu trúc thư trang trọng chuẩn văn phong email lịch sự.'
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

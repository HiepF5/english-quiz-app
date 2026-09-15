import React, { useState, useEffect } from 'react';
import type { TranslationExercise, TranslationGradeReport, TranslationHistoryRecord } from '../types/translation';
import { parseRawToTranslationExercise, gradeUserTranslationWithGemini } from '../utils/translationAi';
import { pushToGithub } from '../utils/github';

const SAMPLE_RAW_TEXT = `1. HOME
Do you live in a house or a flat?
I live in a small flat in the city centre. It’s quite modern and fully furnished, so it’s comfortable for my daily life. Although it’s not very spacious, it’s convenient to live near shops and my workplace.
Do you plan to live there in the future?
I plan to stay there for a couple of years because it suits my current lifestyle. However, in the long term, I hope to move to a bigger place with more privacy.
What would you like to change in your house?
I’d like to redesign the living room and make it brighter. I also want to add some plants to make the space feel more relaxing.

2. BIRTHDAYS
Do you usually celebrate your birthday?
Yes, I usually celebrate my birthday every year. I don’t do anything too big, but I like spending time with my family or close friends.
What did you do on your latest birthday?
On my latest birthday, I went out for dinner with my friends. After that, we had a small gathering at home and enjoyed some music and cake.
What do people often do on their birthday?
People often go out to eat or meet their friends. Some people prefer to stay at home and celebrate with their families.

3. ADVERTISEMENTS
Do you often watch advertisements? Where?
Yes, I see advertisements almost every day. Most of them appear on YouTube or social media, and sometimes on TV.
Do you often buy things from advertisements?
I sometimes do, but I usually research the product carefully before making a decision. If it has good reviews and a reasonable price, I might give it a try.
How can we create a good advertisement?
A good advertisement needs eye-catching visuals and a short, clear message. Besides, the main idea should be memorable so it can attract viewers effectively.

4. BUSES
Do you often use buses?
Yes, I use buses quite often to travel to school or work. It’s a convenient option when I don’t want to ride my motorbike.
How do you rate the bus service in your city?
I think the bus service is improving, but it still has some problems like delays and overcrowding. However, the routes are quite useful.
Benefits of using buses
Using buses helps reduce traffic jams and pollution. It’s also much cheaper than driving your own vehicle.

5. TV SHOWS
The latest TV show you watched?
The latest show I watched was a Korean drama about family relationships. The storyline was meaningful and the acting was impressive.
Watching TV shows alone or with others?
I prefer watching alone because I can concentrate better. But sometimes I enjoy watching with my friends if it’s a funny show.
Benefits of watching a TV show?
Watching TV shows helps me relax after a long day. It also allows me to learn more about different cultures and ideas.`;

export const TranslationWorkspace: React.FC = () => {
  const [rawText, setRawText] = useState(SAMPLE_RAW_TEXT);
  const [exercise, setExercise] = useState<TranslationExercise | null>(null);
  const [userTranslations, setUserTranslations] = useState<Record<number, string>>({});
  const [report, setReport] = useState<TranslationGradeReport | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || 'AIzaSyD1N0OEt5XQy8hVWOwmC-cmI3Ug_qQ0h1U');
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('github_access_token') || '');
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [pushStatus, setPushStatus] = useState<string | null>(null);
  const [history, setHistory] = useState<TranslationHistoryRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('translation_history') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('github_access_token', githubToken);
  }, [githubToken]);

  const handleCreateExercise = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    try {
      const ex = await parseRawToTranslationExercise(rawText, apiKey);
      setExercise(ex);
      setUserTranslations({});
      setReport(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleTranslationChange = (itemId: number, text: string) => {
    setUserTranslations(prev => ({
      ...prev,
      [itemId]: text
    }));
  };

  const handleSubmitAndGrade = async () => {
    if (!exercise) return;
    setIsGrading(true);
    try {
      const resReport = await gradeUserTranslationWithGemini(exercise, userTranslations, apiKey);
      setReport(resReport);

      // Save to history
      const newRecord: TranslationHistoryRecord = {
        id: 'hist-' + Date.now(),
        exercise,
        userTranslations,
        report: resReport
      };
      const updatedHistory = [newRecord, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('translation_history', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!exercise) return;
    let md = `# ${exercise.title}\n\n`;
    md += `*Ngày tạo: ${new Date(exercise.createdAt).toLocaleString('vi-VN')}*\n\n`;
    if (report) {
      md += `## Điểm Tổng Kết AI: ${report.overallScore}/10 (${report.overallPercentage}%)\n`;
      md += `> ${report.evaluationComment}\n\n`;
    }

    exercise.items.forEach(item => {
      md += `### [${item.topic}] Phần ${item.id}\n`;
      md += `**Câu hỏi / Tiêu đề:** ${item.originalEnglishQuestion}\n\n`;
      md += `**Bản Tiếng Anh gốc:** ${item.originalEnglishAnswer}\n\n`;
      md += `**Bản tự dịch của bạn:** ${userTranslations[item.id] || '(Chưa dịch)'}\n\n`;
      if (report) {
        const itemFeedback = report.feedbackItems.find(f => f.itemId === item.id);
        if (itemFeedback) {
          md += `- **Điểm phần này:** ${itemFeedback.score}/10\n`;
          md += `- **Gợi ý mượt mà:** ${itemFeedback.correctedEnglish}\n`;
          md += `- **Nhận xét AI:** ${itemFeedback.explanation}\n\n`;
        }
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bai_Luyen_Dich_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePushGit = async () => {
    if (!exercise) return;
    setPushStatus('Đang push bài luyện dịch lên GitHub...');
    try {
      const fileName = `data/translation-${Date.now()}.json`;
      const res = await pushToGithub({
        token: githubToken,
        owner: 'HiepF5',
        repo: 'english-quiz-app',
        filePath: fileName,
        content: { exercise, userTranslations, report },
        message: `Add translation exercise ${exercise.title}`
      });
      if (res.success) {
        setPushStatus(`Push thành công! File: ${fileName}`);
      } else {
        setPushStatus(`Lỗi Push: ${res.error}`);
      }
    } catch (err: any) {
      setPushStatus(`Lỗi: ${err.message}`);
    }
  };

  const completedCount = exercise ? Object.values(userTranslations).filter(t => t.trim().length > 0).length : 0;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 rounded-2xl border border-indigo-500/30 shadow-xl text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-400/30 font-semibold tracking-wide">
            ENGLISH TRANSLATION WORKSPACE
          </span>
          <h1 className="text-2xl md:text-3xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-purple-200">
            Luyện Dịch Tiếng Anh - Tự Nhập & AI Chấm Điểm
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Dán đoạn văn bản (nhiều chủ đề), tự gõ bản dịch của bạn vào từng phần, sau đó nhấn Nộp bài để Gemini AI chấm điểm chi tiết.
          </p>
        </div>
        <button
          onClick={() => setShowApiSettings(!showApiSettings)}
          className="self-start md:self-auto bg-slate-800/80 hover:bg-slate-700 text-indigo-200 text-xs px-3 py-2 rounded-lg border border-slate-600 transition flex items-center gap-2"
        >
          <span>⚙️ Gemini & Git Config</span>
        </button>
      </div>

      {/* API Key settings modal / accordion */}
      {showApiSettings && (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-white space-y-4">
          <h3 className="font-semibold text-indigo-400 text-sm">Cấu hình Gemini API & GitHub Token</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Gemini API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">GitHub Access Token (Để Push 1-Click)</label>
              <input
                type="password"
                value={githubToken}
                onChange={e => setGithubToken(e.target.value)}
                placeholder="ghp_..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Input text area if exercise not created yet */}
      {!exercise && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📝 Nhập Đoạn Văn Bản / Đề Bài Tiếng Anh</span>
            </h2>
            <button
              onClick={() => setRawText(SAMPLE_RAW_TEXT)}
              className="text-xs text-indigo-400 hover:underline"
            >
              Nạp bài mẫu (5 Chủ đề: Home, Birthdays...)
            </button>
          </div>
          <textarea
            rows={12}
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder="Dán đoạn văn bản Tiếng Anh gồm các chủ đề (1. HOME, 2. BIRTHDAYS...) vào đây..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-y"
          />
          <button
            onClick={handleCreateExercise}
            disabled={isParsing || !rawText.trim()}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2 text-base"
          >
            {isParsing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang phân tách đoạn văn...</span>
              </>
            ) : (
              <>
                <span>🚀 Tạo Các Phần Bài Tập Dịch (Tự Động Phân Tách)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Interactive typing sections */}
      {exercise && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">{exercise.title}</h2>
              <p className="text-xs text-slate-400">
                Đã phân tách thành <span className="text-indigo-400 font-semibold">{exercise.items.length} phần</span>. Đã dịch: <span className="text-emerald-400 font-semibold">{completedCount}/{exercise.items.length}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExercise(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                ✏️ Sửa văn bản gốc
              </button>
              <button
                onClick={handleExportMarkdown}
                className="px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 text-xs"
              >
                📥 Xuất .md
              </button>
              <button
                onClick={handlePushGit}
                className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-300 text-xs"
              >
                🐙 Push Git
              </button>
            </div>
          </div>

          {pushStatus && (
            <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-indigo-300">
              {pushStatus}
            </div>
          )}

          {/* Cards for typing */}
          <div className="space-y-4">
            {exercise.items.map((item, idx) => (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-3 transition shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-1 rounded-md font-semibold">
                    PHẦN #{idx + 1} • {item.topic}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">ID: {item.id}</span>
                </div>

                {item.originalEnglishQuestion && (
                  <div className="text-sm font-semibold text-slate-100 flex items-start gap-2">
                    <span className="text-indigo-400">❓</span>
                    <span>{item.originalEnglishQuestion}</span>
                  </div>
                )}

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 text-sm text-indigo-200 font-medium leading-relaxed">
                  {item.originalEnglishAnswer}
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">
                    ✍️ Bản dịch của bạn (Gõ lại nội dung bạn tự dịch):
                  </label>
                  <textarea
                    rows={3}
                    value={userTranslations[item.id] || ''}
                    onChange={e => handleTranslationChange(item.id, e.target.value)}
                    placeholder="Gõ bản dịch Tiếng Việt (hoặc Tiếng Anh) của bạn tại đây..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition resize-y"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Submit button */}
          <div className="sticky bottom-4 bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-indigo-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300">
              Tiến độ: <strong className="text-indigo-400">{completedCount}</strong> / <strong>{exercise.items.length}</strong> phần bài dịch đã nhập.
            </div>
            <button
              onClick={handleSubmitAndGrade}
              disabled={isGrading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGrading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Gemini AI Đang Chấm Điểm...</span>
                </>
              ) : (
                <>
                  <span>✨ Nộp Bài & Gemini AI Chấm Điểm</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: AI Grade Report display */}
      {report && (
        <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div>
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                KẾT QUẢ CHẤM ĐIỂM GEMINI AI
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">{report.exerciseTitle}</h2>
            </div>
            <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-6 py-3 rounded-2xl text-center">
              <div className="text-3xl font-extrabold">{report.overallScore} / 10</div>
              <div className="text-xs text-emerald-400 font-medium">Tỷ lệ chính xác: {report.overallPercentage}%</div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 text-sm">
            <strong className="text-indigo-400 block mb-1">💡 Nhận xét tổng quan của AI:</strong>
            {report.evaluationComment}
          </div>

          {/* Feedback items */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Chi tiết từng câu:</h3>
            {report.feedbackItems.map(fb => (
              <div key={fb.itemId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-400 font-semibold">{fb.topic} • Câu #{fb.itemId}</span>
                  <span className="bg-indigo-950 border border-indigo-800 text-indigo-300 px-2 py-0.5 rounded font-bold">
                    {fb.score} / 10 Điểm
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  <strong className="text-slate-200">Bản gốc:</strong> {fb.originalEnglish}
                </div>
                <div className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-amber-400">Bài làm của bạn:</strong> {fb.userTranslation}
                </div>
                <div className="text-xs text-emerald-300 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-900/50">
                  <strong className="text-emerald-400">Gợi ý mượt mà:</strong> {fb.correctedEnglish}
                </div>
                <div className="text-xs text-slate-400 pt-1">
                  <strong>Đánh giá & Giải thích:</strong> {fb.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

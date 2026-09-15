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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('app_theme') as 'light' | 'dark') || 'light';
  });

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
    localStorage.setItem('app_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('github_access_token', githubToken);
  }, [githubToken]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

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
  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen py-6 px-4 md:px-8 transition-colors duration-200 ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className={`p-6 rounded-2xl border shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors ${
          isLight
            ? 'bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 border-indigo-200 text-white'
            : 'bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-indigo-500/30 text-white'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold tracking-wide backdrop-blur-sm">
                ENGLISH TRANSLATION WORKSPACE
              </span>
              <button
                onClick={toggleTheme}
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded-full font-semibold transition flex items-center gap-1.5"
              >
                {isLight ? '🌙 Chuyển sang Giao Diện Tối (Dark)' : '☀️ Chuyển sang Giao Diện Sáng (Light)'}
              </button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-2 text-white">
              Luyện Dịch Tiếng Anh - Tự Nhập & AI Chấm Điểm
            </h1>
            <p className="text-indigo-100 text-sm mt-1">
              Dán đoạn văn bản (nhiều chủ đề), tự gõ bản dịch của bạn vào từng phần, sau đó nhấn Nộp bài để Gemini AI chấm điểm chi tiết.
            </p>
          </div>
          <button
            onClick={() => setShowApiSettings(!showApiSettings)}
            className="self-start md:self-auto bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-2 rounded-xl border border-white/20 transition flex items-center gap-2 font-medium"
          >
            <span>⚙️ Cấu hình API & Git</span>
          </button>
        </div>

        {/* API Settings Accordion */}
        {showApiSettings && (
          <div className={`p-5 rounded-xl border space-y-4 shadow-md transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <h3 className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">Cấu hình Gemini API Key & GitHub Token</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">Gemini API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className={`w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">GitHub Token (Push 1-Click)</label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={e => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                  className={`w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Input text area */}
        {!exercise && (
          <div className={`p-6 rounded-2xl border space-y-4 shadow-md transition-colors ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>📝 Nhập Đoạn Văn Bản / Đề Bài Tiếng Anh</span>
              </h2>
              <button
                onClick={() => setRawText(SAMPLE_RAW_TEXT)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:underline"
              >
                Nạp bài mẫu (5 Chủ đề: Home, Birthdays...)
              </button>
            </div>
            <textarea
              rows={12}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Dán đoạn văn bản Tiếng Anh gồm các chủ đề (1. HOME, 2. BIRTHDAYS...) vào đây..."
              className={`w-full rounded-xl p-4 text-sm font-mono leading-relaxed resize-y border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
                  : 'bg-slate-950 border-slate-800 text-slate-100'
              }`}
            />
            <button
              onClick={handleCreateExercise}
              disabled={isParsing || !rawText.trim()}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2 text-base"
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

        {/* Step 2: Typing cards */}
        {exercise && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm transition-colors ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
            }`}>
              <div>
                <h2 className="text-lg font-bold">{exercise.title}</h2>
                <p className="text-xs opacity-75">
                  Đã phân tách thành <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{exercise.items.length} phần</span>. Đã dịch: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{completedCount}/{exercise.items.length}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExercise(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  ✏️ Sửa văn bản gốc
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                >
                  📥 Xuất .md
                </button>
                <button
                  onClick={handlePushGit}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm"
                >
                  🐙 Push Git
                </button>
              </div>
            </div>

            {pushStatus && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg text-xs font-medium">
                {pushStatus}
              </div>
            )}

            {/* List of cards */}
            <div className="space-y-4">
              {exercise.items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border space-y-3 transition shadow-sm ${
                    isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${
                      isLight
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      PHẦN #{idx + 1} • {item.topic}
                    </span>
                    <span className="text-xs font-mono opacity-50">ID: {item.id}</span>
                  </div>

                  {item.originalEnglishQuestion && (
                    <div className="text-sm font-bold flex items-start gap-2">
                      <span className="text-indigo-600 dark:text-indigo-400">❓</span>
                      <span>{item.originalEnglishQuestion}</span>
                    </div>
                  )}

                  <div className={`p-3.5 rounded-xl border text-sm font-medium leading-relaxed ${
                    isLight
                      ? 'bg-indigo-50/70 border-indigo-200/60 text-indigo-950'
                      : 'bg-slate-950/80 border-slate-800 text-indigo-200'
                  }`}>
                    {item.originalEnglishAnswer}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 opacity-75">
                      ✍️ Bản dịch của bạn (Gõ lại nội dung bạn tự dịch):
                    </label>
                    <textarea
                      rows={3}
                      value={userTranslations[item.id] || ''}
                      onChange={e => handleTranslationChange(item.id, e.target.value)}
                      placeholder="Gõ bản dịch Tiếng Việt (hoặc Tiếng Anh) của bạn tại đây..."
                      className={`w-full rounded-xl p-3 text-sm transition resize-y border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                          : 'bg-slate-950 border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Submit Bar */}
            <div className={`sticky bottom-4 backdrop-blur-md p-4 rounded-2xl border shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
              isLight
                ? 'bg-white/95 border-indigo-200 text-slate-800'
                : 'bg-slate-950/95 border-indigo-500/30 text-white'
            }`}>
              <div className="text-xs font-semibold">
                Tiến độ: <strong className="text-indigo-600 dark:text-indigo-400">{completedCount}</strong> / <strong>{exercise.items.length}</strong> phần bài dịch đã nhập.
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

        {/* Step 3: AI Grade Report */}
        {report && (
          <div className={`p-6 rounded-2xl border space-y-6 shadow-xl transition-colors ${
            isLight
              ? 'bg-white border-indigo-200 text-slate-800'
              : 'bg-slate-900 border-indigo-500/30 text-white'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between border-b pb-4 gap-4 border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  KẾT QUẢ CHẤM ĐIỂM GEMINI AI
                </span>
                <h2 className="text-2xl font-bold mt-1">{report.exerciseTitle}</h2>
              </div>
              <div className={`px-6 py-3 rounded-2xl text-center border ${
                isLight
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              }`}>
                <div className="text-3xl font-extrabold">{report.overallScore} / 10</div>
                <div className="text-xs font-medium opacity-80">Tỷ lệ chính xác: {report.overallPercentage}%</div>
              </div>
            </div>

            <div className={`p-4 rounded-xl border text-sm ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <strong className="text-indigo-600 dark:text-indigo-400 block mb-1">💡 Nhận xét tổng quan của AI:</strong>
              {report.evaluationComment}
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold">Chi tiết từng câu:</h3>
              {report.feedbackItems.map(fb => (
                <div
                  key={fb.itemId}
                  className={`p-4 rounded-xl border space-y-2 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{fb.topic} • Câu #{fb.itemId}</span>
                    <span className="bg-indigo-100 dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded font-bold">
                      {fb.score} / 10 Điểm
                    </span>
                  </div>
                  <div className="text-xs opacity-75">
                    <strong className="opacity-100">Bản gốc:</strong> {fb.originalEnglish}
                  </div>
                  <div className={`text-xs p-2.5 rounded-lg border ${
                    isLight
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}>
                    <strong className="text-amber-600 dark:text-amber-400">Bài làm của bạn:</strong> {fb.userTranslation}
                  </div>
                  <div className={`text-xs p-2.5 rounded-lg border ${
                    isLight
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300'
                  }`}>
                    <strong className="text-emerald-700 dark:text-emerald-400">Gợi ý mượt mà:</strong> {fb.correctedEnglish}
                  </div>
                  <div className="text-xs opacity-80 pt-1">
                    <strong>Đánh giá & Giải thích:</strong> {fb.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import type { TranslationExercise, TranslationGradeReport } from '../types/translation';
import { parseRawToTranslationExercise, gradeUserTranslationWithGemini } from '../utils/translationAi';
import { pushToGithub } from '../utils/github';
import { 
  Sparkles, Key, FileText, Loader2, CheckCircle2, AlertCircle, 
  Send, Download, GitCommit, ExternalLink, Award, FileCheck 
} from 'lucide-react';


const DEFAULT_SAMPLE_TEXT = `1. HOME
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
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [githubToken, setGithubToken] = useState<string>(() => localStorage.getItem('github_pat_token') || '');
  
  const [rawText, setRawText] = useState<string>(DEFAULT_SAMPLE_TEXT);
  const [exercise, setExercise] = useState<TranslationExercise | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [isPushing, setIsPushing] = useState<boolean>(false);

  const [report, setReport] = useState<TranslationGradeReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);

  // Load saved active translation exercise from localStorage if any
  useEffect(() => {
    try {
      const savedEx = localStorage.getItem('active_translation_exercise');
      const savedAns = localStorage.getItem('active_translation_answers');
      const savedRep = localStorage.getItem('active_translation_report');

      if (savedEx) setExercise(JSON.parse(savedEx));
      if (savedAns) setUserAnswers(JSON.parse(savedAns));
      if (savedRep) setReport(JSON.parse(savedRep));
    } catch (e) {
      console.error('Error loading saved translation session:', e);
    }
  }, []);

  // Save changes to localStorage
  const saveSession = (ex: TranslationExercise | null, ans: Record<number, string>, rep: TranslationGradeReport | null) => {
    try {
      if (ex) localStorage.setItem('active_translation_exercise', JSON.stringify(ex));
      localStorage.setItem('active_translation_answers', JSON.stringify(ans));
      if (rep) localStorage.setItem('active_translation_report', JSON.stringify(rep));
    } catch (e) {
      console.error('Error saving translation session:', e);
    }
  };

  // Step 1: Generate Translation Exercise from raw text
  const handleGenerateExercise = async () => {
    if (!apiKey.trim()) {
      alert('Vui lòng nhập Google Gemini API Key');
      return;
    }
    if (!rawText.trim()) {
      alert('Vui lòng dán văn bản thô đề bài vào ô nhập');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setExercise(null);
    setUserAnswers({});
    setReport(null);
    setPushResult(null);

    localStorage.setItem('gemini_api_key', apiKey.trim());

    try {
      const result = await parseRawToTranslationExercise(apiKey.trim(), rawText.trim());
      setExercise(result);
      saveSession(result, {}, null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi không thể phân tích văn bản thô.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle user input per question
  const handleAnswerChange = (itemId: number, text: string) => {
    const updated = { ...userAnswers, [itemId]: text };
    setUserAnswers(updated);
    saveSession(exercise, updated, report);
  };

  // Step 2: Submit for AI Grading
  const handleSubmitGrading = async () => {
    if (!exercise) return;
    if (!apiKey.trim()) {
      alert('Vui lòng nhập Gemini API Key để AI chấm điểm');
      return;
    }

    const answeredCount = Object.values(userAnswers).filter(val => val.trim().length > 0).length;
    if (answeredCount === 0) {
      alert('Vui lòng nhập bài dịch cho ít nhất 1 câu trước khi nộp chấm điểm.');
      return;
    }

    setIsGrading(true);
    setErrorMsg(null);
    setReport(null);

    localStorage.setItem('gemini_api_key', apiKey.trim());

    try {
      const gradeReport = await gradeUserTranslationWithGemini(apiKey.trim(), exercise, userAnswers);
      setReport(gradeReport);
      saveSession(exercise, userAnswers, gradeReport);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi không thể chấm điểm bài dịch bằng AI.');
    } finally {
      setIsGrading(false);
    }
  };

  // Step 3: Push topic & exercise to GitHub
  const handlePushToGithub = async () => {
    if (!exercise) return;
    if (!githubToken.trim()) {
      alert('Vui lòng nhập GitHub Personal Access Token (PAT)');
      return;
    }

    setIsPushing(true);
    setPushResult(null);
    localStorage.setItem('github_pat_token', githubToken.trim());

    const timeStamp = Date.now().toString().slice(-6);
    const safeTitle = exercise.id.replace(/[^a-z0-9]/gi, '_');
    const filePath = `src/data/${safeTitle}_${timeStamp}.json`;

    const payloadToPush = {
      ...exercise,
      userTranslations: userAnswers,
      report: report || null
    };

    const res = await pushToGithub({
      token: githubToken.trim(),
      owner: 'HiepF5',
      repo: 'english-quiz-app',
      filePath,
      content: payloadToPush,
      message: `Add Translation exercise & answers: ${exercise.title}`
    });

    setIsPushing(false);

    if (res.success) {
      setPushResult({
        success: true,
        message: `Đã commit file "${filePath}" lên GitHub thành công! Bài tập dịch & đáp án đã được lưu cố định trên Vercel.`,
        url: res.commitUrl
      });
    } else {
      setPushResult({
        success: false,
        message: res.error || 'Lỗi không thể push lên GitHub.'
      });
    }
  };

  // Step 4: Export User Work & AI Report as Markdown File
  const handleExportUserWork = () => {
    if (!exercise) return;

    let exportContent = `# 📝 BÁO CÁO BÀI LÀM DỊCH TIẾNG ANH & ĐÁNH GIÁ AI
Thời gian tạo: ${new Date().toLocaleString('vi-VN')}
Bài tập: ${exercise.title}

==================================================
1. ĐỀ BÀI THÔ BAN ĐẦU:
==================================================
${exercise.rawInputText}

==================================================
2. BÀI LÀM DỊCH CỦA BẠN & ĐÁNH GIÁ AI CHI TIẾT:
==================================================
`;

    if (report) {
      exportContent += `
🏆 ĐIỂM TỔNG KẾT: ${report.overallScore} / 10 (${report.overallPercentage}%)
💬 NHẬN XÉT TỔNG QUAN: ${report.evaluationComment}

--------------------------------------------------
`;
    }

    exercise.items.forEach((item, index) => {
      const userText = userAnswers[item.id] || "(Chưa làm câu này)";
      const itemFB = report?.feedbackItems.find(fb => fb.itemId === item.id);

      exportContent += `
[Câu ${index + 1} - Chủ đề: ${item.topic}]
- Câu hỏi Tiếng Anh gốc: ${item.originalEnglishQuestion}
- Câu trả lời chuẩn: ${item.originalEnglishAnswer}
- Đề bài dịch Tiếng Việt: ${item.vietnamesePromptAnswer || item.vietnamesePromptQuestion}
👉 Bài làm dịch của bạn: ${userText}
`;

      if (itemFB) {
        exportContent += `
✨ Điểm câu này: ${itemFB.score} / 10
✏️ Câu dịch chuẩn sửa lại: ${itemFB.correctedEnglish}
⚠️ Lỗi ngữ pháp: ${itemFB.grammarErrors.join(', ') || 'Không có'}
💡 Gợi ý từ vựng hay: ${itemFB.vocabularySuggestions.join(', ') || 'Không có'}
📝 Lời giải thích: ${itemFB.explanation}
`;
      }
      exportContent += `--------------------------------------------------\n`;
    });

    const blob = new Blob([exportContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bai_Lam_Dich_${exercise.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-slate-800 p-8 sm:p-10 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Mô Hình Luyện Dịch IELTS Speaking / Writing & AI Chấm Điểm</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Luyện Dịch Tiếng Anh & <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400">
              AI Chấm Điểm, Sửa Lỗi, Export & Sync Git
            </span>
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Dán đoạn văn bản Q&A Speaking/Writing thô vào hệ thống ➔ AI sẽ tự động tạo bài tập dịch, 
            chấm điểm chi tiết từng câu, gợi ý nâng band từ vựng, cho phép xuất file kết quả bài làm và lưu lên GitHub/Vercel!
          </p>
        </div>
      </div>

      {/* Input Keys & Raw Text Section */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-xl">
        
        {/* Keys Input Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                Google Gemini API Key:
              </label>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[11px] text-purple-400 hover:underline">
                Lấy Key miễn phí
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                GitHub Token (dùng để Push Git):
              </label>
            </div>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="github_pat_11A..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Raw Text Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              Đoạn Văn Bản Thô Đề Bài (Mẫu 5 Chủ Đề HOME, BIRTHDAYS, BUSES...):
            </label>
            <button
              onClick={() => setRawText(DEFAULT_SAMPLE_TEXT)}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Nạp mẫu 5 chủ đề mặc định
            </button>
          </div>

          <textarea
            rows={8}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Dán đoạn văn bản Q&A tiếng Anh vào đây..."
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none leading-relaxed resize-none"
          />
        </div>

        {/* Generate Button */}
        <button
          disabled={isGenerating}
          onClick={handleGenerateExercise}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center space-x-2"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
          <span>{isGenerating ? 'AI Đang Tạo Bài Tập Dịch Từ Văn Bản Thô...' : '✨ AI Tạo Bài Tập Dịch Ngay'}</span>
        </button>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

      </div>

      {/* Exercise Workspace */}
      {exercise && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Header Specs & Action Toolbar */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div>
              <span className="px-3 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-bold">
                Bài tập dịch ({exercise.items.length} câu)
              </span>
              <h3 className="text-xl font-bold text-white mt-2">{exercise.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{exercise.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Export Button */}
              <button
                onClick={handleExportUserWork}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition shadow-sm"
                title="Xuất file Markdown/Text chứa bài làm dịch & kết quả chấm điểm"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Bài Làm Của Tôi</span>
              </button>

              {/* Push Git Button */}
              <button
                disabled={isPushing}
                onClick={handlePushToGithub}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition"
                title="Lưu & Push bài tập + bài làm này lên GitHub/Vercel"
              >
                {isPushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCommit className="w-4 h-4" />}
                <span>Lưu & Push Git</span>
              </button>
            </div>
          </div>

          {pushResult && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              pushResult.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center space-x-2 font-bold mb-1">
                {pushResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                <span>{pushResult.success ? 'Thành công' : 'Lỗi Push'}</span>
              </div>
              <p>{pushResult.message}</p>
              {pushResult.url && (
                <a href={pushResult.url} target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold mt-1 inline-flex items-center gap-1">
                  <span>Xem trên GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* AI Overall Grade Report Header */}
          {report && (
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-purple-500/40 p-6 rounded-3xl shadow-2xl space-y-4 text-center">
              <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                <Award className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-2xl font-black text-white">Kết Quả AI Chấm Điểm Bài Dịch</h3>
              
              <div className="flex items-center justify-center space-x-6">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 min-w-[120px]">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Điểm Overall</span>
                  <div className="text-3xl font-black text-purple-400 mt-1">{report.overallScore} / 10</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 min-w-[120px]">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Tỷ Lệ Chuẩn</span>
                  <div className="text-3xl font-black text-emerald-400 mt-1">{report.overallPercentage}%</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 max-w-2xl mx-auto leading-relaxed">
                <strong className="text-purple-300">Nhận xét tổng quan của AI:</strong> {report.evaluationComment}
              </div>
            </div>
          )}

          {/* Items Questions & User Translation Workspaces */}
          <div className="space-y-6">
            {exercise.items.map((item, idx) => {
              const itemFB = report?.feedbackItems.find(fb => fb.itemId === item.id);

              return (
                <div key={item.id} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
                  
                  {/* Topic & Question Info Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-bold">
                        Câu {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                        Topic: {item.topic}
                      </span>
                    </div>

                    {itemFB && (
                      <span className="text-xs font-bold px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Điểm: {itemFB.score} / 10
                      </span>
                    )}
                  </div>

                  {/* English Original & Vietnamese Prompt Reference */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs space-y-1 sm:space-y-0">
                    <div>
                      <span className="font-bold text-indigo-400 uppercase tracking-wider block mb-1">Mẫu Tiếng Anh Chuẩn:</span>
                      <p className="font-semibold text-slate-200 leading-relaxed mb-1">{item.originalEnglishQuestion}</p>
                      <p className="text-slate-300 leading-relaxed italic">{item.originalEnglishAnswer}</p>
                    </div>

                    <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                      <span className="font-bold text-purple-400 uppercase tracking-wider block mb-1">Gợi Ý Đề Bài Tiếng Việt:</span>
                      <p className="font-semibold text-slate-200 leading-relaxed mb-1">{item.vietnamesePromptQuestion}</p>
                      <p className="text-slate-300 leading-relaxed">{item.vietnamesePromptAnswer}</p>
                    </div>
                  </div>

                  {/* User Translation Input Box */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>Nhập bài dịch Tiếng Anh của bạn:</span>
                      <span className="text-[11px] text-slate-500 font-normal">Nhìn gợi ý Tiếng Việt và tự dịch sang Tiếng Anh</span>
                    </label>
                    <textarea
                      rows={3}
                      value={userAnswers[item.id] || ''}
                      onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                      placeholder="Nhập câu dịch tiếng Anh của bạn tại đây..."
                      className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-slate-100 focus:border-indigo-500 focus:outline-none leading-relaxed resize-none"
                    />
                  </div>

                  {/* AI Detailed Feedback for this item */}
                  {itemFB && (
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 text-xs space-y-2.5 animate-fadeIn">
                      <div className="flex items-center space-x-2 font-bold text-purple-300">
                        <FileCheck className="w-4 h-4 text-purple-400" />
                        <span>AI Sửa Lỗi & Gợi Ý Diễn Đạt:</span>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200">
                        <strong className="text-emerald-400">Câu sửa hoàn chỉnh:</strong> {itemFB.correctedEnglish}
                      </div>

                      {itemFB.grammarErrors.length > 0 && (
                        <div className="text-rose-300 space-y-1">
                          <strong className="text-rose-400">Lỗi ngữ pháp cần tránh:</strong>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                            {itemFB.grammarErrors.map((err, eIdx) => (
                              <li key={eIdx}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {itemFB.vocabularySuggestions.length > 0 && (
                        <div className="text-indigo-300 space-y-1">
                          <strong className="text-indigo-400">Từ vựng & Cụm từ hay hơn:</strong>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                            {itemFB.vocabularySuggestions.map((sug, sIdx) => (
                              <li key={sIdx}>{sug}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p className="text-slate-300 border-t border-slate-800 pt-2">{itemFB.explanation}</p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Submit Grading Button at bottom */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <h4 className="text-sm font-bold text-white">Hoàn Thành Bài Dịch?</h4>
              <p className="text-xs text-slate-400">Nhấn nút bên cạnh để Gemini AI chấm điểm & sửa lỗi toàn bộ bài làm của bạn.</p>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={handleExportUserWork}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Bài Làm (.md)</span>
              </button>

              <button
                disabled={isGrading}
                onClick={handleSubmitGrading}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition"
              >
                {isGrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isGrading ? 'AI Đang Chấm Điểm...' : 'Nộp Bài & AI Chấm Điểm'}</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

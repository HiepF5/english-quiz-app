import React, { useState } from 'react';
import type { QuizSet } from '../types/quiz';
import { pushToGithub } from '../utils/github';
import { X, ClipboardPaste, CheckCircle2, AlertCircle, Play, GitCommit, Loader2, FileCode2, Key } from 'lucide-react';

interface JsonPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadQuiz: (quiz: QuizSet) => void;
}

export const JsonPasteModal: React.FC<JsonPasteModalProps> = ({
  isOpen,
  onClose,
  onLoadQuiz
}) => {
  const [rawJsonText, setRawJsonText] = useState<string>('');
  const [parsedQuiz, setParsedQuiz] = useState<QuizSet | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // GitHub sync states
  const [showGithubSync, setShowGithubSync] = useState<boolean>(false);
  const [githubToken, setGithubToken] = useState<string>(() => localStorage.getItem('github_pat_token') || '');
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setRawJsonText(text);
    setSyncResult(null);

    if (!text.trim()) {
      setParsedQuiz(null);
      setValidationError(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      let formattedSet: QuizSet;

      if (Array.isArray(parsed)) {
        formattedSet = {
          id: 'custom-pasted-' + Date.now(),
          title: "Đề Thi Tiếng Anh Dán Mã JSON",
          description: 'Đề thi vừa dán mã JSON (' + parsed.length + ' câu hỏi)',
          level: "Custom",
          category: "Pasted JSON",
          timeLimitMinutes: Math.max(5, Math.ceil(parsed.length * 0.8)),
          questions: parsed
        };
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        formattedSet = {
          id: parsed.id || ('custom-pasted-' + Date.now()),
          title: parsed.title || "Đề Thi Tiếng Anh Dán Mã JSON",
          description: parsed.description || "Đề thi vừa dán mã JSON",
          level: parsed.level || "Custom",
          category: parsed.category || "Pasted JSON",
          timeLimitMinutes: parsed.timeLimitMinutes || 15,
          questions: parsed.questions
        };
      } else {
        setParsedQuiz(null);
        setValidationError("Cấu trúc JSON chưa đúng: Cần có mảng 'questions' hoặc mảng chứa các câu hỏi.");
        return;
      }

      setParsedQuiz(formattedSet);
      setValidationError(null);
    } catch (err: any) {
      setParsedQuiz(null);
      setValidationError('Mã JSON chưa hợp lệ: ' + err.message);
    }
  };

  const handleStartLocal = () => {
    if (parsedQuiz) {
      onLoadQuiz(parsedQuiz);
      onClose();
    }
  };

  const handlePushToGithubSync = async () => {
    if (!parsedQuiz) return;
    if (!githubToken.trim()) {
      alert("Vui lòng nhập mã GitHub Personal Access Token (PAT) để sync lên Vercel.");
      return;
    }

    setIsPushing(true);
    setSyncResult(null);
    localStorage.setItem('github_pat_token', githubToken.trim());

    const safeTitle = parsedQuiz.title.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    const filePath = 'src/data/' + (safeTitle || 'de_thi_moi') + '.json';

    const res = await pushToGithub({
      token: githubToken.trim(),
      owner: 'HiepF5',
      repo: 'english-quiz-app',
      filePath,
      content: parsedQuiz,
      message: 'Auto-sync new quiz: ' + parsedQuiz.title
    });

    setIsPushing(false);

    if (res.success) {
      setSyncResult({
        success: true,
        message: 'Đã lưu file JSON và đẩy lên GitHub thành công! Vercel đang tự động Re-deploy bài thi mới cho TẤT CẢ mọi người.',
        url: res.commitUrl
      });
      onLoadQuiz(parsedQuiz);
    } else {
      setSyncResult({
        success: false,
        message: res.error || 'Lỗi khi đồng bộ lên GitHub.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Dán Trực Tiếp Mã JSON & Tự Động Đồng Bộ
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  Auto-Parse
                </span>
              </h3>
              <p className="text-xs text-slate-400">Dán đoạn mã JSON từ AI (ChatGPT/Gemini) để hệ thống tự động đọc & đồng bộ bài thi</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* JSON Textarea Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4 text-indigo-400" />
                Dán Mã JSON Đề Bài Vào Đây:
              </label>

              {parsedQuiz && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Đã nhận diện: {parsedQuiz.questions.length} câu hỏi
                </span>
              )}
            </div>

            <textarea
              rows={9}
              value={rawJsonText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={'Dán đoạn JSON đề thi của bạn vào đây (Ví dụ: { "title": "Đề Thi...", "questions": [...] })'}
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-200 focus:border-indigo-500 focus:outline-none leading-relaxed placeholder:text-slate-600 resize-none"
            />
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Parsed Quiz Summary Box */}
          {parsedQuiz && (
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{parsedQuiz.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{parsedQuiz.description}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-bold">
                  {parsedQuiz.questions.length} câu hỏi
                </span>
              </div>

              {/* Toggle GitHub Push Option */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowGithubSync(!showGithubSync)}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5"
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>{showGithubSync ? 'Ẩn tùy chọn đẩy lên GitHub Vercel' : 'Muốn lưu & đẩy đề này lên GitHub & Vercel cho mọi người cùng làm?'}</span>
                </button>

                {showGithubSync && (
                  <div className="mt-3 p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-3 animate-fadeIn">
                    <div>
                      <label className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                        <Key className="w-3 h-3 text-purple-400" /> GitHub Personal Access Token (PAT):
                      </label>
                      <input
                        type="password"
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        placeholder="github_pat_11A..."
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-purple-500/40 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>

                    <button
                      disabled={isPushing}
                      onClick={handlePushToGithubSync}
                      className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow transition flex items-center justify-center space-x-2"
                    >
                      {isPushing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitCommit className="w-3.5 h-3.5" />}
                      <span>{isPushing ? 'Đang Đẩy Lên GitHub...' : 'Tự Động Lưu File & Push Lên GitHub (Vercel)'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Sync Result Alert */}
              {syncResult && (
                <div className={'p-3 rounded-xl border text-xs leading-relaxed ' + (
                  syncResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                )}>
                  <p>{syncResult.message}</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
          >
            Đóng
          </button>

          <button
            disabled={!parsedQuiz}
            onClick={handleStartLocal}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Vào Làm Bài Ngay (Local)</span>
          </button>
        </div>

      </div>
    </div>
  );
};

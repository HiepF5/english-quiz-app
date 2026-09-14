import React, { useState, useEffect } from 'react';
import type { QuizSet } from '../types/quiz';
import { convertRawQuizWithGemini } from '../utils/gemini';
import { pushToGithub } from '../utils/github';
import { X, Sparkles, Key, ExternalLink, Loader2, CheckCircle2, AlertCircle, Play, GitCommit, FileText } from 'lucide-react';

interface AiConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadQuiz: (quiz: QuizSet) => void;
}

export const AiConverterModal: React.FC<AiConverterModalProps> = ({
  isOpen,
  onClose,
  onLoadQuiz
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizSet | null>(null);

  // GitHub push state
  const [githubToken, setGithubToken] = useState<string>(() => localStorage.getItem('github_pat_token') || '');
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConvert = async () => {
    if (!apiKey.trim()) {
      alert('Vui lòng nhập Google Gemini API Key. Bạn có thể lấy key miễn phí tại aistudio.google.com');
      return;
    }
    if (!rawText.trim()) {
      alert('Vui lòng dán nội dung đề thi thô vào ô văn bản.');
      return;
    }

    setIsConverting(true);
    setErrorMsg(null);
    setGeneratedQuiz(null);
    setPushResult(null);

    // Save key to localStorage
    localStorage.setItem('gemini_api_key', apiKey.trim());

    try {
      const result = await convertRawQuizWithGemini(apiKey.trim(), rawText.trim());
      setGeneratedQuiz(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi không xác định khi chuyển đổi bài thi bằng AI.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleStartLocal = () => {
    if (generatedQuiz) {
      onLoadQuiz(generatedQuiz);
      onClose();
    }
  };

  const handlePushToGithub = async () => {
    if (!generatedQuiz) return;
    if (!githubToken.trim()) {
      alert('Vui lòng nhập GitHub Personal Access Token (PAT)');
      return;
    }

    setIsPushing(true);
    setPushResult(null);
    localStorage.setItem('github_pat_token', githubToken.trim());

    const timeStamp = Date.now().toString().slice(-6);
    const safeSlug = generatedQuiz.id.replace(/[^a-z0-9]/gi, '_');
    const filePath = `src/data/${safeSlug}_${timeStamp}.json`;

    const res = await pushToGithub({
      token: githubToken.trim(),
      owner: 'HiepF5',
      repo: 'english-quiz-app',
      filePath,
      content: generatedQuiz,
      message: `AI generated quiz: ${generatedQuiz.title}`
    });

    setIsPushing(false);

    if (res.success) {
      setPushResult({
        success: true,
        message: `Đã tạo file "${filePath}" trên GitHub thành công! Bài thi sẽ tự động Re-deploy trên Vercel cho tất cả mọi người.`,
        url: res.commitUrl
      });
      onLoadQuiz(generatedQuiz);
    } else {
      setPushResult({
        success: false,
        message: res.error || 'Lỗi khi đẩy đề thi lên GitHub.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-lg shadow-purple-500/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                AI Tự Động Chuyển Đề Thi Thô ➔ JSON & Push
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Gemini AI
                </span>
              </h3>
              <p className="text-xs text-slate-400">Ném văn bản đề thi thô (Word/PDF) vào đây, AI sẽ tự tạo JSON chuẩn & Push Vercel</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Gemini API Key Input */}
          <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                Google Gemini API Key:
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
              >
                <span>Lấy API Key Miễn Phí Tại Đây</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/40 text-white text-xs font-mono focus:outline-none"
            />
          </div>

          {/* Raw Text Input Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              Dán Nội Dung Đề Thi Thô (Word/PDF/Văn Bản) Vào Đây:
            </label>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={"Dán bài thi thô vào đây, ví dụ:\nCâu 1: The manager ______ the office at 8 a.m. every day.\nA. arrive  B. arrives  C. arriving  D. arrived\nĐáp án đúng B. Lời giải: Chủ ngữ số ít..."}
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:border-purple-500 focus:outline-none leading-relaxed placeholder:text-slate-600 resize-none"
            />
          </div>

          {/* Action Convert Button */}
          <button
            disabled={isConverting}
            onClick={handleConvert}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-bold shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center space-x-2"
          >
            {isConverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-current" />}
            <span>{isConverting ? 'AI Đang Phân Tích & Sinh JSON Đề Thi...' : '✨ Chuyển Đổi Thành JSON Bằng AI'}</span>
          </button>

          {/* Error Display */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Generated Result Preview Box */}
          {generatedQuiz && (
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-purple-500/40 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{generatedQuiz.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{generatedQuiz.description}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                  {generatedQuiz.questions.length} câu hỏi
                </span>
              </div>

              {/* GitHub PAT Token input for direct push */}
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <label className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                  <Key className="w-3 h-3 text-purple-400" /> GitHub Token (dùng để Push & Deploy Vercel):
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="github_pat_11A..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-purple-500/40 text-white text-xs font-mono focus:outline-none"
                />
              </div>

              {/* Push result alert */}
              {pushResult && (
                <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  pushResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}>
                  <p>{pushResult.message}</p>
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

          <div className="flex items-center space-x-2">
            {generatedQuiz && (
              <button
                disabled={isPushing}
                onClick={handlePushToGithub}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition"
              >
                {isPushing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitCommit className="w-3.5 h-3.5" />}
                <span>{isPushing ? 'Đang Push...' : '🚀 Push Lên GitHub & Vercel'}</span>
              </button>
            )}

            <button
              disabled={!generatedQuiz}
              onClick={handleStartLocal}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Vào Làm Bài Ngay</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import type { QuizSet } from '../types/quiz';
import { pushToGithub } from '../utils/github';
import { X, GitCommit, Key, ExternalLink, CheckCircle2, AlertCircle, Loader2, FolderGit2 } from 'lucide-react';

interface GithubPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuiz: QuizSet | null;
}

export const GithubPushModal: React.FC<GithubPushModalProps> = ({
  isOpen,
  onClose,
  currentQuiz
}) => {
  const [token, setToken] = useState<string>('');
  const [owner, setOwner] = useState<string>('HiepF5');
  const [repo, setRepo] = useState<string>('english-quiz-app');
  const [fileName, setFileName] = useState<string>('');
  const [commitMsg, setCommitMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('github_pat_token');
    if (savedToken) setToken(savedToken);

    if (currentQuiz) {
      const safeTitle = currentQuiz.title.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
      setFileName(`src/data/${safeTitle || 'de_thi_moi'}.json`);
      setCommitMsg(`Add new quiz: ${currentQuiz.title}`);
    } else {
      setFileName('src/data/de_thi_tieng_anh_moi.json');
      setCommitMsg('Add new English quiz dataset');
    }
  }, [currentQuiz, isOpen]);

  if (!isOpen) return null;

  const handlePush = async () => {
    if (!token.trim()) {
      alert('Vui lòng nhập GitHub Personal Access Token (PAT)');
      return;
    }
    if (!currentQuiz) {
      alert('Vui lòng chọn hoặc nạp một bộ đề thi trước khi đẩy lên GitHub.');
      return;
    }

    setIsLoading(true);
    setResult(null);

    // Save token to localStorage for convenience
    localStorage.setItem('github_pat_token', token.trim());

    const response = await pushToGithub({
      token: token.trim(),
      owner: owner.trim(),
      repo: repo.trim(),
      filePath: fileName.trim(),
      content: currentQuiz,
      message: commitMsg.trim()
    });

    setIsLoading(false);

    if (response.success) {
      setResult({
        success: true,
        message: 'Đã commit & push thành công lên GitHub! Vercel đang tự động Re-deploy bài thi mới này cho TẤT CẢ mọi người.',
        url: response.commitUrl
      });
    } else {
      setResult({
        success: false,
        message: response.error || 'Lỗi không thể kết nối tới GitHub API.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/60 to-purple-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Tự Động Push GitHub & Deploy Vercel
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  Tự Động Re-deploy
                </span>
              </h3>
              <p className="text-xs text-slate-400">Đẩy bộ đề bài này thành bài thi cố định cho tất cả người học</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Active Quiz Preview */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1">
            <span className="text-[11px] font-semibold uppercase text-indigo-400">Bộ đề đang chọn để đẩy lên</span>
            <h4 className="text-sm font-bold text-white">{currentQuiz?.title || 'Chưa chọn đề bài'}</h4>
            <p className="text-xs text-slate-400">{currentQuiz?.description} ({currentQuiz?.questions.length || 0} câu hỏi)</p>
          </div>

          {/* Token Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                GitHub Personal Access Token (PAT)
              </label>
              <a
                href="https://github.com/settings/tokens?type=beta"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
              >
                <span>Tạo mã Token trên GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="github_pat_11A..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-purple-500 focus:outline-none placeholder:text-slate-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">Mã Token được lưu an toàn trong trình duyệt của riêng bạn.</p>
          </div>

          {/* Repo specs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400">Chủ Repository (Owner)</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Tên Repository</label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
              />
            </div>
          </div>

          {/* File path & commit message */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-400">Đường dẫn file lưu trong Repo</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-indigo-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Ghi chú Commit (Commit Message)</label>
              <input
                type="text"
                value={commitMsg}
                onChange={(e) => setCommitMsg(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
              />
            </div>
          </div>

          {/* Status Alert */}
          {result && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed transition-all ${
              result.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex items-start space-x-2 font-bold mb-1">
                {result.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                <span>{result.success ? 'Thành Công!' : 'Thất Bại'}</span>
              </div>
              <p className="text-slate-300">{result.message}</p>
              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-emerald-400 hover:underline font-semibold mt-2"
                >
                  <span>Xem Commit Trên GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-slate-900">
          <span className="text-xs text-slate-400">Vercel sẽ tự rebuild bài thi mới sau khi push (~30s)</span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              Đóng
            </button>

            <button
              disabled={isLoading || !currentQuiz}
              onClick={handlePush}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCommit className="w-4 h-4" />}
              <span>{isLoading ? 'Đang Push...' : 'Đẩy Lên GitHub & Deploy Vercel'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

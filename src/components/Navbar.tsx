import React, { useRef } from 'react';
import { BookOpen, Upload, PlusCircle, Award, RotateCcw, FileCode, GitCommit, ClipboardPaste } from 'lucide-react';

interface NavbarProps {
  onImportJson: (content: string, filename: string) => void;
  onOpenCreator: () => void;
  onOpenTemplateModal: () => void;
  onOpenPasteModal: () => void;
  onOpenGithubModal: () => void;
  onResetToSelection: () => void;
  currentQuizTitle?: string;
  scoreHistoryCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onImportJson,
  onOpenCreator,
  onOpenTemplateModal,
  onOpenPasteModal,
  onOpenGithubModal,
  onResetToSelection,
  currentQuizTitle,
  scoreHistoryCount
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onImportJson(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        
        {/* Brand Logo & Current Quiz */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onResetToSelection}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-black text-xl tracking-wider">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                EnglishQuiz <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">JSON Hub</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium line-clamp-1 max-w-xs sm:max-w-md">
              {currentQuizTitle ? `Đang làm: ${currentQuizTitle}` : 'Hệ thống luyện thi trắc nghiệm Tiếng Anh từ file JSON'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {currentQuizTitle && (
            <button
              onClick={onResetToSelection}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đổi Đề Bài</span>
            </button>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all border border-indigo-400/30"
            title="Tải file JSON đề bài của bạn"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nạp JSON Mới</span>
            <span className="sm:hidden">Nạp JSON</span>
          </button>

          <button
            onClick={onOpenPasteModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all"
            title="Dán trực tiếp mã JSON vừa copy từ AI vào đây"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Dán Mã JSON</span>
            <span className="md:hidden">Dán JSON</span>
          </button>

          <button
            onClick={onOpenGithubModal}
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all shadow-sm shadow-purple-500/10"
            title="Tự động Push đề mới lên GitHub để Vercel Re-deploy"
          >
            <GitCommit className="w-3.5 h-3.5 text-purple-400" />
            <span>Push GitHub</span>
          </button>

          <button
            onClick={onOpenTemplateModal}
            className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all"
            title="Xem cấu trúc file JSON mẫu chuẩn"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>Mẫu JSON</span>
          </button>

          <button
            onClick={onOpenCreator}
            className="hidden 2xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            title="Tạo file JSON đề thi trực quan"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tạo File JSON</span>
          </button>

          {scoreHistoryCount > 0 && (
            <div className="hidden 2xl:flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Đã xong: {scoreHistoryCount}</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

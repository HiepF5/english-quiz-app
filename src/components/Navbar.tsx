import React, { useRef } from 'react';
import {
  BookOpen,
  HelpCircle,
  Languages,
  Sparkles,
  Upload,
  ClipboardPaste,
  GitCommit,
  FileCode,
  Award,
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  activeModule: 'quiz' | 'translation';
  onChangeModule: (module: 'quiz' | 'translation') => void;
  onImportJson: (content: string, filename: string) => void;
  onOpenTemplateModal: () => void;
  onOpenPasteModal: () => void;
  onOpenAiModal: () => void;
  onOpenGithubModal: () => void;
  onResetToSelection: () => void;
  currentQuizTitle?: string;
  scoreHistoryCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  onChangeModule,
  onImportJson,
  onOpenTemplateModal,
  onOpenPasteModal,
  onOpenAiModal,
  onOpenGithubModal,
  onResetToSelection,
  currentQuizTitle,
  scoreHistoryCount,
  theme,
  onToggleTheme
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLight = theme === 'light';

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
    <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors shadow-md ${
      isLight ? 'bg-white/90 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand Logo & Module Switcher Tabs */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { onChangeModule('quiz'); onResetToSelection(); }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-black text-xl tracking-wider">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold tracking-tight flex items-center gap-1.5">
                  EnglishQuiz <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">AI Hub</span>
                </h1>
              </div>
              <p className="text-xs opacity-75 font-medium line-clamp-1 max-w-xs sm:max-w-md">
                {currentQuizTitle ? `Đang làm: ${currentQuizTitle}` : 'Luyện thi Trắc nghiệm & Luyện Dịch AI Chấm Điểm'}
              </p>
            </div>
          </div>

          {/* Module Switcher Tabs */}
          <div className={`flex items-center p-1 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              onClick={() => onChangeModule('quiz')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeModule === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Trắc Nghiệm JSON</span>
            </button>

            <button
              onClick={() => onChangeModule('translation')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeModule === 'translation'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-amber-300" />
              <span>Luyện Dịch & AI Chấm</span>
            </button>
          </div>
        </div>

        {/* Action Buttons & Theme Switcher */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title="Đổi giao diện Sáng / Tối"
          >
            {isLight ? <Moon className="w-3.5 h-3.5 text-indigo-600" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isLight ? 'Tối' : 'Sáng'}</span>
          </button>

          {activeModule === 'quiz' ? (
            <>
              {currentQuizTitle && (
                <button
                  onClick={onResetToSelection}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:opacity-80 text-xs font-semibold transition border border-slate-300 dark:border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đổi đề</span>
                </button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />

              <button
                onClick={onOpenAiModal}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all border border-purple-400/30"
                title="Dán văn bản thô, AI tự chuyển JSON & Push"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current text-amber-300" />
                <span className="hidden sm:inline">✨ AI Chuyển Đề & Push</span>
                <span className="sm:hidden">✨ AI Chuyển Đề</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
                title="Tải file JSON đề bài của bạn"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Nộp JSON Mới</span>
              </button>

              <button
                onClick={onOpenPasteModal}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all"
                title="Dán trực tiếp mã JSON"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Dán Mã JSON</span>
              </button>

              <button
                onClick={onOpenGithubModal}
                className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all"
                title="Push đề mới lên GitHub & Vercel"
              >
                <GitCommit className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Push GitHub</span>
              </button>

              <button
                onClick={onOpenTemplateModal}
                className="hidden 2xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all"
                title="Xem cấu trúc file JSON mẫu"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Mẫu JSON</span>
              </button>

              {scoreHistoryCount > 0 && (
                <div className="hidden 2xl:flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium">
                  <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Đã xong: {scoreHistoryCount}</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-semibold text-purple-600 dark:text-purple-300">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-300" />
              <span>Chế độ: Luyện Dịch & AI Chấm</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

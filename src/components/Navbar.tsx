import React from 'react';
import {
  BookOpen,
  HelpCircle,
  Sparkles,
  Award,
  RotateCcw,
  Sun,
  Moon,
  ListOrdered,
  LayoutList,
  Users,
  Headphones,
  Mic,
  PenTool
} from 'lucide-react';

export type AppModule = 'quiz' | 'ordering' | 'headings' | 'opinion' | 'writing' | 'listening_p3' | 'listening_p4';

interface NavbarProps {
  activeModule: AppModule;
  onChangeModule: (module: AppModule) => void;
  onImportJson?: (content: string, filename: string) => void;
  onOpenTemplateModal?: () => void;
  onOpenPasteModal?: () => void;
  onOpenAiModal?: () => void;
  onOpenGithubModal?: () => void;
  onResetToSelection: () => void;
  currentQuizTitle?: string;
  scoreHistoryCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  onChangeModule,
  onResetToSelection,
  currentQuizTitle,
  scoreHistoryCount,
  theme,
  onToggleTheme
}) => {
  const isLight = theme === 'light';

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
                {currentQuizTitle ? `Đang làm: ${currentQuizTitle}` : 'Trắc Nghiệm • Sắp Xếp Câu (Part 2-3) • Nối Từ (Part 5) • Ý Kiến Người (Part 4) • Viết (Writing) • Nghe Part 3 & 4'}
              </p>
            </div>
          </div>

          {/* Module Switcher Tabs */}
          <div className={`flex items-center p-1 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              onClick={() => onChangeModule('quiz')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeModule === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Trắc Nghiệm JSON</span>
            </button>

            <button
              onClick={() => onChangeModule('ordering')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeModule === 'ordering'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 text-amber-300" />
              <span>Sắp Xếp Câu (Part 2-3)</span>
            </button>

            <button
              onClick={() => onChangeModule('headings')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeModule === 'headings'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5 text-emerald-300" />
              <span>Nối Từ (Part 5)</span>
            </button>

            <button
              onClick={() => onChangeModule('opinion')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeModule === 'opinion'
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-300" />
              <span>Ý Kiến Người (Part 4)</span>
            </button>

            <button
              onClick={() => onChangeModule('writing')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeModule === 'writing'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-pink-300" />
              <span>Luyện Viết (Writing)</span>
            </button>

            <button
              onClick={() => onChangeModule('listening_p3')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeModule === 'listening_p3'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Headphones className="w-3.5 h-3.5 text-cyan-300" />
              <span>Nghe Part 3</span>
            </button>

            <button
              onClick={() => onChangeModule('listening_p4')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeModule === 'listening_p4'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-pink-300" />
              <span>Nghe Part 4</span>
            </button>
          </div>
        </div>

        {/* Action Buttons & Theme Switcher */}
        <div className="flex items-center space-x-2 shrink-0">
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
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:opacity-80 text-xs font-semibold transition border border-slate-300 dark:border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đổi đề</span>
                </button>
              )}

              {scoreHistoryCount > 0 && (
                <div className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium">
                  <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Đã xong: {scoreHistoryCount}</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-300" />
              <span>Aptis ESOL Practice Hub</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

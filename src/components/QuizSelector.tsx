import React, { useState } from 'react';
import type { QuizSet, QuizMode, QuizHistoryRecord } from '../types/quiz';
import { Play, Eye, Clock, HelpCircle, Sparkles, CheckCircle2, FileCode, ClipboardPaste, Award } from 'lucide-react';

interface QuizSelectorProps {
  quizSets: QuizSet[];
  quizHistoryMap: Record<string, QuizHistoryRecord>;
  onSelectQuiz: (quiz: QuizSet, mode: QuizMode) => void;
  onFileUpload: (content: string, filename: string) => void;
  onOpenTemplateModal: () => void;
  onOpenPasteModal: () => void;
  onOpenAiModal: () => void;
  onOpenGithubModal: () => void;
  customQuizCount: number;
}

export const QuizSelector: React.FC<QuizSelectorProps> = ({
  quizSets,
  quizHistoryMap,
  onSelectQuiz,
  onFileUpload,
  onOpenTemplateModal,
  onOpenPasteModal,
  onOpenAiModal,
  customQuizCount: _customQuizCount
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'uncompleted'>('all');
  const [dragActive, setDragActive] = useState<boolean>(false);

  const categories = ['All', ...Array.from(new Set(quizSets.map(q => q.category || 'General')))];

  const filteredSets = quizSets.filter(quiz => {
    const categoryMatch = selectedCategory === 'All' || (quiz.category || 'General') === selectedCategory;
    const history = quizHistoryMap[quiz.id];
    let statusMatch = true;
    if (statusFilter === 'completed') {
      statusMatch = !!history;
    } else if (statusFilter === 'uncompleted') {
      statusMatch = !history;
    }
    return categoryMatch && statusMatch;
  });

  const completedTotalCount = Object.keys(quizHistoryMap).length;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          onFileUpload(text, file.name);
        };
        reader.readAsText(file);
      } else {
        alert('Vui lòng chọn file định dạng .json');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/60 via-slate-900 to-purple-950/60 border border-slate-800 p-8 sm:p-10 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hệ Thống Luyện Thi Trắc Nghiệm Tiếng Anh JSON</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Lựa Chọn Bộ Đề Bài Hoặc <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Nạp Văn Bản Thô — AI Tự Sinh JSON
            </span>
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Chọn bộ đề bài tiếng Anh có sẵn (Hiện tại đơn, Quá khứ đơn, TOEIC Part 5/6, Từ vựng) 
            hoặc dán bài thi thô để AI tự tạo JSON & Push trực tiếp lên Vercel!
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI tự sinh câu hỏi & giải thích
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1-Click Push GitHub & Vercel
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Phát âm câu hỏi (TTS)
            </span>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
          dragActive
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2.5">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">
              Kéo & thả file <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-xs">.json</code> đề bài vào đây
            </p>
            <p className="text-xs text-slate-400 mt-1">
              hoặc sử dụng công cụ <span className="text-purple-400 font-semibold">✨ AI Chuyển Đề & Push</span> để biến bài thô thành JSON
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={onOpenAiModal}
              className="inline-flex items-center space-x-1.5 text-xs px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current text-amber-300" />
              <span>✨ AI Tự Chuyển Đề Thô ➔ JSON & Push</span>
            </button>

            <button
              onClick={onOpenPasteModal}
              className="inline-flex items-center space-x-1.5 text-xs px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all font-semibold"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dán Trực Tiếp Mã JSON</span>
            </button>

            <button
              onClick={onOpenTemplateModal}
              className="inline-flex items-center space-x-1.5 text-xs px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all font-semibold"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mẫu JSON & Prompt AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        
        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat === 'All' ? 'Tất cả đề bài' : cat}
            </button>
          ))}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === 'all' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất cả ({quizSets.length})
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1 ${
              statusFilter === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Đã làm ({completedTotalCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('uncompleted')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === 'uncompleted' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chưa làm ({quizSets.length - completedTotalCount})
          </button>
        </div>

      </div>

      {/* Quiz Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSets.map((quiz) => {
          const history = quizHistoryMap[quiz.id];

          return (
            <div
              key={quiz.id}
              className={`group relative rounded-2xl glass-card p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                history
                  ? 'border-emerald-500/40 hover:border-emerald-500/60 bg-gradient-to-b from-emerald-950/20 to-slate-900/80 shadow-emerald-500/5'
                  : 'hover:border-indigo-500/40 hover:shadow-indigo-500/10'
              }`}
            >
              <div>
                {/* Completed Badge Indicator */}
                {history && (
                  <div className="mb-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-emerald-300">Đã Hoàn Thành</span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-extrabold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        {history.highestScore}/{history.totalQuestions} ({history.highestPercentage}%)
                      </span>
                    </div>
                  </div>
                )}

                {/* Card Header badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                    {quiz.category || 'General'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium">
                    {quiz.level || 'All Levels'}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2">
                  {quiz.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                  {quiz.description}
                </p>
              </div>

              <div className="space-y-4 pt-3 border-t border-slate-800/80">
                {/* Specs & Attempts history */}
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <div className="flex items-center space-x-1.5">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    <span>{quiz.questions.length} câu hỏi</span>
                  </div>

                  {history ? (
                    <div className="flex items-center space-x-1 text-slate-400">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Đã làm {history.timesCompleted} lần</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>{quiz.timeLimitMinutes || 15} phút</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onSelectQuiz(quiz, 'practice')}
                    className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{history ? 'Luyện Lại' : 'Luyện Tập'}</span>
                  </button>

                  <button
                    onClick={() => onSelectQuiz(quiz, 'exam')}
                    className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold shadow transition ${
                      history
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{history ? 'Thi Lại' : 'Thi Tính Giờ'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

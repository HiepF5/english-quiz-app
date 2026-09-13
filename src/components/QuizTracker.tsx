import React from 'react';
import type { QuizMode } from '../types/quiz';
import { Clock, Send, RotateCcw } from 'lucide-react';

interface QuizTrackerProps {
  totalQuestions: number;
  userAnswers: Record<number, number>;
  correctAnswers?: Record<number, number>;
  secondsElapsed: number;
  timeLimitSeconds: number;
  isSubmitted: boolean;
  onSubmit: () => void;
  onReset: () => void;
  mode: QuizMode;
}

export const QuizTracker: React.FC<QuizTrackerProps> = ({
  totalQuestions,
  userAnswers,
  correctAnswers,
  secondsElapsed,
  timeLimitSeconds,
  isSubmitted,
  onSubmit,
  onReset,
  mode
}) => {
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Remaining time calculation for exam mode
  const remainingSeconds = Math.max(0, timeLimitSeconds - secondsElapsed);
  const displayMins = String(Math.floor((mode === 'exam' ? remainingSeconds : secondsElapsed) / 60)).padStart(2, '0');
  const displaySecs = String((mode === 'exam' ? remainingSeconds : secondsElapsed) % 60).padStart(2, '0');

  const isLowTime = mode === 'exam' && remainingSeconds <= 120 && !isSubmitted;

  const handleQuestionClick = (index: number) => {
    const el = document.getElementById(`question-card-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="sticky top-20 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-5 backdrop-blur-md">
      
      {/* Timer Section */}
      <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
        isLowTime
          ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 animate-pulse'
          : 'bg-slate-800/80 border-slate-700/80 text-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <Clock className={`w-4 h-4 ${isLowTime ? 'text-rose-400' : 'text-indigo-400'}`} />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {mode === 'exam' ? 'Thời gian còn lại' : 'Thời gian đã dùng'}
          </span>
        </div>
        <span className={`text-lg font-mono font-bold ${isLowTime ? 'text-rose-400' : 'text-indigo-300'}`}>
          {displayMins}:{displaySecs}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-400 uppercase">Tiến Độ Làm Bài</span>
          <span className="text-indigo-400">{answeredCount}/{totalQuestions} ({progressPercent}%)</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Question Tracker Grid */}
      <div className="space-y-2 border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400 uppercase">Danh Sách Câu Hỏi</p>
          <span className="text-[10px] text-slate-500">Bấm để nhảy tới câu</span>
        </div>

        <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const isAnswered = userAnswers[idx] !== undefined;
            const userSelected = userAnswers[idx];
            const correctOpt = correctAnswers ? correctAnswers[idx] : undefined;

            let btnStyle = 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700';

            if (isSubmitted && correctOpt !== undefined) {
              if (userSelected === correctOpt) {
                btnStyle = 'bg-emerald-600 text-white font-bold border-emerald-500 shadow-sm shadow-emerald-500/20';
              } else if (userSelected !== undefined) {
                btnStyle = 'bg-rose-600 text-white font-bold border-rose-500 shadow-sm shadow-rose-500/20';
              } else {
                btnStyle = 'bg-slate-800 text-slate-500 border-slate-700';
              }
            } else if (isAnswered) {
              btnStyle = 'bg-indigo-600 text-white font-bold border-indigo-500 shadow-sm shadow-indigo-600/20';
            }

            return (
              <button
                key={idx}
                onClick={() => handleQuestionClick(idx)}
                className={`aspect-square rounded-xl text-xs font-semibold transition border flex items-center justify-center ${btnStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-slate-800 pt-4 space-y-2">
        {!isSubmitted ? (
          <button
            onClick={onSubmit}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Nộp Bài Thi</span>
          </button>
        ) : (
          <button
            onClick={onReset}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Làm lại bài thi này</span>
          </button>
        )}
      </div>

    </div>
  );
};

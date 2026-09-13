import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, ArrowRight, Award } from 'lucide-react';

interface ResultSummaryProps {
  score: number;
  total: number;
  timeTakenSeconds: number;
  quizTitle: string;
  onRetake: () => void;
  onChangeQuiz: () => void;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({
  score,
  total,
  timeTakenSeconds,
  quizTitle,
  onRetake,
  onChangeQuiz
}) => {
  const percentage = Math.round((score / total) * 100);
  const minutes = Math.floor(timeTakenSeconds / 60);
  const seconds = timeTakenSeconds % 60;

  useEffect(() => {
    if (percentage >= 75) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [percentage]);

  let evaluationText = '';
  let evaluationColor = '';

  if (percentage >= 90) {
    evaluationText = 'Xuất sắc! Bạn nắm rất vững kiến thức ngữ pháp & từ vựng!';
    evaluationColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (percentage >= 70) {
    evaluationText = 'Khá tốt! Hãy chú ý phân tích kỹ những câu bị bẫy nhé!';
    evaluationColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
  } else {
    evaluationText = 'Cần ôn luyện thêm! Hãy xem lại phần giải thích chi tiết bên dưới.';
    evaluationColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-fadeIn">
      
      {/* Header Trophy Icon */}
      <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-xl shadow-indigo-500/10">
        <Trophy className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Kết Quả Làm Bài Thi
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-medium">
          {quizTitle}
        </p>
      </div>

      {/* Main Score & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
        
        {/* Score Card */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-center items-center">
          <span className="text-xs text-slate-400 uppercase font-semibold">Điểm Số</span>
          <div className="text-3xl font-black text-indigo-400 mt-1">
            {score} <span className="text-base text-slate-500">/ {total}</span>
          </div>
        </div>

        {/* Percentage Card */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-center items-center">
          <span className="text-xs text-slate-400 uppercase font-semibold">Tỷ Lệ Đúng</span>
          <div className="text-3xl font-black text-purple-400 mt-1">
            {percentage}%
          </div>
        </div>

        {/* Time Spent Card */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-center items-center">
          <span className="text-xs text-slate-400 uppercase font-semibold">Thời Gian làm</span>
          <div className="text-2xl font-mono font-bold text-slate-200 mt-1">
            {minutes}m {seconds}s
          </div>
        </div>

      </div>

      {/* Evaluation Box */}
      <div className={`p-4 rounded-xl border text-xs sm:text-sm font-semibold max-w-2xl mx-auto ${evaluationColor}`}>
        <div className="flex items-center justify-center space-x-2">
          <Award className="w-4 h-4 shrink-0" />
          <span>{evaluationText}</span>
        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={onRetake}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700"
        >
          <RotateCcw className="w-4 h-4 text-indigo-400" />
          <span>Làm Lại Đề Này</span>
        </button>

        <button
          onClick={onChangeQuiz}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition"
        >
          <span>Chọn Bộ Đề Khác</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

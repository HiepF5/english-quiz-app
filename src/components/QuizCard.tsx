import React, { useState } from 'react';
import type { Question, QuizMode } from '../types/quiz';
import { Volume2, Bookmark, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  index: number;
  selectedOption?: number;
  onSelectOption: (optionIndex: number) => void;
  isSubmitted: boolean;
  mode: QuizMode;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  index,
  selectedOption,
  onSelectOption,
  isSubmitted,
  mode
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const optionLabels = ['A', 'B', 'C', 'D'];

  const handleSpeakQuestion = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question.question.replace(/______/g, 'blank'));
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Trình duyệt của bạn không hỗ trợ phát âm tự động.');
    }
  };

  const showInstantExplanation = mode === 'practice' && selectedOption !== undefined;
  const showPostSubmitExplanation = isSubmitted;
  const showExplanation = showInstantExplanation || showPostSubmitExplanation;

  return (
    <div
      id={`question-card-${index}`}
      className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4 transition-all hover:border-slate-700"
    >
      {/* Header: Part badge & Action icons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-bold">
            Câu {index + 1}
          </span>
          {question.part && (
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {question.part}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Text-To-Speech Button */}
          <button
            onClick={handleSpeakQuestion}
            className={`p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition ${
              isPlayingAudio ? 'text-indigo-400 bg-indigo-500/20 animate-pulse' : ''
            }`}
            title="Đọc phát âm tiếng Anh"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-lg transition ${
              isBookmarked
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
            }`}
            title="Đánh dấu câu hỏi cần xem lại"
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Question Text */}
      <p className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed">
        {question.question}
      </p>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {question.options.map((opt, oIdx) => {
          const isSelected = selectedOption === oIdx;
          const isCorrect = question.correct === oIdx;

          let optionStyle = 'bg-slate-800/60 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600';

          if (isSubmitted || showInstantExplanation) {
            if (isCorrect) {
              optionStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-semibold shadow-sm shadow-emerald-500/10';
            } else if (isSelected && !isCorrect) {
              optionStyle = 'bg-rose-500/15 border-rose-500 text-rose-300 font-semibold';
            } else {
              optionStyle = 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60';
            }
          } else if (isSelected) {
            optionStyle = 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-semibold ring-1 ring-indigo-500/50';
          }

          return (
            <button
              key={oIdx}
              disabled={isSubmitted}
              onClick={() => onSelectOption(oIdx)}
              className={`flex items-center space-x-3 p-3.5 rounded-xl border text-left text-sm transition-all duration-200 ${optionStyle}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                  (isSubmitted || showInstantExplanation) && isCorrect
                    ? 'bg-emerald-500 text-white'
                    : (isSubmitted || showInstantExplanation) && isSelected && !isCorrect
                    ? 'bg-rose-500 text-white'
                    : isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700/60 text-slate-400'
                }`}
              >
                {optionLabels[oIdx]}
              </div>
              <span className="flex-1 leading-snug">{opt}</span>

              {(isSubmitted || showInstantExplanation) && isCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {(isSubmitted || showInstantExplanation) && isSelected && !isCorrect && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {showExplanation && (
        <div
          className={`mt-4 p-4 rounded-xl text-xs sm:text-sm leading-relaxed border-l-4 transition-all animate-fadeIn ${
            selectedOption === question.correct
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500 text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2 font-bold mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>
              {selectedOption === question.correct ? 'Chính xác!' : `Chưa chính xác. Đáp án đúng: ${optionLabels[question.correct]}`}
            </span>
          </div>
          <p className="text-slate-300 mt-1">{question.explanation}</p>
        </div>
      )}

    </div>
  );
};

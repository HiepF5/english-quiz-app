import React, { useState } from 'react';
import type { Question, QuizMode } from '../types/quiz';
import { Volume2, Bookmark, CheckCircle2, XCircle, HelpCircle, BookOpen, ChevronDown, ChevronUp, Sparkles, Languages } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  index: number;
  selectedOption?: number;
  onSelectOption: (optionIndex: number) => void;
  isSubmitted: boolean;
  mode: QuizMode;
  hideNames?: boolean;
  paragraphOrder?: number[];
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  index,
  selectedOption,
  onSelectOption,
  isSubmitted,
  mode,
  hideNames = false,
  paragraphOrder
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPassageOpen, setIsPassageOpen] = useState(true);
  const [showVietnamesePassage, setShowVietnamesePassage] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);

  const optionLabels = ['A', 'B', 'C', 'D'];

  // Handle paragraph shuffling and name hiding if passage has 4 blocks
  const { displayPassageEn, displayPassageVi, displayOptions, effectiveCorrect } = React.useMemo(() => {
    if (!question.passage || question.options.length !== 4) {
      return {
        displayPassageEn: question.passage,
        displayPassageVi: question.passageVi,
        displayOptions: question.options,
        effectiveCorrect: question.correct
      };
    }

    const enBlocks = question.passage.split('\n\n');
    const viBlocks = question.passageVi ? question.passageVi.split('\n\n') : [];
    const is4Blocks = enBlocks.length === 4;

    if (!is4Blocks) {
      return {
        displayPassageEn: question.passage,
        displayPassageVi: question.passageVi,
        displayOptions: question.options,
        effectiveCorrect: question.correct
      };
    }

    const order = (paragraphOrder && paragraphOrder.length === 4) ? paragraphOrder : [0, 1, 2, 3];

    // Build shuffled & masked passage text
    const processedEn = order.map((origIdx, slotIdx) => {
      const block = enBlocks[origIdx] || '';
      const letter = optionLabels[slotIdx];
      const origName = question.options[origIdx];
      const body = block.replace(/^\[.*?\]\s*/, '');
      const header = hideNames ? `[Đoạn ${letter}]` : `[Đoạn ${letter} - ${origName}]`;
      return `${header}\n${body}`;
    }).join('\n\n');

    const processedVi = viBlocks.length === 4 ? order.map((origIdx, slotIdx) => {
      const block = viBlocks[origIdx] || '';
      const letter = optionLabels[slotIdx];
      const origName = question.options[origIdx];
      const body = block.replace(/^\[.*?\]\s*/, '');
      const header = hideNames ? `[Đoạn ${letter}]` : `[Đoạn ${letter} - ${origName}]`;
      return `${header}\n${body}`;
    }).join('\n\n') : question.passageVi;

    // Build options
    const processedOptions = order.map((origIdx, slotIdx) => {
      const letter = optionLabels[slotIdx];
      if (hideNames) {
        return `Đoạn ${letter}`;
      }
      return `${question.options[origIdx]}`;
    });

    const newCorrect = order.indexOf(question.correct);

    return {
      displayPassageEn: processedEn,
      displayPassageVi: processedVi,
      displayOptions: processedOptions,
      effectiveCorrect: newCorrect >= 0 ? newCorrect : question.correct
    };
  }, [question, hideNames, paragraphOrder]);

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
          {hideNames && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
              Ẩn tên ABCD
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

      {/* Reading Passage Box (if question contains passage) */}
      {displayPassageEn && (
        <div className="rounded-xl border border-indigo-500/30 bg-slate-950/70 overflow-hidden shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-800/80 border-b border-slate-800">
            <button
              onClick={() => setIsPassageOpen(!isPassageOpen)}
              className="flex items-center space-x-2 text-xs font-bold text-indigo-300 hover:text-indigo-200 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Đoạn văn bài đọc (4 Nhân vật {hideNames ? '• Ẩn tên ABCD' : ''})</span>
              {isPassageOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center space-x-2">
              {displayPassageVi && (
                <button
                  type="button"
                  onClick={() => setShowVietnamesePassage(!showVietnamesePassage)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border transition flex items-center space-x-1 ${
                    showVietnamesePassage
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                  title="Bật/Tắt dịch song ngữ Tiếng Việt"
                >
                  <Languages className="w-3 h-3" />
                  <span>{showVietnamesePassage ? '🇻🇳 Song ngữ Bật' : '🇬🇧 Tiếng Anh'}</span>
                </button>
              )}

              {question.mnemonicHint && (
                <button
                  type="button"
                  onClick={() => setShowMnemonic(!showMnemonic)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border transition flex items-center space-x-1 ${
                    showMnemonic
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                  title="Hiện mẹo ghi nhớ nhanh"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Mẹo</span>
                </button>
              )}
            </div>
          </div>

          {isPassageOpen && (
            <div className="p-4 space-y-3 text-xs sm:text-sm max-h-80 overflow-y-auto leading-relaxed">
              {/* If mnemonic is toggled */}
              {showMnemonic && question.mnemonicHint && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold">Mẹo nhớ câu này: </span>
                    <span>{question.mnemonicHint}</span>
                  </div>
                </div>
              )}

              {/* Render passage content */}
              <div className="whitespace-pre-line text-slate-300">
                {showVietnamesePassage ? (
                  <div className="space-y-4">
                    <div className="text-slate-200">{displayPassageEn}</div>
                    <div className="pt-3 border-t border-slate-800 text-slate-300 italic bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
                      <div className="font-bold text-emerald-400 text-xs mb-1.5 not-italic flex items-center space-x-1.5">
                        <Languages className="w-3.5 h-3.5" />
                        <span>Bản dịch Tiếng Việt:</span>
                      </div>
                      <div className="whitespace-pre-line not-italic text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {displayPassageVi}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>{displayPassageEn}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Question Text */}
      <div className="pt-1">
        <p className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed whitespace-pre-line">
          {question.question}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {displayOptions.map((opt, oIdx) => {
          const isSelected = selectedOption === oIdx;
          const isCorrect = effectiveCorrect === oIdx;

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
            selectedOption === effectiveCorrect
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500 text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2 font-bold mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>
              {selectedOption === effectiveCorrect
                ? `Chính xác! Đáp án đúng: Đoạn ${optionLabels[effectiveCorrect]} (${question.options[question.correct]})`
                : `Chưa chính xác. Đáp án đúng: Đoạn ${optionLabels[effectiveCorrect]} (${question.options[question.correct]})`}
            </span>
          </div>
          <div className="text-slate-300 whitespace-pre-line leading-relaxed">{question.explanation}</div>
        </div>
      )}

    </div>
  );
};

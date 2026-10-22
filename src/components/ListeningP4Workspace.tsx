import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Square,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  Clock,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Highlighter,
  Dices,
  ArrowRight
} from 'lucide-react';
import type { P4PairItem, ListeningP4Mode } from '../types/listeningP4';
import p4PairsData from '../data/aptis_listening_part4_pairs.json';
import { speakSingleSentence, stopSpeaking } from '../utils/speech';

export interface FlattenedP4Question {
  globalIndex: number;
  pairIndex: number;
  pairId: string;
  audioPrompt?: string;
  instruction?: string;
  tipMnemonic?: string;
  explanationVi?: string;
  question: {
    id: string;
    question: string;
    questionVi?: string;
    options: string[];
    optionsVi?: string[];
    correct: number;
    keyHighlight?: string;
    keyHighlightVi?: string;
  };
}

export const ListeningP4Workspace: React.FC = () => {
  const initialPairs: P4PairItem[] = (p4PairsData as any).pairs || [];

  // Mode: 'practice' (Luyện tập cặp câu) vs 'exam' (Thi đảo cặp câu) vs 'quiz60' (Trắc nghiệm 60 câu liên tục)
  const [mode, setMode] = useState<ListeningP4Mode>(() => {
    try {
      const saved = localStorage.getItem('aptis_listening_p4_mode');
      if (saved === 'practice' || saved === 'exam' || saved === 'quiz60') return saved as ListeningP4Mode;
    } catch {}
    return 'practice';
  });

  // State: Highlight key bật / tắt
  const [highlightKey, setHighlightKey] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aptis_listening_p4_highlight');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleHighlightKey = () => {
    setHighlightKey(prev => {
      const next = !prev;
      try {
        localStorage.setItem('aptis_listening_p4_highlight', String(next));
      } catch {}
      return next;
    });
  };

  // State: Đảo đề (Shuffle pairs order)
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [pairsList, setPairsList] = useState<P4PairItem[]>(initialPairs);

  // Active pair index in practice mode
  const [activePairIndex, setActivePairIndex] = useState<number>(0);

  // User answers map: questionId -> selectedOptionIdx (0, 1, 2)
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});

  // Exam submitted
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; total: number; percentage: number } | null>(null);

  // Audio / Speech
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playingPairId, setPlayingPairId] = useState<string | null>(null);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // Toggle translation
  const [showVietnamese, setShowVietnamese] = useState<boolean>(true);

  // Flattened 60 questions from pairsList
  const flattenedQuestions: FlattenedP4Question[] = useMemo(() => {
    const list: FlattenedP4Question[] = [];
    let count = 0;
    pairsList.forEach(pair => {
      pair.questions.forEach(q => {
        count++;
        list.push({
          globalIndex: count,
          pairIndex: pair.pairIndex,
          pairId: pair.id,
          audioPrompt: pair.audioPrompt,
          instruction: pair.instruction,
          tipMnemonic: pair.tipMnemonic,
          explanationVi: pair.explanationVi,
          question: q
        });
      });
    });
    return list;
  }, [pairsList]);

  // Timer count
  useEffect(() => {
    let interval: any = null;
    if ((mode === 'exam' || mode === 'quiz60') && !isExamSubmitted) {
      interval = setInterval(() => {
        setSecondsElapsed(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, isExamSubmitted]);

  // Handle mode change
  const handleModeChange = (newMode: ListeningP4Mode) => {
    stopSpeaking();
    setIsPlayingAudio(false);
    setPlayingPairId(null);
    setMode(newMode);
    try {
      localStorage.setItem('aptis_listening_p4_mode', newMode);
    } catch {}

    if (newMode === 'exam') {
      startNewExam();
    } else if (newMode === 'quiz60') {
      setIsExamSubmitted(false);
      setScoreResult(null);
      setSecondsElapsed(0);
    } else {
      setPairsList(initialPairs);
      setIsExamSubmitted(false);
    }
  };

  // Shuffle helper
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const startNewExam = () => {
    stopSpeaking();
    setIsPlayingAudio(false);
    setPlayingPairId(null);
    setUserAnswers({});
    setIsExamSubmitted(false);
    setScoreResult(null);
    setSecondsElapsed(0);
    const shuffled = shuffleArray(initialPairs);
    setPairsList(shuffled);
    setIsShuffled(true);
    setActivePairIndex(0);
  };

  const handleShuffleToggle = () => {
    stopSpeaking();
    if (!isShuffled) {
      setPairsList(shuffleArray(initialPairs));
      setIsShuffled(true);
    } else {
      setPairsList(initialPairs);
      setIsShuffled(false);
    }
    setActivePairIndex(0);
  };

  // Jump to a random pair
  const handleRandomJump = () => {
    stopSpeaking();
    if (pairsList.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * pairsList.length);
    if (nextIdx === activePairIndex) {
      nextIdx = (nextIdx + 1) % pairsList.length;
    }
    setActivePairIndex(nextIdx);
  };

  // Go to next pair (wrap around if needed or advance)
  const handleNextPair = () => {
    stopSpeaking();
    setActivePairIndex(prev => (prev < pairsList.length - 1 ? prev + 1 : 0));
  };

  const handlePrevPair = () => {
    stopSpeaking();
    setActivePairIndex(prev => (prev > 0 ? prev - 1 : pairsList.length - 1));
  };

  const handleSelectOption = (qId: string, optIdx: number) => {
    if (mode === 'exam' && isExamSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optIdx
    }));
  };

  // Reset current pair answers in practice mode
  const handleResetCurrentPair = () => {
    stopSpeaking();
    setIsPlayingAudio(false);
    setPlayingPairId(null);
    if (!currentPair) return;
    setUserAnswers(prev => {
      const next = { ...prev };
      delete next[currentPair.questions[0].id];
      delete next[currentPair.questions[1].id];
      return next;
    });
  };

  // Reset all answers in practice mode
  const handleResetAllPractice = () => {
    stopSpeaking();
    setIsPlayingAudio(false);
    setPlayingPairId(null);
    setUserAnswers({});
  };

  // Play audio simulation
  const handlePlayAudio = (pair: P4PairItem) => {
    if (isPlayingAudio && playingPairId === pair.id) {
      stopSpeaking();
      setIsPlayingAudio(false);
      setPlayingPairId(null);
      return;
    }

    stopSpeaking();
    setIsPlayingAudio(true);
    setPlayingPairId(pair.id);

    const speechText = pair.audioPrompt || `${pair.questions[0].question}. ${pair.questions[1].question}`;
    speakSingleSentence(speechText, 'man', 1.0, () => {
      setIsPlayingAudio(false);
      setPlayingPairId(null);
    });
  };

  // Total questions
  const totalQuestionsCount = useMemo(() => {
    return pairsList.reduce((acc, p) => acc + p.questions.length, 0);
  }, [pairsList]);

  // Exam Submit
  const handleExamSubmit = () => {
    stopSpeaking();
    setIsPlayingAudio(false);
    setPlayingPairId(null);

    let score = 0;
    pairsList.forEach(pair => {
      pair.questions.forEach(q => {
        if (userAnswers[q.id] === q.correct) {
          score++;
        }
      });
    });

    const percentage = Math.round((score / totalQuestionsCount) * 100);
    setScoreResult({ score, total: totalQuestionsCount, percentage });
    setIsExamSubmitted(true);

    if (percentage >= 70) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Helper to render text with highlighted key
  const renderHighlightedText = (fullText: string, keyToHighlight?: string) => {
    if (!highlightKey || !keyToHighlight || !fullText) {
      return <span>{fullText}</span>;
    }

    const lowerFull = fullText.toLowerCase();
    const lowerKey = keyToHighlight.toLowerCase().trim();
    const startIdx = lowerFull.indexOf(lowerKey);

    if (startIdx === -1) {
      return <span>{fullText}</span>;
    }

    const before = fullText.substring(0, startIdx);
    const match = fullText.substring(startIdx, startIdx + keyToHighlight.length);
    const after = fullText.substring(startIdx + keyToHighlight.length);

    return (
      <span>
        {before}
        <mark className="bg-amber-200 dark:bg-amber-500/30 text-amber-950 dark:text-amber-200 font-extrabold px-1 rounded shadow-sm">
          {match}
        </mark>
        {after}
      </span>
    );
  };

  // Active Pair in practice mode
  const currentPair = pairsList[activePairIndex] || pairsList[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Banner Navigation & Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold text-lg">
              🎧
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                  Listening • Part 4
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  {pairsList.length} cặp đề
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Phần này chỉ cần nhớ 2 đáp án đúng. Click vào mô tả để xem 2 đáp án đúng
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center space-x-2">
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex flex-wrap items-center gap-1 text-xs">
              <button
                onClick={() => handleModeChange('practice')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  mode === 'practice'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Chế độ Ôn tập
              </button>
              <button
                onClick={() => handleModeChange('exam')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  mode === 'exam'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Chế độ Thi Đảo
              </button>
              <button
                onClick={() => handleModeChange('quiz60')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 ${
                  mode === 'quiz60'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Trắc nghiệm 60 câu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar: Highlight Key, Shuffle, Vietnamese, Timer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Highlight Key Toggle Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleHighlightKey}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition border ${
                highlightKey
                  ? 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span>{highlightKey ? 'Đang tô đậm Key nhớ' : 'Tắt tô đậm Key'}</span>
            </button>

            {/* Shuffle toggle */}
            <button
              onClick={handleShuffleToggle}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold transition border ${
                isShuffled
                  ? 'bg-indigo-100 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{isShuffled ? 'Đã đảo đề' : 'Đảo thứ tự đề'}</span>
            </button>

            {/* Vietnamese translation toggle */}
            <button
              onClick={() => setShowVietnamese(!showVietnamese)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
            >
              <span>{showVietnamese ? 'Dịch: BẬT' : 'Dịch: TẮT'}</span>
            </button>

            {/* Reset buttons */}
            {(mode === 'practice' || mode === 'quiz60') && (
              <>
                {mode === 'practice' && (
                  <button
                    onClick={handleResetCurrentPair}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition"
                    title="Làm lại câu này (xóa lựa chọn để chọn lại)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm lại câu này</span>
                  </button>
                )}

                {Object.keys(userAnswers).length > 0 && (
                  <button
                    onClick={handleResetAllPractice}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition"
                    title="Xóa toàn bộ câu đã chọn để làm lại từ đầu"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm lại tất cả</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Right Status */}
          <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
            {(mode === 'exam' || mode === 'quiz60') && (
              <span className="flex items-center space-x-1 font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(secondsElapsed)}</span>
              </span>
            )}
            <span>
              {mode === 'practice'
                ? `Cặp ${activePairIndex + 1} / ${pairsList.length}`
                : mode === 'quiz60'
                ? `Đã làm ${Object.keys(userAnswers).length} / ${flattenedQuestions.length} câu`
                : `Tổng: ${pairsList.length} cặp (60 câu)`}
            </span>
          </div>

        </div>
      </div>

      {/* Score Summary if Exam or Quiz60 submitted */}
      {(mode === 'exam' || mode === 'quiz60') && isExamSubmitted && scoreResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-300 dark:border-emerald-700/50 shadow-md space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Kết Quả Thi: {scoreResult.score} / {scoreResult.total} câu ({scoreResult.percentage}%)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {scoreResult.percentage >= 80
                    ? 'Xuất sắc! Bạn đã ghi nhớ chính xác các cặp key của đề thi.'
                    : 'Hãy bật chế độ Ôn tập và Tô đậm Key nhớ để rèn luyện thêm nhé!'}
                </p>
              </div>
            </div>

            <button
              onClick={startNewExam}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thi Lại Đề Đảo Mới</span>
            </button>
          </div>
        </div>
      )}

      {/* PRACTICE MODE: Single Pair View with Previous/Next and Quick Tip Modal */}
      {mode === 'practice' && currentPair && (
        <div className="space-y-6">
          
          {/* Top Navigation & Quick Switch Bar */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handlePrevPair}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition shrink-0"
                title="Quay lại câu/cặp trước (vòng lặp)"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRandomJump}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-100 dark:hover:bg-purple-900/60 transition shadow-sm"
                  title="Nhảy ngẫu nhiên sang một cặp câu khác"
                >
                  <Dices className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                  <span>Ngẫu nhiên</span>
                </button>

                <button
                  onClick={handleNextPair}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm shrink-0"
                  title="Chuyển tiếp sang cặp câu tiếp theo"
                >
                  <span>Chuyển tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick pair numbers scroll */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 pb-1 px-1 no-scrollbar border-t border-slate-100 dark:border-slate-800/80">
              {pairsList.map((p, idx) => {
                const q1Answered = userAnswers[p.questions[0].id] !== undefined;
                const q2Answered = userAnswers[p.questions[1].id] !== undefined;
                const bothCorrect = q1Answered && q2Answered &&
                  userAnswers[p.questions[0].id] === p.questions[0].correct &&
                  userAnswers[p.questions[1].id] === p.questions[1].correct;

                const isActive = idx === activePairIndex;

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      stopSpeaking();
                      setActivePairIndex(idx);
                    }}
                    className={`w-7 h-7 rounded-lg font-bold text-[11px] shrink-0 transition flex items-center justify-center ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400 ring-offset-1 dark:ring-offset-slate-900'
                        : bothCorrect
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Render Active Pair Card */}
          <PairCard
            pair={currentPair}
            pairDisplayIndex={activePairIndex + 1}
            userAnswers={userAnswers}
            onSelectOption={handleSelectOption}
            isPlayingAudio={isPlayingAudio && playingPairId === currentPair.id}
            onPlayAudio={() => handlePlayAudio(currentPair)}
            showVietnamese={showVietnamese}
            mode="practice"
            renderHighlightedText={renderHighlightedText}
            onResetPair={handleResetCurrentPair}
          />

          {/* Bottom Navigation & Quick Switch Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <button
              onClick={handlePrevPair}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Cặp trước (Câu {activePairIndex === 0 ? pairsList.length : activePairIndex})</span>
            </button>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={handleResetCurrentPair}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 font-semibold transition"
                title="Xóa lựa chọn và làm lại câu này"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại</span>
              </button>

              <button
                onClick={handleRandomJump}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-100 dark:hover:bg-purple-900/60 transition shadow-sm"
              >
                <Dices className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Ngẫu nhiên</span>
              </button>

              <button
                onClick={handleNextPair}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-600/20"
              >
                <span>Chuyển tiếp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* QUIZ 60 MODE: Sequential 60 Multiple-Choice Questions (1 to 60) */}
      {mode === 'quiz60' && (
        <div className="space-y-6">
          
          {/* Quick jump grid for 60 questions */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Bảng theo dõi 60 câu trắc nghiệm:
                </span>
                <span className="text-slate-400">
                  (Click số để cuộn nhanh đến câu hỏi)
                </span>
              </div>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Đã chọn ({Object.keys(userAnswers).length})</span>
                </span>
                <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block"></span>
                  <span>Chưa làm ({flattenedQuestions.length - Object.keys(userAnswers).length})</span>
                </span>
              </div>
            </div>

            {/* 60 question buttons */}
            <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-15 gap-1.5 pt-1">
              {flattenedQuestions.map((item) => {
                const isAnswered = userAnswers[item.question.id] !== undefined;
                const isCorrect = isAnswered && userAnswers[item.question.id] === item.question.correct;

                let btnStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200';
                if (isExamSubmitted) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500 text-white font-bold shadow-sm';
                  } else if (isAnswered) {
                    btnStyle = 'bg-rose-500 text-white font-bold shadow-sm';
                  } else {
                    btnStyle = 'bg-slate-200 dark:bg-slate-800 text-slate-400';
                  }
                } else if (isAnswered) {
                  btnStyle = 'bg-indigo-600 text-white font-bold shadow-sm';
                }

                return (
                  <button
                    key={item.question.id}
                    onClick={() => {
                      const el = document.getElementById(`q60-card-${item.globalIndex}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className={`h-8 rounded-lg text-xs font-semibold transition flex items-center justify-center ${btnStyle}`}
                    title={`Câu ${item.globalIndex} (Cặp ${item.pairIndex})`}
                  >
                    {item.globalIndex}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of 60 individual question cards */}
          <div className="space-y-6">
            {flattenedQuestions.map((item) => {
              const q = item.question;
              const selectedOpt = userAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === q.correct;
              const isPairPlaying = isPlayingAudio && playingPairId === item.pairId;

              const matchedPair = pairsList.find(p => p.id === item.pairId);

              return (
                <div
                  key={q.id}
                  id={`q60-card-${item.globalIndex}`}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 scroll-mt-24 transition-all"
                >
                  {/* Card Header: Global Question Index, Pair Reference, Audio */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-black text-xs shrink-0">
                        #{item.globalIndex}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Câu hỏi {item.globalIndex} / 60
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            Cặp {item.pairIndex}
                          </span>
                        </div>
                        {item.instruction && (
                          <p className="text-[11px] text-slate-400">
                            {item.instruction}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Audio & Reset single button */}
                    <div className="flex items-center space-x-2">
                      {isAnswered && (
                        <button
                          onClick={() => {
                            setUserAnswers(prev => {
                              const next = { ...prev };
                              delete next[q.id];
                              return next;
                            });
                          }}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 text-xs font-medium transition"
                          title="Làm lại câu này"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Làm lại</span>
                        </button>
                      )}

                      {matchedPair && (
                        <button
                          onClick={() => handlePlayAudio(matchedPair)}
                          className={`p-2 rounded-xl font-bold transition flex items-center justify-center shrink-0 text-xs ${
                            isPairPlaying
                              ? 'bg-rose-500 text-white shadow animate-pulse'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                          }`}
                          title="Nghe audio"
                        >
                          {isPairPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Audio Prompt if exists */}
                  {item.audioPrompt && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {item.audioPrompt}
                    </p>
                  )}

                  {/* Question Prompt */}
                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {q.question}
                    </h4>
                    {showVietnamese && q.questionVi && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {q.questionVi}
                      </p>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      const isCorrectOption = q.correct === optIdx;

                      let borderStyle = 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-950';
                      if (isExamSubmitted) {
                        if (isCorrectOption) {
                          borderStyle = 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500';
                        } else if (isSelected && !isCorrectOption) {
                          borderStyle = 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200';
                        }
                      } else if (isSelected) {
                        borderStyle = 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-100 font-semibold';
                      }

                      return (
                        <label
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`flex items-start space-x-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${borderStyle}`}
                        >
                          <input
                            type="radio"
                            name={`q60-${q.id}`}
                            checked={isSelected}
                            onChange={() => handleSelectOption(q.id, optIdx)}
                            className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <div className="text-xs sm:text-sm space-y-0.5 flex-1">
                            <div className="text-slate-800 dark:text-slate-200 font-medium">
                              {isCorrectOption
                                ? renderHighlightedText(opt, q.keyHighlight)
                                : <span>{opt}</span>}
                            </div>
                            {showVietnamese && q.optionsVi && q.optionsVi[optIdx] && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {isCorrectOption
                                  ? renderHighlightedText(q.optionsVi[optIdx], q.keyHighlightVi)
                                  : <span>{q.optionsVi[optIdx]}</span>}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Feedback after submit or tip */}
                  {isExamSubmitted && (
                    <div className="pt-2">
                      <div className="text-xs font-semibold mb-2">
                        {isCorrect ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Chính xác</span>
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>
                              Chưa đúng. Đáp án: <b className="underline text-emerald-600 dark:text-emerald-400">{q.options[q.correct]}</b>
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Explanation box */}
                      {(item.explanationVi || item.tipMnemonic) && (
                        <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                          {item.explanationVi && (
                            <div className="whitespace-pre-line leading-relaxed">
                              <b>Giải thích / Dịch:</b> {item.explanationVi}
                            </div>
                          )}
                          {item.tipMnemonic && (
                            <div className="text-amber-700 dark:text-amber-300 font-semibold">
                              💡 <b>Mẹo nhớ:</b> {item.tipMnemonic}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Submit button for Quiz60 */}
          {!isExamSubmitted && (
            <div className="sticky bottom-6 z-20 pt-4">
              <button
                onClick={handleExamSubmit}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black shadow-xl shadow-indigo-600/30 transition transform active:scale-98 flex items-center justify-center space-x-2 text-base"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Nộp Bài Trắc Nghiệm 60 Câu ({Object.keys(userAnswers).length} / {flattenedQuestions.length} câu đã làm)</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

// Sub-component: Individual Pair Card (2 questions per pair, exactly like user screenshots)
interface PairCardProps {
  pair: P4PairItem;
  pairDisplayIndex: number;
  userAnswers: Record<string, number>;
  onSelectOption: (qId: string, optIdx: number) => void;
  isPlayingAudio: boolean;
  onPlayAudio: () => void;
  showVietnamese: boolean;
  mode: 'practice' | 'exam';
  isExamSubmitted?: boolean;
  renderHighlightedText: (fullText: string, key?: string) => React.ReactNode;
  onResetPair?: () => void;
}

const PairCard: React.FC<PairCardProps> = ({
  pair,
  pairDisplayIndex,
  userAnswers,
  onSelectOption,
  isPlayingAudio,
  onPlayAudio,
  showVietnamese,
  mode,
  isExamSubmitted = false,
  renderHighlightedText,
  onResetPair
}) => {
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const q1 = pair.questions[0];
  const q2 = pair.questions[1];

  const q1Ans = userAnswers[q1.id];
  const q2Ans = userAnswers[q2.id];

  const isQ1Answered = q1Ans !== undefined;
  const isQ2Answered = q2Ans !== undefined;

  const isQ1Correct = q1Ans === q1.correct;
  const isQ2Correct = q2Ans === q2.correct;

  // In practice mode: show instant validation once user selects option
  // In exam mode: only show validation after exam is submitted
  const showFeedbackQ1 = mode === 'practice' ? isQ1Answered : isExamSubmitted;
  const showFeedbackQ2 = mode === 'practice' ? isQ2Answered : isExamSubmitted;

  const bothCorrect = isQ1Correct && isQ2Correct;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
      
      {/* Audio Prompt & Instruction Header */}
      <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onPlayAudio}
              className={`p-2.5 rounded-xl font-bold transition flex items-center justify-center shrink-0 ${
                isPlayingAudio
                  ? 'bg-rose-500 text-white shadow-md animate-pulse'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              }`}
              title="Phát âm bài nói"
            >
              {isPlayingAudio ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Listening • Part 4
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded font-mono font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Câu {pairDisplayIndex}/30
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-400">
                {pair.instruction || 'Phần này chỉ cần nhớ 2 đáp án đúng. Click vào mô tả để xem 2 đáp án đúng'}
              </p>
            </div>
          </div>

          {/* Right actions: Reset pair & Quick tip mnemonic button */}
          <div className="flex items-center space-x-2 shrink-0">
            {mode === 'practice' && onResetPair && (isQ1Answered || isQ2Answered) && (
              <button
                onClick={onResetPair}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition"
                title="Xóa lựa chọn và làm lại câu này"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại</span>
              </button>
            )}

            {pair.tipMnemonic && (
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                {showExplanation ? 'Ẩn mẹo nhớ' : '💡 Xem mẹo nhớ 2 key'}
              </button>
            )}
          </div>
        </div>

        {/* Audio Prompt text if present */}
        {pair.audioPrompt && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            {pair.audioPrompt}
          </p>
        )}
      </div>

      {/* QUESTION 1 */}
      <div className="space-y-3 relative pl-3 border-l-2 border-blue-500">
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {q1.question}
          </h3>
          {showVietnamese && q1.questionVi && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {q1.questionVi}
            </p>
          )}
        </div>

        {/* Options for Q1 */}
        <div className="space-y-2.5">
          {q1.options.map((opt, optIdx) => {
            const isSelected = q1Ans === optIdx;
            const isCorrectOption = q1.correct === optIdx;

            let borderStyle = 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-950';
            if (showFeedbackQ1) {
              if (isCorrectOption) {
                borderStyle = 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500';
              } else if (isSelected && !isCorrectOption) {
                borderStyle = 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200';
              }
            } else if (isSelected) {
              borderStyle = 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 font-semibold';
            }

            return (
              <label
                key={optIdx}
                onClick={() => onSelectOption(q1.id, optIdx)}
                className={`flex items-start space-x-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${borderStyle}`}
              >
                <input
                  type="radio"
                  name={`p4-q-${q1.id}`}
                  checked={isSelected}
                  onChange={() => onSelectOption(q1.id, optIdx)}
                  className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="text-xs sm:text-sm space-y-0.5 flex-1">
                  <div className="text-slate-800 dark:text-slate-200 font-medium">
                    {isCorrectOption
                      ? renderHighlightedText(opt, q1.keyHighlight)
                      : <span>{opt}</span>}
                  </div>
                  {showVietnamese && q1.optionsVi && q1.optionsVi[optIdx] && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isCorrectOption
                        ? renderHighlightedText(q1.optionsVi[optIdx], q1.keyHighlightVi)
                        : <span>{q1.optionsVi[optIdx]}</span>}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        {/* Q1 Feedback message */}
        {showFeedbackQ1 && (
          <div className="text-xs font-semibold pt-1">
            {isQ1Correct ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Correct</span>
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>
                  Incorrect. Answer: <b className="underline text-emerald-600 dark:text-emerald-400">{q1.options[q1.correct]}</b>
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* QUESTION 2 */}
      <div className="space-y-3 relative pl-3 border-l-2 border-blue-500 pt-2">
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {q2.question}
          </h3>
          {showVietnamese && q2.questionVi && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {q2.questionVi}
            </p>
          )}
        </div>

        {/* Options for Q2 */}
        <div className="space-y-2.5">
          {q2.options.map((opt, optIdx) => {
            const isSelected = q2Ans === optIdx;
            const isCorrectOption = q2.correct === optIdx;

            let borderStyle = 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-950';
            if (showFeedbackQ2) {
              if (isCorrectOption) {
                borderStyle = 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500';
              } else if (isSelected && !isCorrectOption) {
                borderStyle = 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200';
              }
            } else if (isSelected) {
              borderStyle = 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 font-semibold';
            }

            return (
              <label
                key={optIdx}
                onClick={() => onSelectOption(q2.id, optIdx)}
                className={`flex items-start space-x-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${borderStyle}`}
              >
                <input
                  type="radio"
                  name={`p4-q-${q2.id}`}
                  checked={isSelected}
                  onChange={() => onSelectOption(q2.id, optIdx)}
                  className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="text-xs sm:text-sm space-y-0.5 flex-1">
                  <div className="text-slate-800 dark:text-slate-200 font-medium">
                    {isCorrectOption
                      ? renderHighlightedText(opt, q2.keyHighlight)
                      : <span>{opt}</span>}
                  </div>
                  {showVietnamese && q2.optionsVi && q2.optionsVi[optIdx] && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isCorrectOption
                        ? renderHighlightedText(q2.optionsVi[optIdx], q2.keyHighlightVi)
                        : <span>{q2.optionsVi[optIdx]}</span>}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        {/* Q2 Feedback message */}
        {showFeedbackQ2 && (
          <div className="text-xs font-semibold pt-1">
            {isQ2Correct ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Correct</span>
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>
                  Incorrect. Answer: <b className="underline text-emerald-600 dark:text-emerald-400">{q2.options[q2.correct]}</b>
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* PAIR SUMMARY & EXPLANATION BOX (Exact layout as screenshot) */}
      {((showFeedbackQ1 && showFeedbackQ2) || showExplanation) && (
        <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
          bothCorrect
            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
            : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center space-x-2">
            {bothCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <h4 className={`text-sm font-bold ${bothCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {bothCorrect ? 'Chính xác, làm tốt lắm!' : 'Chưa đúng hết – xem lại các ý đánh dấu đỏ ở trên.'}
            </h4>
          </div>

          {/* Transcript / Dịch box */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm space-y-2 text-slate-700 dark:text-slate-300">
            <h5 className="font-bold text-slate-900 dark:text-white">
              Giải thích / Transcript
            </h5>
            <div className="whitespace-pre-line leading-relaxed">
              {pair.explanationVi || `Đáp án:\n1. ${q1.options[q1.correct]}\n2. ${q2.options[q2.correct]}`}
            </div>
            {pair.tipMnemonic && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-amber-700 dark:text-amber-300 font-semibold">
                💡 <b>Mẹo:</b> {pair.tipMnemonic}
              </div>
            )}

            {mode === 'practice' && onResetPair && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={onResetPair}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Làm lại câu này</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

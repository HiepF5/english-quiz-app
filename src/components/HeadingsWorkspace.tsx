import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Trophy,
  ChevronRight,
  Check,
  Flame,
  LayoutList,
  SlidersHorizontal,
  KeyRound
} from 'lucide-react';
import type { HeadingsScoreRecord } from '../types/headings';
import { HEADINGS_TOPICS } from '../data/headingsTopics';

// Helper to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const HeadingsWorkspace: React.FC = () => {
  const [activeTopicId, setActiveTopicId] = useState<string>(HEADINGS_TOPICS[0].id);
  const activeTopic = HEADINGS_TOPICS.find(t => t.id === activeTopicId) || HEADINGS_TOPICS[0];

  // Display toggles
  const [showVietnamese, setShowVietnamese] = useState<boolean>(false);
  const [showMnemonic, setShowMnemonic] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<'cards' | 'dropdown'>('cards');

  // User selections: paragraphId -> selectedHeading
  const [userSelections, setUserSelections] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; total: number; percentage: number } | null>(null);

  // Shuffle seed / trigger
  const [shuffleKey, setShuffleKey] = useState<number>(0);

  // History scores
  const [historyScores, setHistoryScores] = useState<Record<string, HeadingsScoreRecord>>(() => {
    try {
      const saved = localStorage.getItem('headings_scores_history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Reset when topic changes
  useEffect(() => {
    setUserSelections({});
    setIsSubmitted(false);
    setScoreResult(null);
  }, [activeTopicId, shuffleKey]);

  // Shuffled options per paragraph (generated on topic change or reshuffle)
  const shuffledOptionsPerParagraph = useMemo(() => {
    const map: Record<string, string[]> = {};
    activeTopic.paragraphs.forEach(p => {
      // Pick all headings for this topic and shuffle them
      map[p.id] = shuffleArray(activeTopic.allHeadings);
    });
    return map;
  }, [activeTopic, shuffleKey]);

  const handleSelectHeading = (paragraphId: string, heading: string) => {
    if (isSubmitted) return;
    setUserSelections(prev => ({
      ...prev,
      [paragraphId]: heading
    }));
  };

  const handleReshuffleAndReset = () => {
    setUserSelections({});
    setIsSubmitted(false);
    setScoreResult(null);
    setShuffleKey(prev => prev + 1);
  };

  const handleCheckAnswers = () => {
    let correctCount = 0;
    activeTopic.paragraphs.forEach(p => {
      if (userSelections[p.id] === p.correctHeading) {
        correctCount++;
      }
    });

    const total = activeTopic.paragraphs.length;
    const percentage = Math.round((correctCount / total) * 100);
    const isPerfect = correctCount === total;

    setScoreResult({ score: correctCount, total, percentage });
    setIsSubmitted(true);

    if (isPerfect) {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 }
      });
    }

    const updatedHistory: Record<string, HeadingsScoreRecord> = {
      ...historyScores,
      [activeTopic.id]: {
        topicId: activeTopic.id,
        topicTitle: activeTopic.title,
        lastScore: correctCount,
        maxScore: Math.max(historyScores[activeTopic.id]?.maxScore || 0, correctCount),
        totalQuestions: total,
        percentage,
        completedAt: new Date().toISOString(),
        isPerfect: isPerfect || !!historyScores[activeTopic.id]?.isPerfect
      }
    };

    setHistoryScores(updatedHistory);
    localStorage.setItem('headings_scores_history', JSON.stringify(updatedHistory));
  };

  const handleNextTopic = () => {
    const currentIndex = HEADINGS_TOPICS.findIndex(t => t.id === activeTopicId);
    if (currentIndex >= 0 && currentIndex < HEADINGS_TOPICS.length - 1) {
      setActiveTopicId(HEADINGS_TOPICS[currentIndex + 1].id);
    } else {
      setActiveTopicId(HEADINGS_TOPICS[0].id);
    }
  };

  const totalPerfectCount = Object.values(historyScores).filter(h => h.isPerfect).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold tracking-wide">
              <LayoutList className="w-4 h-4 text-emerald-400" />
              <span>Aptis ESOL Reading Part 3 • Nối Tiêu Đề & Tóm Tắt Đoạn Văn (1-Word Keywords)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Trắc Nghiệm Chọn Tiêu Đề Đoạn Văn</span>
              <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                3 Bài Thi Thực Tế
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Mỗi đoạn văn mang một ý chính được tóm tắt thành <strong>1 từ khóa cốt lõi</strong>.
              Nhiệm vụ của bạn là chọn tiêu đề phù hợp nhất cho từng đoạn văn. Dùng mẹo nhớ vần câu để đạt điểm tuyệt đối!
            </p>

            {/* Quick Stat Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>
                  Đạt điểm 100%: <strong className="text-white font-bold">{totalPerfectCount}</strong> / {HEADINGS_TOPICS.length} bài
                </span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Tùy chọn trắc nghiệm từng câu hoặc nối đoạn văn tổng thể</span>
              </div>
            </div>
          </div>

          {/* Quick Action Toggle Mode */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800">
              <button
                onClick={() => setDisplayMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  displayMode === 'cards'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Thẻ Trắc Nghiệm</span>
              </button>
              <button
                onClick={() => setDisplayMode('dropdown')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  displayMode === 'dropdown'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Menu Nối Đề Thi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Selector Tabs (3 Topics) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {HEADINGS_TOPICS.map((topic, idx) => {
          const isActive = topic.id === activeTopicId;
          const hist = historyScores[topic.id];

          return (
            <div
              key={topic.id}
              onClick={() => setActiveTopicId(topic.id)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all text-left relative ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                  : 'bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {topic.title}
                  </h3>
                </div>

                {hist?.isPerfect && (
                  <span title="Đạt 100%!" className="text-amber-400 text-sm">
                    ⭐
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 pl-8">
                {topic.titleVi}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pl-8">
                <span>{topic.paragraphs.length} đoạn văn</span>
                {hist ? (
                  <span className={hist.isPerfect ? 'text-emerald-500 font-bold' : 'text-amber-500'}>
                    Điểm: {hist.lastScore}/{hist.totalQuestions} ({hist.percentage}%)
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-600">Chưa làm</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Workspace for Active Topic */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-6">
        
        {/* Header & Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {activeTopic.category}
              </span>
              <span className="text-xs text-slate-400">
                • {activeTopic.paragraphs.length} đoạn văn cần nối tiêu đề
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {activeTopic.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeTopic.titleVi}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleReshuffleAndReset}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition border border-slate-300 dark:border-slate-700"
              title="Xáo trộn lại vị trí các lựa chọn và làm lại"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
              <span>Đảo Lựa Chọn & Làm Lại</span>
            </button>

            <button
              onClick={() => setShowVietnamese(prev => !prev)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                showVietnamese
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {showVietnamese ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-purple-400" />}
              <span>{showVietnamese ? 'Ẩn Dịch TV' : 'Hiện Dịch TV'}</span>
            </button>

            <button
              onClick={() => setShowMnemonic(prev => !prev)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                showMnemonic
                  ? 'bg-amber-500 text-white border-amber-400 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{showMnemonic ? 'Ẩn Mẹo 1 Từ' : 'Hiện Mẹo 1 Từ'}</span>
            </button>
          </div>
        </div>

        {/* Mnemonic Formula Box */}
        {showMnemonic && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1.5 animate-fadeIn">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Mẹo Nhớ Từ Khóa Cốt Lõi (Aptis Mnemonic Formula):</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold tracking-wide font-mono bg-white/60 dark:bg-slate-950/60 p-2.5 rounded-xl border border-amber-500/20">
              {activeTopic.mnemonicFormula}
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 italic">
              *Mỗi từ trong câu vần tương ứng với từ khóa 1 từ tóm tắt nội dung của đoạn văn thứ 1 đến {activeTopic.paragraphs.length}.
            </p>
          </div>
        )}

        {/* Result Summary Bar if submitted */}
        {isSubmitted && scoreResult && (
          <div className={`p-5 rounded-2xl border shadow-lg animate-fadeIn flex flex-col md:flex-row items-center justify-between gap-4 ${
            scoreResult.percentage === 100
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : scoreResult.percentage >= 60
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                scoreResult.percentage === 100
                  ? 'bg-emerald-500 text-slate-950'
                  : scoreResult.percentage >= 60
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-rose-500 text-white'
              }`}>
                {scoreResult.percentage === 100 ? <Check className="w-6 h-6 stroke-[3]" /> : `${scoreResult.percentage}%`}
              </div>

              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {scoreResult.percentage === 100
                    ? 'Xuất sắc! Bạn đã chọn chính xác 100% tiêu đề!'
                    : scoreResult.percentage >= 60
                    ? 'Khá tốt! Nhưng còn một vài đoạn chưa khớp.'
                    : 'Chưa chính xác! Hãy đọc kỹ và dùng mẹo từ khóa 1 từ.'}
                </h3>
                <p className="text-xs opacity-90 mt-0.5">
                  Đúng {scoreResult.score} / {scoreResult.total} đoạn văn ({scoreResult.percentage}%).
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleReshuffleAndReset}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đảo Đề & Thử Lại</span>
              </button>
              <button
                onClick={handleNextTopic}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md"
              >
                <span>Chủ Đề Tiếp Theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Paragraphs Stream */}
        <div className="space-y-6">
          {activeTopic.paragraphs.map((para) => {
            const userPick = userSelections[para.id];
            const isCorrect = isSubmitted && userPick === para.correctHeading;
            const isWrong = isSubmitted && userPick !== para.correctHeading;
            const options = shuffledOptionsPerParagraph[para.id] || activeTopic.allHeadings;

            return (
              <div
                key={para.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  isCorrect
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500/60 shadow-sm'
                    : isWrong
                    ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-500/60 shadow-sm'
                    : 'bg-slate-50/60 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Paragraph Header Info */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {para.paragraphIndex}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Đoạn Văn Số {para.paragraphIndex}
                    </span>

                    {showMnemonic && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <KeyRound className="w-3 h-3" />
                        Mẹo: <strong>{para.mnemonicHint}</strong>
                      </span>
                    )}
                  </div>

                  {/* Submission Status Badge */}
                  <div>
                    {isCorrect && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Chính xác
                      </span>
                    )}
                    {isWrong && (
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Sai (Đáp án: {para.correctHeading})
                      </span>
                    )}
                  </div>
                </div>

                {/* Paragraph Text Content (English) */}
                <div className="space-y-2">
                  <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                    {para.contentEn}
                  </p>

                  {/* Vietnamese Translation (Toggleable) */}
                  {(showVietnamese || isSubmitted) && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 italic bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 leading-relaxed">
                      🇻🇳 {para.contentVi}
                    </p>
                  )}
                </div>

                {/* Selection Interface based on Display Mode */}
                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                    <span>Chọn tiêu đề tóm tắt đúng nhất cho đoạn {para.paragraphIndex}:</span>
                  </div>

                  {displayMode === 'dropdown' ? (
                    /* Dropdown Select Mode */
                    <div className="space-y-2">
                      <select
                        disabled={isSubmitted}
                        value={userPick || ''}
                        onChange={(e) => handleSelectHeading(para.id, e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 border transition ${
                          isCorrect
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                            : isWrong
                            ? 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30'
                            : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-emerald-500'
                        }`}
                      >
                        <option value="">-- Chọn tiêu đề tóm tắt --</option>
                        {options.map((heading) => (
                          <option key={heading} value={heading}>
                            {heading}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    /* Multiple Choice Cards Mode */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {options.map((heading, optIdx) => {
                        const isChosen = userPick === heading;
                        const isThisCorrect = isSubmitted && heading === para.correctHeading;
                        const isThisWrongPick = isSubmitted && isChosen && heading !== para.correctHeading;

                        return (
                          <button
                            key={heading}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => handleSelectHeading(para.id, heading)}
                            className={`p-3 rounded-xl border text-left text-xs font-semibold transition flex items-start space-x-2.5 ${
                              isThisCorrect
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500/50'
                                : isThisWrongPick
                                ? 'bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-200 ring-1 ring-rose-500/50'
                                : isChosen
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/50'
                                : 'bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                              isThisCorrect
                                ? 'bg-emerald-600 text-white'
                                : isThisWrongPick
                                ? 'bg-rose-600 text-white'
                                : isChosen
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1 leading-snug">{heading}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation card after submit */}
                  {isSubmitted && para.explanation && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold block">
                        💡 Giải thích & Từ khóa 1 từ:
                      </strong>
                      <span>{para.explanation}</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Submission Action Bar */}
        <div className="sticky bottom-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>
              Đã chọn: <strong>{Object.keys(userSelections).length}</strong> / {activeTopic.paragraphs.length} đoạn văn.
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {isSubmitted ? (
              <>
                <button
                  onClick={handleReshuffleAndReset}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Làm Lại Bài Này</span>
                </button>

                <button
                  onClick={handleNextTopic}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30"
                >
                  <span>Chủ Đề Kế Tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleCheckAnswers}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Kiểm Tra Kết Quả (Nộp Bài)</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

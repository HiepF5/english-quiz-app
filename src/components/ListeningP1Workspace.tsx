import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Brain,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2,
  Languages,
  Bookmark,
  Shuffle,
  Clock,
  Trophy,
  Filter,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Eye,
  EyeOff,
  ChevronUp
} from 'lucide-react';
import type { ListeningP1Question, ListeningP1Mode, ListeningP1ScoreRecord } from '../types/listeningP1';
import p1Data from '../data/aptis_listening_part1.json';
import { speakSingleSentence, stopSpeaking } from '../utils/speech';

export const ListeningP1Workspace: React.FC = () => {
  const allQuestions: ListeningP1Question[] = (p1Data as any).questions || [];

  // Active Set filter: 'all' | 1 | 2 | 3
  const [activeSet, setActiveSet] = useState<'all' | number>(() => {
    try {
      const saved = localStorage.getItem('aptis_listening_p1_active_set');
      if (saved === 'all') return 'all';
      if (saved === '1' || saved === '2' || saved === '3') return parseInt(saved);
    } catch {}
    return 'all';
  });

  const originalQuestions = useMemo(() => {
    if (activeSet === 'all') return allQuestions;
    return allQuestions.filter(q => q.setIndex === activeSet);
  }, [allQuestions, activeSet]);

  // Active Mode: 'practice' (Chế độ 1: Luyện tập, instant feedback, quick translation)
  // or 'exam' (Chế độ 2: Thi thử, shuffle, submit then show translations)
  const [mode, setMode] = useState<ListeningP1Mode>(() => {
    try {
      const saved = localStorage.getItem('aptis_listening_p1_mode');
      if (saved === 'practice' || saved === 'exam') return saved;
    } catch {}
    return 'practice';
  });

  // Questions array (can be shuffled in exam mode)
  const [questions, setQuestions] = useState<ListeningP1Question[]>(() => originalQuestions);

  // When activeSet or originalQuestions change, update questions
  useEffect(() => {
    try {
      localStorage.setItem('aptis_listening_p1_active_set', String(activeSet));
    } catch {}
    setUserAnswers({});
    setIsExamSubmitted(false);
    setSecondsElapsed(0);
    stopSpeaking();
    setSpeakingQId(null);
    if (mode === 'exam') {
      const copy = [...originalQuestions];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      setQuestions(copy);
    } else {
      setQuestions(originalQuestions);
    }
  }, [activeSet, originalQuestions, mode]);

  // User answers map: question ID -> selected option index (0, 1, 2)
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});

  // Exam submitted state
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Quick translation mode toggle in Practice mode (Show Vietnamese underneath or by toggle)
  const [quickTranslateAll, setQuickTranslateAll] = useState<boolean>(true);

  // Individual question quick-translation visibility map in Practice mode (for peeking)
  const [revealedTranslations, setRevealedTranslations] = useState<Record<string, boolean>>({});

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('aptis_listening_p1_bookmarks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Filter for practice mode
  const [filterType, setFilterType] = useState<'all' | 'unanswered' | 'answered' | 'incorrect' | 'bookmarked'>('all');

  // Custom confirmation modals
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  // Exam timer
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // Audio speech playing state
  const [speakingQId, setSpeakingQId] = useState<string | null>(null);

  // History scores
  const [history, setHistory] = useState<ListeningP1ScoreRecord[]>(() => {
    try {
      const saved = localStorage.getItem('aptis_listening_p1_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Ref to container for scrolling
  const topRef = useRef<HTMLDivElement>(null);

  // Save mode preference
  const handleModeChange = (newMode: ListeningP1Mode) => {
    stopSpeaking();
    setSpeakingQId(null);
    setMode(newMode);
    try {
      localStorage.setItem('aptis_listening_p1_mode', newMode);
    } catch {}

    if (newMode === 'exam') {
      startNewExam();
    } else {
      // In practice mode, restore original order
      setQuestions(originalQuestions);
      setIsExamSubmitted(false);
    }
  };

  // Helper to shuffle questions
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Start new exam: shuffle questions, reset answers & timer
  const startNewExam = () => {
    stopSpeaking();
    setSpeakingQId(null);
    const shuffled = shuffleArray(originalQuestions);
    setQuestions(shuffled);
    setUserAnswers({});
    setIsExamSubmitted(false);
    setSecondsElapsed(0);
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Timer interval for exam
  useEffect(() => {
    let timer: any = null;
    if (mode === 'exam' && !isExamSubmitted) {
      timer = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [mode, isExamSubmitted]);

  // Clean up speech synthesis
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Format seconds mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle option click
  const handleSelectOption = (qId: string, optionIdx: number) => {
    if (mode === 'exam' && isExamSubmitted) return;

    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));

    // In practice mode, auto-reveal translation for this question when answered
    if (mode === 'practice') {
      setRevealedTranslations(prev => ({
        ...prev,
        [qId]: true
      }));
    }
  };

  // Toggle bookmark
  const toggleBookmark = (qId: string) => {
    setBookmarks(prev => {
      const next = { ...prev, [qId]: !prev[qId] };
      try {
        localStorage.setItem('aptis_listening_p1_bookmarks', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Toggle individual question translation peek
  const toggleRevealTranslation = (qId: string) => {
    setRevealedTranslations(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Reset practice progress
  const handleResetPractice = () => {
    setShowResetConfirmModal(true);
  };

  const confirmResetPractice = () => {
    setUserAnswers({});
    setRevealedTranslations({});
    setShowResetConfirmModal(false);
  };

  // Submit Exam handler
  const handleSubmitExam = () => {
    const answeredCount = Object.keys(userAnswers).length;
    const totalCount = questions.length;

    if (answeredCount < totalCount) {
      setShowConfirmModal(true);
      return;
    }

    executeSubmitExam();
  };

  const executeSubmitExam = () => {
    setShowConfirmModal(false);
    setIsExamSubmitted(true);
    stopSpeaking();

    // Calculate score
    const totalCount = questions.length;
    let score = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correct) {
        score++;
      }
    });

    const percentage = Math.round((score / totalCount) * 100);

    // Confetti if good score
    if (percentage >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Save history
    const record: ListeningP1ScoreRecord = {
      lastCompletedAt: new Date().toISOString(),
      score,
      total: totalCount,
      percentage,
      timeTakenSeconds: secondsElapsed,
      mode: 'exam'
    };

    setHistory(prev => {
      const updated = [record, ...prev].slice(0, 20);
      try {
        localStorage.setItem('aptis_listening_p1_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Scroll to top
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate stats
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = useMemo(() => {
    return questions.filter(q => userAnswers[q.id] === q.correct).length;
  }, [questions, userAnswers]);
  const incorrectCount = useMemo(() => {
    return questions.filter(q => userAnswers[q.id] !== undefined && userAnswers[q.id] !== q.correct).length;
  }, [questions, userAnswers]);

  // Filtered questions for Practice mode
  const filteredQuestions = useMemo(() => {
    if (mode === 'exam') return questions;

    return questions.filter(q => {
      const isAnswered = userAnswers[q.id] !== undefined;
      const isCorrect = userAnswers[q.id] === q.correct;
      const isMarked = !!bookmarks[q.id];

      if (filterType === 'unanswered') return !isAnswered;
      if (filterType === 'answered') return isAnswered;
      if (filterType === 'incorrect') return isAnswered && !isCorrect;
      if (filterType === 'bookmarked') return isMarked;
      return true;
    });
  }, [questions, mode, filterType, userAnswers, bookmarks]);

  // Audio speech handler
  const handleSpeak = (q: ListeningP1Question) => {
    if (speakingQId === q.id) {
      stopSpeaking();
      setSpeakingQId(null);
      return;
    }

    setSpeakingQId(q.id);
    const textToRead = `${q.question}. Option A: ${q.options[0]}. Option B: ${q.options[1]}. Option C: ${q.options[2]}.`;
    speakSingleSentence(textToRead, 'man', 0.95, () => {
      setSpeakingQId(null);
    });
  };

  const optionLetters = ['A', 'B', 'C'];

  return (
    <div ref={topRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Banner / Mode Switcher */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/30 p-5 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-amber-400" />
                Aptis Listening Part 1
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Tổng 188 Câu (3 Đề: Set 1 • Set 2 • Set 3)
              </span>
              {history.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Đã thi: {history.length} lần • Cao nhất: {Math.max(...history.map(h => h.percentage))}%
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Luyện Trắc Nghiệm Theo Trí Nhớ Tiếng Việt
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Tối ưu phản xạ từ vựng tiếng Việt - tiếng Anh. Chế độ luyện tập có kết quả và dịch nhanh tức thì; Chế độ thi xáo trộn câu và chỉ hiển thị bản dịch sau khi nộp bài.
            </p>

            {/* Set Selection Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs font-semibold text-slate-400 mr-1">Chọn đề:</span>
              <button
                onClick={() => setActiveSet('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                  activeSet === 'all'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Tất cả 3 Set (188 câu)
              </button>
              <button
                onClick={() => setActiveSet(1)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                  activeSet === 1
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Set 1 (Câu 1 - 50)
              </button>
              <button
                onClick={() => setActiveSet(2)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                  activeSet === 2
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Set 2 (Câu 51 - 100)
              </button>
              <button
                onClick={() => setActiveSet(3)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                  activeSet === 3
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Set 3 (Câu 101 - 192)
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 self-start md:self-auto shadow-inner">
            <button
              onClick={() => handleModeChange('practice')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'practice'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chế độ 1: Luyện Tập (Tức thì)</span>
            </button>

            <button
              onClick={() => handleModeChange('exam')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'exam'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Chế độ 2: Thi Thử (Đảo đề)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar & Filter Bar based on Mode */}
      {mode === 'practice' ? (
        /* PRACTICE CONTROLS */
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          
          {/* Quick translation and tools */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setQuickTranslateAll(prev => !prev)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                quickTranslateAll
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Bật/Tắt dịch nhanh tiếng Việt song ngữ dưới từng đáp án"
            >
              <Languages className="w-4 h-4 text-emerald-400" />
              <span>Dịch nhanh đáp án: {quickTranslateAll ? 'BẬT (Song ngữ)' : 'TẮT (Tiếng Anh)'}</span>
            </button>

            {/* Filter buttons */}
            <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
              <span className="px-2 text-slate-500 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Lọc:
              </span>
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tất cả ({questions.length})
              </button>
              <button
                onClick={() => setFilterType('incorrect')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterType === 'incorrect' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                Sai ({incorrectCount})
              </button>
              <button
                onClick={() => setFilterType('unanswered')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterType === 'unanswered' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Chưa làm ({questions.length - answeredCount})
              </button>
              <button
                onClick={() => setFilterType('bookmarked')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterType === 'bookmarked' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                Đánh dấu ({Object.values(bookmarks).filter(Boolean).length})
              </button>
            </div>
          </div>

          {/* Practice statistics & Reset */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-emerald-400 font-bold">Đúng: {correctCount}</span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-400 font-bold">Sai: {incorrectCount}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Đã làm: {answeredCount}/{questions.length}</span>
            </div>

            <button
              onClick={handleResetPractice}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 transition"
              title="Làm lại tất cả câu hỏi"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm lại</span>
            </button>
          </div>
        </div>
      ) : (
        /* EXAM CONTROLS */
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
            
            {/* Exam info & Timer */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono font-bold text-sm">
                <Clock className="w-4 h-4 text-indigo-400 animate-spin-slow" />
                <span>Thời gian: {formatTime(secondsElapsed)}</span>
              </div>

              <div className="text-xs text-slate-400">
                <span>Tiến độ: </span>
                <strong className="text-white text-sm">{answeredCount}</strong>
                <span className="text-slate-500"> / {questions.length} câu</span>
              </div>
            </div>

            {/* Exam Actions */}
            <div className="flex items-center space-x-2.5">
              <button
                onClick={startNewExam}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition active:scale-95"
                title="Xáo trộn câu hỏi và bắt đầu thi lại từ đầu"
              >
                <Shuffle className="w-3.5 h-3.5 text-purple-400" />
                <span>Đảo đề thi mới</span>
              </button>

              {!isExamSubmitted ? (
                <button
                  onClick={handleSubmitExam}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Nộp Bài (Submit)</span>
                </button>
              ) : (
                <button
                  onClick={startNewExam}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Thi lại đề khác</span>
                </button>
              )}
            </div>
          </div>

          {/* Exam Summary Banner after submission */}
          {isExamSubmitted && (
            <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/40 p-6 rounded-2xl shadow-2xl animate-fadeIn">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Kết quả bài thi trắc nghiệm
                    </span>
                    <h2 className="text-2xl font-black text-white">
                      Điểm số: {correctCount} / {questions.length} ({Math.round((correctCount / questions.length) * 100)}%)
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      Thời gian làm bài: <strong>{formatTime(secondsElapsed)}</strong> • Số câu làm đúng: <span className="text-emerald-400 font-bold">{correctCount}</span> • Số câu sai: <span className="text-rose-400 font-bold">{questions.length - correctCount}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs text-slate-300 max-w-sm space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Languages className="w-4 h-4" />
                    <span>Bản dịch tiếng Việt đã được mở!</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Tất cả câu hỏi và đáp án bên dưới giờ đã hiển thị đầy đủ nghĩa tiếng Việt và giải thích chi tiết để bạn rà soát trí nhớ.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Jump Grid (Mini-map of questions) */}
          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl">
            <div className="flex items-center justify-between mb-2 px-1 text-xs">
              <span className="font-semibold text-slate-400">Danh sách {questions.length} câu (Bấm để nhảy nhanh):</span>
              <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"></span> Chưa làm</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span> Đã chọn</span>
                {isExamSubmitted && (
                  <>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Đúng</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Sai</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-10 sm:grid-cols-25 gap-1.5">
              {questions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isCorrect = userAnswers[q.id] === q.correct;
                const isFlagged = bookmarks[q.id];

                let btnColor = 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700';

                if (isExamSubmitted) {
                  if (isCorrect) {
                    btnColor = 'bg-emerald-600 text-white border-emerald-500';
                  } else if (isAnswered && !isCorrect) {
                    btnColor = 'bg-rose-600 text-white border-rose-500';
                  } else {
                    btnColor = 'bg-slate-800 text-slate-500 border-slate-700';
                  }
                } else if (isAnswered) {
                  btnColor = 'bg-indigo-600 text-white border-indigo-500 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      const el = document.getElementById(`question-item-${q.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`h-7 rounded-lg text-xs font-semibold border flex items-center justify-center transition relative ${btnColor}`}
                    title={`Câu ${idx + 1}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-5">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-slate-300 font-semibold">Không tìm thấy câu hỏi nào theo bộ lọc này.</p>
            <button
              onClick={() => setFilterType('all')}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition"
            >
              Xem tất cả câu hỏi
            </button>
          </div>
        ) : (
          filteredQuestions.map((q, displayIdx) => {
            const isAnswered = userAnswers[q.id] !== undefined;
            const selectedOpt = userAnswers[q.id];
            const isCorrect = selectedOpt === q.correct;
            const isBookmarked = !!bookmarks[q.id];
            const isSpeaking = speakingQId === q.id;

            // Decision on whether to show translation:
            // Mode 1 (Practice): Shown if quickTranslateAll is ON or user clicked reveal or answered
            // Mode 2 (Exam): ONLY shown after submit (isExamSubmitted)
            const showTranslation = mode === 'practice'
              ? (quickTranslateAll || revealedTranslations[q.id] || isAnswered)
              : isExamSubmitted;

            // Decision on whether to show result (Instant feedback):
            // Mode 1: Result shown immediately when an option is selected
            // Mode 2: Result shown ONLY after exam submission
            const showResultFeedback = mode === 'practice' ? isAnswered : isExamSubmitted;

            return (
              <div
                key={q.id}
                id={`question-item-${q.id}`}
                className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 shadow-xl space-y-4 ${
                  showResultFeedback
                    ? isCorrect
                      ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-500/60'
                      : 'bg-slate-900/90 border-rose-500/40 hover:border-rose-500/60'
                    : isAnswered
                    ? 'bg-slate-900/90 border-indigo-500/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header: Question Badge, ID, Audio TTS, and Bookmark */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                      {mode === 'exam' ? `Câu ${displayIdx + 1}` : `Câu ${q.num}`}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      ID: {q.id}
                    </span>
                    {mode === 'exam' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                        Đề gốc: Câu #{q.num}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Audio TTS button */}
                    <button
                      onClick={() => handleSpeak(q)}
                      className={`p-2 rounded-xl transition ${
                        isSpeaking
                          ? 'bg-indigo-600 text-white animate-pulse'
                          : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800'
                      }`}
                      title="Nghe đọc câu hỏi & các đáp án"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Quick Peek Translate toggle in Practice mode */}
                    {mode === 'practice' && !quickTranslateAll && (
                      <button
                        onClick={() => toggleRevealTranslation(q.id)}
                        className={`p-2 rounded-xl transition ${
                          revealedTranslations[q.id]
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800'
                        }`}
                        title="Hé lộ nghĩa tiếng Việt (Trí nhớ)"
                      >
                        {revealedTranslations[q.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}

                    {/* Bookmark Button */}
                    <button
                      onClick={() => toggleBookmark(q.id)}
                      className={`p-2 rounded-xl transition ${
                        isBookmarked
                          ? 'text-amber-400 bg-amber-400/10'
                          : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                      }`}
                      title="Đánh dấu câu hỏi cần xem lại"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Question Text (English) + Vietnamese translation */}
                <div className="space-y-1.5">
                  <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    {q.question}
                  </p>

                  {/* Vietnamese translation of question */}
                  {showTranslation && (
                    <div className="flex items-start space-x-2 text-xs sm:text-sm text-emerald-300/90 font-medium bg-emerald-950/30 border border-emerald-500/20 px-3 py-2 rounded-xl animate-fadeIn">
                      <Languages className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                      <span>{q.questionVi}</span>
                    </div>
                  )}
                </div>

                {/* Options List (A, B, C) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedOpt === oIdx;
                    const isOptionCorrect = q.correct === oIdx;
                    const optVi = q.optionsVi[oIdx];

                    let btnStyle = 'bg-slate-800/70 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600';

                    if (showResultFeedback) {
                      if (isOptionCorrect) {
                        btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold ring-1 ring-emerald-500/30';
                      } else if (isSelected && !isOptionCorrect) {
                        btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold ring-1 ring-rose-500/30';
                      } else {
                        btnStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-indigo-600/25 border-indigo-500 text-indigo-100 font-bold ring-2 ring-indigo-500/50';
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={mode === 'exam' && isExamSubmitted}
                        onClick={() => handleSelectOption(q.id, oIdx)}
                        className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-200 relative group ${btnStyle}`}
                      >
                        <div className="flex items-center space-x-2.5 w-full">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              showResultFeedback && isOptionCorrect
                                ? 'bg-emerald-500 text-white'
                                : showResultFeedback && isSelected && !isOptionCorrect
                                ? 'bg-rose-500 text-white'
                                : isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-700/80 text-slate-300'
                            }`}
                          >
                            {optionLetters[oIdx]}
                          </span>

                          <span className="text-sm font-semibold flex-1 leading-snug">
                            {opt}
                          </span>

                          {showResultFeedback && isOptionCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {showResultFeedback && isSelected && !isOptionCorrect && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </div>

                        {/* Quick Translation underneath option (Focus on Vietnamese memory) */}
                        {showTranslation && optVi && (
                          <div className="mt-2 pt-2 border-t border-slate-700/50 text-xs text-amber-200/90 font-medium flex items-center gap-1.5 w-full">
                            <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="italic">{optVi}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Instant Feedback / Explanation Box */}
                {showResultFeedback && (
                  <div
                    className={`p-4 rounded-xl border-l-4 text-xs sm:text-sm leading-relaxed space-y-2 animate-fadeIn ${
                      isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-500 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Chính xác! Đáp án đúng: {q.correctLetter}. {q.options[q.correct]}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>
                            {selectedOpt !== undefined
                              ? `Chưa đúng! Bạn đã chọn ${optionLetters[selectedOpt]}. Đáp án đúng là: ${q.correctLetter}. ${q.options[q.correct]}`
                              : `Bạn chưa chọn đáp án! Đáp án đúng là: ${q.correctLetter}. ${q.options[q.correct]}`}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Vietnamese Memory summary */}
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 space-y-1">
                      <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Trí nhớ tiếng Việt (Keyword match):</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-0.5">
                        <p>• Câu hỏi: <strong>{q.questionVi}</strong></p>
                        <p className="text-emerald-400 font-medium">
                          • Đáp án đúng ({q.correctLetter}): <strong>{q.options[q.correct]}</strong> ➔ <em>{q.optionsVi[q.correct]}</em>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Quick Action in Exam mode */}
      {mode === 'exam' && !isExamSubmitted && (
        <div className="sticky bottom-6 z-40 max-w-md mx-auto bg-slate-900/95 border border-indigo-500/40 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-lg flex items-center justify-between gap-4 animate-slideUp">
          <div className="text-xs">
            <span className="text-slate-400">Đã làm: </span>
            <strong className="text-indigo-300 text-sm">{answeredCount}</strong>
            <span className="text-slate-500"> / {questions.length}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Lên đầu trang"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            <button
              onClick={handleSubmitExam}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition active:scale-95 flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Nộp bài ngay</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Early Exam Submission */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Xác nhận nộp bài thi?</h3>
                <p className="text-xs text-slate-400">Chế độ thi tính giờ</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn mới làm <strong className="text-amber-300">{answeredCount}/{questions.length}</strong> câu hỏi. Bạn có chắc chắn muốn nộp bài ngay để chấm điểm và xem bản dịch tiếng Việt không?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={executeSubmitExam}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-md shadow-emerald-500/20 transition active:scale-95"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Resetting Practice */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Làm lại từ đầu?</h3>
                <p className="text-xs text-slate-400">Xóa tiến độ luyện tập hiện tại</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Toàn bộ các đáp án đã chọn trong phiên luyện tập này sẽ được xóa để bạn làm lại từ đầu.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmResetPractice}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition active:scale-95"
              >
                Xóa & Làm lại
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

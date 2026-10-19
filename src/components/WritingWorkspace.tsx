import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  PenTool,
  Sparkles,
  RotateCcw,
  Key,
  AlertTriangle,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Dices,
  Send,
  Eye,
  EyeOff,
  Trophy,
  Copy,
  Check,
  Clock,
  Play,
  Pause,
  ArrowDownToLine,
  FileText
} from 'lucide-react';
import type {
  AptisWritingTopic,
  WritingUserAnswers,
  WritingEvaluationReport
} from '../types/writing';
import type { GradedScope } from '../utils/writingAi';
import writingTopicsData from '../data/aptis_writing_topics.json';
import { countWords, gradeWritingWithGemini, gradeWritingLocally } from '../utils/writingAi';

export const WritingWorkspace: React.FC = () => {
  const topics: AptisWritingTopic[] = writingTopicsData as any;
  const [activeTopicId, setActiveTopicId] = useState<string>(topics[0]?.id || '');
  const activeTopic = topics.find(t => t.id === activeTopicId) || topics[0];
  const currentTopicIdx = topics.findIndex(t => t.id === activeTopicId);

  // Tab view: 'all' | 'part1' | 'part2' | 'part3' | 'part4'
  const [activeTab, setActiveTab] = useState<'all' | 'part1' | 'part2' | 'part3' | 'part4'>('all');

  // User input answers
  const [answers, setAnswers] = useState<WritingUserAnswers>({
    part1: {},
    part2: '',
    part3: {},
    part4_friend: '',
    part4_manager: ''
  });

  // Sample answers display toggles per section
  const [showSamples, setShowSamples] = useState<Record<string, boolean>>({});
  // Cheat sheets toggle per section
  const [showCheatSheet, setShowCheatSheet] = useState<Record<string, boolean>>({});

  const toggleSample = (sectionKey: string) => {
    setShowSamples(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const toggleCheatSheet = (sectionKey: string) => {
    setShowCheatSheet(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  // Evaluation states
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationReport, setEvaluationReport] = useState<WritingEvaluationReport | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Gemini API Key config modal & state
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('gemini_api_key') || '';
    } catch {
      return '';
    }
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>(apiKey);

  // Timer states (Aptis Writing limit: 50 minutes = 3000s)
  const [timerMode, setTimerMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [timeLeft, setTimeLeft] = useState<number>(50 * 60);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Topic search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const q = searchQuery.toLowerCase();
    return topics.filter(t => t.title.toLowerCase().includes(q) || t.id.includes(q));
  }, [topics, searchQuery]);

  // Reset when topic changes
  useEffect(() => {
    setAnswers({
      part1: {},
      part2: '',
      part3: {},
      part4_friend: '',
      part4_manager: ''
    });
    setEvaluationReport(null);
    setShowSamples({});
    setTimeLeft(50 * 60);
    setTimeElapsed(0);
    setIsTimerRunning(true);
  }, [activeTopicId]);

  // Timer interval
  useEffect(() => {
    if (!isTimerRunning) return;
    const timer = setInterval(() => {
      setTimeElapsed(s => s + 1);
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  const formatSeconds = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Handlers for inputs
  const handlePart1Change = (qNum: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      part1: { ...prev.part1, [qNum]: value }
    }));
  };

  const handlePart3Change = (idx: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      part3: { ...prev.part3, [idx]: value }
    }));
  };

  // Insert sample into specific field
  const handleLoadSamplePart1 = (qNum: number, text?: string) => {
    if (!text) return;
    setAnswers(prev => ({
      ...prev,
      part1: { ...prev.part1, [qNum]: text }
    }));
  };

  const handleLoadSamplePart2 = () => {
    if (activeTopic.part2.sampleAnswer) {
      setAnswers(prev => ({ ...prev, part2: activeTopic.part2.sampleAnswer || '' }));
    }
  };

  const handleLoadSamplePart3 = (idx: number) => {
    const it = activeTopic.part3.items[idx];
    if (it?.sampleAnswer) {
      setAnswers(prev => ({
        ...prev,
        part3: { ...prev.part3, [idx]: it.sampleAnswer || '' }
      }));
    }
  };

  const handleLoadSamplePart4Friend = () => {
    if (activeTopic.part4.task1.sampleAnswer) {
      setAnswers(prev => ({ ...prev, part4_friend: activeTopic.part4.task1.sampleAnswer || '' }));
    }
  };

  const handleLoadSamplePart4Manager = () => {
    if (activeTopic.part4.task2.sampleAnswer) {
      setAnswers(prev => ({ ...prev, part4_manager: activeTopic.part4.task2.sampleAnswer || '' }));
    }
  };

  // Fill all sample answers for quick study
  const handleFillAllSamples = () => {
    if (!activeTopic) return;
    const p1: Record<number, string> = {};
    activeTopic.part1.forEach(q => {
      p1[q.questionNumber] = q.sampleAnswer || 'My favorite';
    });
    const p3: Record<number, string> = {};
    activeTopic.part3.items.forEach((it, idx) => {
      p3[idx] = it.sampleAnswer || 'In my opinion, this is a very interesting topic.';
    });

    setAnswers({
      part1: p1,
      part2: activeTopic.part2.sampleAnswer || 'In my free time, I usually go to the park near my house because it is peaceful, clean and cheap.',
      part3: p3,
      part4_friend: activeTopic.part4.task1.sampleAnswer || 'Hi Anna,\nHow are you? I am writing to share my thoughts about our club upcoming event.',
      part4_manager: activeTopic.part4.task2.sampleAnswer || 'Dear Sir or Madam,\nI am writing to express my opinions and provide some recommendations regarding our club.'
    });
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả câu trả lời hiện tại để viết lại từ đầu?')) {
      setAnswers({
        part1: {},
        part2: '',
        part3: {},
        part4_friend: '',
        part4_manager: ''
      });
      setEvaluationReport(null);
    }
  };

  // Submit and Grade
  const handleGradeSubmission = async (scope: GradedScope = 'all') => {
    if (!activeTopic) return;
    setIsEvaluating(true);

    try {
      let report: WritingEvaluationReport;
      if (apiKey.trim()) {
        report = await gradeWritingWithGemini(activeTopic, answers, apiKey.trim(), scope);
      } else {
        report = gradeWritingLocally(activeTopic, answers, scope);
      }

      setEvaluationReport(report);
      setShowReportModal(true);

      const ratio = report.maxScore > 0 ? report.overallScore / report.maxScore : 0;
      if (ratio >= 0.75) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (e: any) {
      console.error(e);
      alert('Đã xảy ra lỗi khi chấm bài. Đang chuyển sang chế độ chấm Offline.');
      const localReport = gradeWritingLocally(activeTopic, answers, scope);
      setEvaluationReport(localReport);
      setShowReportModal(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveApiKey = () => {
    const trimmed = tempApiKey.trim();
    setApiKey(trimmed);
    try {
      localStorage.setItem('gemini_api_key', trimmed);
    } catch {}
    setShowApiKeyModal(false);
  };

  // Prev / Next / Random Topic
  const handlePrevTopic = () => {
    if (currentTopicIdx > 0) {
      setActiveTopicId(topics[currentTopicIdx - 1].id);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleNextTopic = () => {
    if (currentTopicIdx < topics.length - 1) {
      setActiveTopicId(topics[currentTopicIdx + 1].id);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleRandomTopic = () => {
    if (topics.length <= 1) return;
    const others = topics.filter(t => t.id !== activeTopicId);
    const rand = others[Math.floor(Math.random() * others.length)];
    if (rand) {
      setActiveTopicId(rand.id);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  // Word count helper component
  const WordCountBadge: React.FC<{ count: number; min: number; max: number }> = ({ count, min, max }) => {
    const isGood = count >= min && count <= max;
    const isUnder = count > 0 && count < min;
    const isOver = count > max;

    let badgeClass = 'bg-slate-800 text-slate-400 border-slate-700';
    let label = `${count} từ (Mục tiêu: ${min}-${max})`;

    if (isGood) {
      badgeClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-bold';
      label = `✓ ${count} từ (Chuẩn ${min}-${max})`;
    } else if (isUnder) {
      badgeClass = 'bg-amber-500/15 text-amber-400 border-amber-500/40 font-bold';
      label = `Thiếu từ: ${count} / ${min}-${max}`;
    } else if (isOver) {
      badgeClass = 'bg-rose-500/15 text-rose-400 border-rose-500/40 font-bold';
      label = `Dài quá: ${count} / ${min}-${max}`;
    }

    return (
      <span className={`text-[11px] px-2.5 py-1 rounded-lg border inline-flex items-center gap-1 transition ${badgeClass}`}>
        {label}
      </span>
    );
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <PenTool className="w-3.5 h-3.5 text-indigo-400" />
              <span>Aptis ESOL Writing • Luyện Viết Theo Chủ Đề & AI Chấm Điểm Chuẩn British Council</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Luyện Viết Aptis: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">{activeTopic?.title || 'Aptis Writing'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Trọn bộ 40 đề thi câu lạc bộ chuẩn format (Community, Business, Museum, Food...). Gồm đầy đủ 4 Part (50 điểm / 50 phút) kèm AI phân tích ngữ pháp, từ vựng và viết lại bài mẫu B2/C1.
            </p>
          </div>

          {/* Quick Action Top Bar (API Key & Timer) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setTempApiKey(apiKey);
                setShowApiKeyModal(true);
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                apiKey
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25 animate-pulse'
              }`}
              title="Cài đặt Google Gemini API Key để AI chấm điểm chi tiết"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{apiKey ? '🔑 Đã Kết Nối Gemini AI' : '⚙️ Nhập Gemini API Key'}</span>
            </button>

            {/* Timer Box with Play/Pause & Mode Toggle */}
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs ${
              timerMode === 'countdown' && timeLeft < 300
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 animate-pulse'
                : 'bg-slate-900/90 border-slate-800 text-slate-300'
            }`}>
              <button
                onClick={() => setTimerMode(m => (m === 'countdown' ? 'stopwatch' : 'countdown'))}
                className="hover:text-cyan-300 transition flex items-center gap-1 font-semibold"
                title="Bấm để đổi giữa Đếm ngược 50 phút (Thi thật) và Đếm xuôi (Luyện tập)"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{timerMode === 'countdown' ? 'Đếm ngược:' : 'Đã làm:'}</span>
              </button>

              <span className="font-mono font-bold text-cyan-300">
                {timerMode === 'countdown' ? formatSeconds(timeLeft) : formatSeconds(timeElapsed)}
              </span>

              <button
                onClick={() => setIsTimerRunning(r => !r)}
                className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title={isTimerRunning ? 'Tạm dừng đồng hồ' : 'Tiếp tục tính giờ'}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRandomTopic}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition active:scale-95"
            >
              <Dices className="w-4 h-4 text-amber-300" />
              <span>🎲 Đổi Chủ Đề Ngẫu Nhiên</span>
            </button>

            <button
              onClick={handlePrevTopic}
              disabled={currentTopicIdx <= 0}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center transition ${
                currentTopicIdx <= 0
                  ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
              title="Đề trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNextTopic}
              disabled={currentTopicIdx >= topics.length - 1}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center transition ${
                currentTopicIdx >= topics.length - 1
                  ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
              title="Đề kế tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Study Actions */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={handleFillAllSamples}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-semibold bg-slate-800/80 hover:bg-slate-800 text-indigo-300 border-indigo-500/30 transition"
              title="Điền câu trả lời mẫu điểm cao vào bài làm để học cách viết"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-indigo-400" />
              <span>Nạp toàn bộ bài mẫu</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 transition"
              title="Xóa trắng bài làm để tự gõ lại"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm lại từ đầu</span>
            </button>
          </div>

        </div>

        {/* Topic Selector Dropdown & Live Filter */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <input
              type="text"
              placeholder="🔍 Lọc nhanh theo tên chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={activeTopicId}
              onChange={(e) => setActiveTopicId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-indigo-200 focus:outline-none focus:border-indigo-500"
            >
              {filteredTopics.map((t, idx) => (
                <option key={t.id} value={t.id}>
                  {idx + 1}. {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Part Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <span>Toàn Bộ Bài Thi (Full 4 Parts • 50đ)</span>
        </button>

        <button
          onClick={() => setActiveTab('part1')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'part1'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <span>Part 1 (Biểu Mẫu 1-5 từ • 5đ)</span>
        </button>

        <button
          onClick={() => setActiveTab('part2')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'part2'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <span>Part 2 (Trả Lời 20-30 từ • 7đ)</span>
        </button>

        <button
          onClick={() => setActiveTab('part3')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'part3'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <span>Part 3 (Chat Nhóm 30-40 từ • 15đ)</span>
        </button>

        <button
          onClick={() => setActiveTab('part4')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'part4'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <span>Part 4 (Viết 2 Email • 23đ)</span>
        </button>
      </div>

      {/* Main Parts Writing Content */}
      <div className="space-y-8">
        
        {/* ================= PART 1: FORM FILLING (1 - 5 WORDS) ================= */}
        {(activeTab === 'all' || activeTab === 'part1') && (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full mb-1">
                  <span>Part 1 • Điền Biểu Mẫu (5 Điểm • ~3 phút)</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Trả lời ngắn cho 5 câu hỏi thông tin cá nhân (1 - 5 từ mỗi câu)
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleSample('part1')}
                  className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  {showSamples['part1'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSamples['part1'] ? 'Ẩn câu trả lời mẫu' : 'Xem câu trả lời mẫu'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {activeTopic.part1.map(q => {
                const userVal = answers.part1[q.questionNumber] || '';
                const count = countWords(userVal);

                return (
                  <div key={q.questionNumber} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-sm font-semibold text-slate-200">
                        <span className="text-indigo-400 font-bold mr-1.5">{q.questionNumber}.</span>
                        {q.question}
                      </label>
                      <WordCountBadge count={count} min={1} max={5} />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nhập câu trả lời ngắn (1 - 5 từ)..."
                        value={userVal}
                        onChange={(e) => handlePart1Change(q.questionNumber, e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      />
                      {q.sampleAnswer && (
                        <button
                          onClick={() => handleLoadSamplePart1(q.questionNumber, q.sampleAnswer)}
                          className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold shrink-0"
                          title="Nạp mẫu vào ô"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {showSamples['part1'] && q.sampleAnswer && (
                      <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center justify-between">
                        <span>💡 <b>Gợi ý mẫu:</b> {q.sampleAnswer}</span>
                        <button
                          onClick={() => handleCopyText(`p1-${q.questionNumber}`, q.sampleAnswer || '')}
                          className="hover:text-white transition"
                          title="Sao chép câu trả lời mẫu"
                        >
                          {copiedKey === `p1-${q.questionNumber}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Grade Part 1 Button */}
            {activeTab === 'part1' && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleGradeSubmission('part1')}
                  disabled={isEvaluating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Chấm Riêng Part 1 (Thang 5đ)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= PART 2: SHORT ANSWER (20 - 30 WORDS) ================= */}
        {(activeTab === 'all' || activeTab === 'part2') && (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full mb-1">
                  <span>Part 2 • Biểu Mẫu Thành Viên (7 Điểm • ~7 phút)</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Viết câu văn hoàn chỉnh trả lời câu hỏi biểu mẫu (20 - 30 từ)
                </h3>
              </div>

              <div className="flex items-center space-x-3 text-xs font-semibold">
                <button
                  onClick={() => toggleCheatSheet('part2')}
                  className="text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showCheatSheet['part2'] ? 'Đóng mẫu câu' : 'Mẫu câu ăn điểm B2'}</span>
                </button>

                <button
                  onClick={() => toggleSample('part2')}
                  className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300"
                >
                  {showSamples['part2'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSamples['part2'] ? 'Ẩn bài mẫu' : 'Xem bài mẫu'}</span>
                </button>
              </div>
            </div>

            {/* Cheat Sheet / Template Card for Part 2 */}
            {showCheatSheet['part2'] && (
              <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-200 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-300" />
                  Công Thức Ăn Điểm Part 2 (Độ dài 20 - 30 từ):
                </div>
                <p><b>Cấu trúc 1:</b> <i>I usually [hoạt động] because it is [tính từ 1], [tính từ 2] and [tính từ 3]. Furthermore, it helps me [lợi ích].</i></p>
                <p><b>Cấu trúc 2:</b> <i>In my free time, I really enjoy [V-ing] with my friends. Not only does it give me pleasure, but it also allows me to unwind after a hectic day.</i></p>
                <p className="text-slate-400 italic">Mẹo: Viết 2 câu ngắn gọn, chứa liên từ (because, furthermore, besides), đếm đủ 22-28 từ là an toàn tuyệt đối!</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 italic">
                {activeTopic.part2.instruction}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-sm font-bold text-indigo-200">
                  👉 Câu hỏi: <span className="text-white">{activeTopic.part2.prompt}</span>
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLoadSamplePart2}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                    title="Nạp bài mẫu vào ô này để xem thử"
                  >
                    <ArrowDownToLine className="w-3 h-3 text-emerald-400" />
                    <span>Nạp mẫu</span>
                  </button>
                  <WordCountBadge count={countWords(answers.part2)} min={20} max={30} />
                </div>
              </div>

              <textarea
                rows={3}
                placeholder="Nhập câu trả lời của bạn ở đây (độ dài 20 - 30 từ)..."
                value={answers.part2}
                onChange={(e) => setAnswers(prev => ({ ...prev, part2: e.target.value }))}
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed transition"
              />

              {showSamples['part2'] && activeTopic.part2.sampleAnswer && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Bài mẫu tham khảo ({countWords(activeTopic.part2.sampleAnswer)} từ):
                    </span>
                    <button
                      onClick={() => handleCopyText('part2', activeTopic.part2.sampleAnswer || '')}
                      className="hover:text-white transition"
                    >
                      {copiedKey === 'part2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="leading-relaxed select-all">{activeTopic.part2.sampleAnswer}</p>
                </div>
              )}

              {/* Quick Grade Part 2 Button */}
              {activeTab === 'part2' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleGradeSubmission('part2')}
                    disabled={isEvaluating}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Chấm Riêng Part 2 (Thang 7đ)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= PART 3: GROUP CHAT (30 - 40 WORDS EACH) ================= */}
        {(activeTab === 'all' || activeTab === 'part3') && (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2.5 py-0.5 rounded-full mb-1">
                  <span>Part 3 • Chat Nhóm Với 3 Thành Viên (15 Điểm • ~10 phút)</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Trả lời tin nhắn của 3 thành viên trong phòng chat (30 - 40 từ mỗi câu)
                </h3>
              </div>

              <div className="flex items-center space-x-3 text-xs font-semibold">
                <button
                  onClick={() => toggleCheatSheet('part3')}
                  className="text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showCheatSheet['part3'] ? 'Đóng mẫu câu' : 'Mẫu câu ăn điểm B2'}</span>
                </button>

                <button
                  onClick={() => toggleSample('part3')}
                  className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300"
                >
                  {showSamples['part3'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSamples['part3'] ? 'Ẩn câu trả lời mẫu' : 'Xem câu trả lời mẫu'}</span>
                </button>
              </div>
            </div>

            {/* Cheat Sheet Card for Part 3 */}
            {showCheatSheet['part3'] && (
              <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-xs text-purple-200 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-300" />
                  Công Thức Ăn Điểm Part 3 (Độ dài 30 - 40 từ / câu):
                </div>
                <p><b>1. Nêu quan điểm cá nhân:</b> <i>In my perspective, ... / As far as I am concerned, ... / From my point of view, ...</i></p>
                <p><b>2. Đưa lý do và dẫn chứng:</b> <i>This is mainly because... Besides, it provides a great opportunity to...</i></p>
                <p><b>3. Câu kết giao tiếp tự nhiên (tăng tính tương tác):</b> <i>Have you ever experienced something similar? / What is your take on this?</i></p>
              </div>
            )}

            <div className="space-y-6">
              {activeTopic.part3.items.map((it, idx) => {
                const userVal = answers.part3[idx] || '';
                const count = countWords(userVal);

                return (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    {/* Chat Bubble from member */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-xs shrink-0">
                        {it.speaker.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className="text-xs font-bold text-indigo-400">{it.speaker}</span>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200">
                          {it.question}
                        </div>
                      </div>
                    </div>

                    {/* User response textarea */}
                    <div className="pl-11 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center space-x-2">
                          <span>Câu trả lời của bạn:</span>
                          {it.sampleAnswer && (
                            <button
                              onClick={() => handleLoadSamplePart3(idx)}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                              title="Nạp mẫu câu này"
                            >
                              <ArrowDownToLine className="w-3 h-3 text-purple-400" />
                              <span>Nạp mẫu</span>
                            </button>
                          )}
                        </div>
                        <WordCountBadge count={count} min={30} max={40} />
                      </div>

                      <textarea
                        rows={3}
                        placeholder="Trả lời tin nhắn bằng câu văn hoàn chỉnh (30 - 40 từ)..."
                        value={userVal}
                        onChange={(e) => handlePart3Change(idx, e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed transition"
                      />

                      {showSamples['part3'] && it.sampleAnswer && (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                          <div className="flex items-center justify-between font-bold text-amber-300">
                            <span>💡 Bài mẫu ({countWords(it.sampleAnswer)} từ):</span>
                            <button
                              onClick={() => handleCopyText(`p3-${idx}`, it.sampleAnswer || '')}
                              className="hover:text-white transition"
                            >
                              {copiedKey === `p3-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <p className="leading-relaxed select-all">{it.sampleAnswer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Grade Part 3 Button */}
            {activeTab === 'part3' && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleGradeSubmission('part3')}
                  disabled={isEvaluating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Chấm Riêng Part 3 (Thang 15đ)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= PART 4: EMAIL WRITING (50 WORDS & 120-150 WORDS) ================= */}
        {(activeTab === 'all' || activeTab === 'part4') && (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-pink-400 bg-pink-950/60 border border-pink-800/60 px-2.5 py-0.5 rounded-full mb-1">
                  <span>Part 4 • Viết 2 Email (23 Điểm • ~25 phút)</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Đọc thông báo của câu lạc bộ và viết 2 bức thư (1 thư cho bạn bè, 1 thư cho quản lý)
                </h3>
              </div>

              <div className="flex items-center space-x-3 text-xs font-semibold">
                <button
                  onClick={() => toggleCheatSheet('part4')}
                  className="text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showCheatSheet['part4'] ? 'Đóng mẫu thư' : 'Khung mẫu 2 bức thư B2/C1'}</span>
                </button>

                <button
                  onClick={() => toggleSample('part4')}
                  className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300"
                >
                  {showSamples['part4'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSamples['part4'] ? 'Ẩn thư mẫu' : 'Xem thư mẫu'}</span>
                </button>
              </div>
            </div>

            {/* Cheat Sheet Card for Part 4 */}
            {showCheatSheet['part4'] && (
              <div className="p-4 rounded-2xl bg-pink-950/60 border border-pink-500/30 text-xs text-pink-200 space-y-3">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-300" />
                  Cấu Trúc & Khung Câu Chuẩn Band B2/C1 Part 4:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="font-bold text-blue-400 block">Thư 1 (Gửi bạn bè • ~50 từ):</span>
                    <p>• <b>Chào:</b> <i>Hi [Tên], / Hey [Tên],</i></p>
                    <p>• <b>Cảm xúc:</b> <i>Have you heard the news? To be honest, I was really disappointed/excited to hear that...</i></p>
                    <p>• <b>Rủ rê / Đề xuất:</b> <i>Why don't we meet up this weekend to discuss it?</i></p>
                    <p>• <b>Ký tên:</b> <i>Let me know what you think. Catch you later! / Best, [Tên bạn]</i></p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="font-bold text-purple-400 block">Thư 2 (Gửi Quản lý • 120 - 150 từ):</span>
                    <p>• <b>Chào:</b> <i>Dear Sir or Madam, / Dear Club Manager,</i></p>
                    <p>• <b>Mục đích:</b> <i>I am writing this email to express my views regarding...</i></p>
                    <p>• <b>Đề xuất:</b> <i>In order to resolve this issue, I would like to propose a few feasible alternatives. Firstly, ... Secondly, ...</i></p>
                    <p>• <b>Kết thư:</b> <i>Thank you for considering my suggestions. I look forward to hearing from you. Yours sincerely, [Họ và tên]</i></p>
                    <p className="text-amber-300 text-[10px]">⚠️ Lưu ý: Tuyệt đối KHÔNG viết tắt (I'm, can't, don't) trong thư gửi quản lý!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Club Email Announcement Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-950 to-purple-950/70 border border-indigo-500/30 space-y-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                📬 Thông báo từ Câu Lạc Bộ (Club Announcement):
              </span>
              <p className="text-sm text-slate-200 leading-relaxed italic bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                "{activeTopic.part4.context}"
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Task 1: Friend Email */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                      1. Email Gửi Bạn Bè (Thân mật • ~50 từ)
                    </span>
                    <div className="flex items-center space-x-2">
                      {activeTopic.part4.task1.sampleAnswer && (
                        <button
                          onClick={handleLoadSamplePart4Friend}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                          title="Nạp mẫu thư bạn bè"
                        >
                          <ArrowDownToLine className="w-3 h-3 text-blue-400" />
                          <span>Nạp mẫu</span>
                        </button>
                      )}
                      <WordCountBadge count={countWords(answers.part4_friend)} min={45} max={60} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    {activeTopic.part4.task1.prompt}
                  </p>

                  <textarea
                    rows={6}
                    placeholder="Hi John,&#10;How are you? Did you hear about our club news?..."
                    value={answers.part4_friend}
                    onChange={(e) => setAnswers(prev => ({ ...prev, part4_friend: e.target.value }))}
                    className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed transition"
                  />
                </div>

                {showSamples['part4'] && activeTopic.part4.task1.sampleAnswer && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-300">
                      <span>💡 Thư mẫu bạn bè ({countWords(activeTopic.part4.task1.sampleAnswer)} từ):</span>
                      <button
                        onClick={() => handleCopyText('p4-friend', activeTopic.part4.task1.sampleAnswer || '')}
                        className="hover:text-white transition"
                      >
                        {copiedKey === 'p4-friend' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="leading-relaxed whitespace-pre-line select-all">{activeTopic.part4.task1.sampleAnswer}</p>
                  </div>
                )}
              </div>

              {/* Task 2: Manager Email */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                      2. Email Gửi Quản Lý (Trang trọng • 120-150 từ)
                    </span>
                    <div className="flex items-center space-x-2">
                      {activeTopic.part4.task2.sampleAnswer && (
                        <button
                          onClick={handleLoadSamplePart4Manager}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                          title="Nạp mẫu thư quản lý"
                        >
                          <ArrowDownToLine className="w-3 h-3 text-purple-400" />
                          <span>Nạp mẫu</span>
                        </button>
                      )}
                      <WordCountBadge count={countWords(answers.part4_manager)} min={120} max={150} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    {activeTopic.part4.task2.prompt}
                  </p>

                  <textarea
                    rows={6}
                    placeholder="Dear Sir or Madam,&#10;I am writing to express my views regarding the club announcement..."
                    value={answers.part4_manager}
                    onChange={(e) => setAnswers(prev => ({ ...prev, part4_manager: e.target.value }))}
                    className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed transition"
                  />
                </div>

                {showSamples['part4'] && activeTopic.part4.task2.sampleAnswer && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-300">
                      <span>💡 Thư mẫu quản lý ({countWords(activeTopic.part4.task2.sampleAnswer)} từ):</span>
                      <button
                        onClick={() => handleCopyText('p4-manager', activeTopic.part4.task2.sampleAnswer || '')}
                        className="hover:text-white transition"
                      >
                        {copiedKey === 'p4-manager' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="leading-relaxed whitespace-pre-line select-all">{activeTopic.part4.task2.sampleAnswer}</p>
                  </div>
                )}
              </div>

            </div>

            {/* Quick Grade Part 4 Button */}
            {activeTab === 'part4' && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleGradeSubmission('part4')}
                  disabled={isEvaluating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Chấm Riêng Part 4 (Thang 23đ)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Button: Submit & Grade with AI */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          {activeTab !== 'all' && (
            <button
              onClick={() => handleGradeSubmission(activeTab)}
              disabled={isEvaluating}
              className="w-full sm:w-1/2 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg transition active:scale-98 flex items-center justify-center space-x-2"
            >
              {isEvaluating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>AI Đang Chấm {activeTab.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Chấm Riêng {activeTab.toUpperCase()}</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => handleGradeSubmission('all')}
            disabled={isEvaluating}
            className={`py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold shadow-xl shadow-pink-600/25 transition active:scale-98 flex items-center justify-center space-x-2 text-sm ${
              activeTab !== 'all' ? 'w-full sm:w-1/2' : 'w-full'
            }`}
          >
            {isEvaluating ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin text-amber-300" />
                <span>Gemini AI Đang Chấm & Sửa Lỗi Chi Tiết...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Nộp Toàn Bộ Đề (Full 4 Parts • Thang 50đ) & Nhận Sửa Lỗi AI</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* ================= AI EVALUATION REPORT MODAL ================= */}
      {showReportModal && evaluationReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl no-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-lg">
                  <Trophy className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">
                    Kết Quả Đánh Giá Bài Viết: {activeTopic.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Phạm vi: {evaluationReport.gradedScope ? (evaluationReport.gradedScope === 'all' ? 'Toàn bài (Full 4 Parts)' : evaluationReport.gradedScope.toUpperCase()) : 'Toàn bài'} • Tiêu chuẩn Aptis ESOL
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Score & CEFR Summary Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Điểm Đạt Được ({evaluationReport.gradedScope === 'all' || !evaluationReport.gradedScope ? 'Toàn bài' : evaluationReport.gradedScope.toUpperCase()})
                </span>
                <div className="flex items-baseline justify-center sm:justify-start space-x-2">
                  <span className="text-4xl font-black text-white">{evaluationReport.overallScore}</span>
                  <span className="text-slate-400 font-semibold text-lg">/ {evaluationReport.maxScore} điểm</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="px-5 py-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-center">
                  <span className="text-[10px] text-indigo-300 font-bold uppercase block">Cấp Độ CEFR Ước Lượng</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-400">
                    Bậc {evaluationReport.cefrLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Comment */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Nhận Xét & Lời Khuyên Giám Khảo:
              </span>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {evaluationReport.overallComment}
              </p>
            </div>

            {/* Breakdown by Part (Guarded against undefined) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {evaluationReport.partScores.part1 && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="text-xs text-slate-400 block font-semibold">Part 1</span>
                  <span className="text-lg font-black text-cyan-400">{evaluationReport.partScores.part1.score} / {evaluationReport.partScores.part1.max}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{evaluationReport.partScores.part1.feedback}</p>
                </div>
              )}

              {evaluationReport.partScores.part2 && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="text-xs text-slate-400 block font-semibold">Part 2</span>
                  <span className="text-lg font-black text-emerald-400">{evaluationReport.partScores.part2.score} / {evaluationReport.partScores.part2.max}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{evaluationReport.partScores.part2.feedback}</p>
                </div>
              )}

              {evaluationReport.partScores.part3 && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="text-xs text-slate-400 block font-semibold">Part 3</span>
                  <span className="text-lg font-black text-purple-400">{evaluationReport.partScores.part3.score} / {evaluationReport.partScores.part3.max}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{evaluationReport.partScores.part3.feedback}</p>
                </div>
              )}

              {evaluationReport.partScores.part4 && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="text-xs text-slate-400 block font-semibold">Part 4</span>
                  <span className="text-lg font-black text-pink-400">{evaluationReport.partScores.part4.score} / {evaluationReport.partScores.part4.max}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{evaluationReport.partScores.part4.feedback}</p>
                </div>
              )}
            </div>

            {/* Detailed Corrections */}
            {evaluationReport.corrections && evaluationReport.corrections.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Chi Tiết Sửa Lỗi Ngữ Pháp & Chính Tả ({evaluationReport.corrections.length} lỗi):</span>
                </h4>

                <div className="space-y-2.5">
                  {evaluationReport.corrections.map((corr, cIdx) => (
                    <div key={cIdx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-400">{corr.part}</span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase">
                          {corr.type}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="text-rose-400 line-through">
                          ❌ Câu của bạn: {corr.original}
                        </div>
                        <div className="text-emerald-400 font-semibold">
                          ✓ Sửa chuẩn: {corr.corrected}
                        </div>
                        <p className="text-slate-300 italic pt-1">
                          💡 Giải thích: {corr.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vocabulary Suggestions */}
            {evaluationReport.vocabularySuggestions && evaluationReport.vocabularySuggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Gợi Ý Nâng Cấp Từ Vựng (B2 / C1 Collocations):</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {evaluationReport.vocabularySuggestions.map((v, vIdx) => (
                    <div key={vIdx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold">
                        <span className="text-slate-400 line-through">{v.originalWord}</span>
                        <span className="text-slate-500">➜</span>
                        <span className="text-emerald-400">{v.suggestedWord}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{v.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improved Sample Rewrite */}
            {evaluationReport.improvedSample && Object.keys(evaluationReport.improvedSample).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-indigo-400" />
                  <span>Bài Mẫu Nâng Cấp Chuẩn B2/C1 Dựa Trên Ý Tưởng Của Bạn:</span>
                </h4>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                  {evaluationReport.improvedSample.part2 && (
                    <div className="space-y-1">
                      <span className="font-bold text-emerald-400 uppercase tracking-wide">Part 2 Nâng Cấp:</span>
                      <p className="text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        {evaluationReport.improvedSample.part2}
                      </p>
                    </div>
                  )}

                  {evaluationReport.improvedSample.part3 && evaluationReport.improvedSample.part3.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-bold text-purple-400 uppercase tracking-wide">Part 3 Chat Nâng Cấp:</span>
                      {evaluationReport.improvedSample.part3.map((chat, cIdx) => (
                        <p key={cIdx} className="text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <b className="text-indigo-400 mr-1.5">{String.fromCharCode(65 + cIdx)}:</b> {chat}
                        </p>
                      ))}
                    </div>
                  )}

                  {evaluationReport.improvedSample.part4_friend && (
                    <div className="space-y-1">
                      <span className="font-bold text-blue-400 uppercase tracking-wide">Part 4 Thư Bạn Bè Nâng Cấp:</span>
                      <p className="text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800 whitespace-pre-line">
                        {evaluationReport.improvedSample.part4_friend}
                      </p>
                    </div>
                  )}

                  {evaluationReport.improvedSample.part4_manager && (
                    <div className="space-y-1">
                      <span className="font-bold text-pink-400 uppercase tracking-wide">Part 4 Thư Quản Lý Nâng Cấp:</span>
                      <p className="text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800 whitespace-pre-line">
                        {evaluationReport.improvedSample.part4_manager}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
              >
                Đóng Báo Cáo
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= GEMINI API KEY MODAL ================= */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Cấu Hình Google Gemini API Key</h3>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Để kích hoạt chức năng <b>chấm điểm, sửa lỗi ngữ pháp chi tiết và viết lại bài mẫu theo trình độ B2/C1</b>, vui lòng dán khóa Gemini API Key của bạn vào bên dưới.
              </p>
              <p className="text-slate-400">
                Khóa API được lưu an toàn trong trình duyệt (localStorage) của bạn và gửi trực tiếp tới máy chủ Google AI.
              </p>

              <div className="space-y-1 pt-1">
                <label className="font-semibold text-slate-200">Gemini API Key:</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>🔗 Lấy khóa Gemini API Key miễn phí tại Google AI Studio</span>
                </a>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md"
              >
                Lưu Khóa API
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Topic Switcher Navigation */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6 text-xs font-bold text-slate-400">
        <button
          onClick={handlePrevTopic}
          disabled={currentTopicIdx <= 0}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition ${
            currentTopicIdx <= 0
              ? 'opacity-40 cursor-not-allowed border-slate-800'
              : 'hover:bg-slate-800 text-slate-200 border-slate-700'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Chủ Đề Trước</span>
        </button>

        <span className="text-slate-400 font-medium">
          Chủ đề {currentTopicIdx + 1} / {topics.length}: <b className="text-indigo-300">{activeTopic?.title}</b>
        </span>

        <button
          onClick={handleNextTopic}
          disabled={currentTopicIdx >= topics.length - 1}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition ${
            currentTopicIdx >= topics.length - 1
              ? 'opacity-40 cursor-not-allowed border-slate-800'
              : 'hover:bg-slate-800 text-slate-200 border-slate-700'
          }`}
        >
          <span>Chủ Đề Kế Tiếp</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

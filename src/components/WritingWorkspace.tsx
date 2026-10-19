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
  BookOpen,
  Send,
  Eye,
  EyeOff,
  Trophy,
  Copy,
  Check
} from 'lucide-react';
import type {
  AptisWritingTopic,
  WritingUserAnswers,
  WritingEvaluationReport
} from '../types/writing';
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

  const toggleSample = (sectionKey: string) => {
    setShowSamples(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
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

  // Timer: 50 minutes standard Aptis Writing limit
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
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
    setSecondsElapsed(0);
  }, [activeTopicId]);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
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

  // Fill sample answers for quick study
  const handleFillSample = () => {
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
  const handleGradeSubmission = async () => {
    if (!activeTopic) return;
    setIsEvaluating(true);

    try {
      let report: WritingEvaluationReport;
      if (apiKey.trim()) {
        report = await gradeWritingWithGemini(activeTopic, answers, apiKey.trim());
      } else {
        report = gradeWritingLocally(activeTopic, answers);
      }

      setEvaluationReport(report);
      setShowReportModal(true);

      if (report.overallScore >= 38) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (e: any) {
      console.error(e);
      alert('Đã xảy ra lỗi khi chấm bài. Đang chuyển sang chế độ chấm Offline.');
      const localReport = gradeWritingLocally(activeTopic, answers);
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
              <span>Aptis ESOL Writing • Luyện Viết Theo Chủ Đề & AI Chấm Điểm</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Luyện Viết Aptis: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">{activeTopic?.title || 'Aptis Writing'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Trọn bộ 32 đề thi câu lạc bộ (Community, Business, Museum, Food...). Gồm đầy đủ 4 Part chuẩn format Hội đồng Anh kèm AI sửa lỗi ngữ pháp & chính tả chi tiết.
            </p>
          </div>

          {/* Quick Action Top Bar */}
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

            <div className="flex items-center space-x-1 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-400">Thời gian:</span>
              <span className="font-mono font-bold text-cyan-400">{formatTime(secondsElapsed)}</span>
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
              onClick={handleFillSample}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-semibold bg-slate-800/80 hover:bg-slate-800 text-indigo-300 border-indigo-500/30 transition"
              title="Điền câu trả lời mẫu điểm cao vào bài làm để học cách viết"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Điền Bài Mẫu Tham Khảo</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-700 transition"
              title="Xóa trắng để tự viết lại từ đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Viết Lại Từ Đầu</span>
            </button>
          </div>

        </div>

        {/* 32 Topic Selector Grid */}
        <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Kho 32 Chủ Đề Viết Aptis:</span>
            <input
              type="text"
              placeholder="Tìm kiếm chủ đề (Food, Car, Museum...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
            {filteredTopics.map((t) => {
              const isActive = t.id === activeTopicId;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTopicId(t.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800'
                  }`}
                  title={t.title}
                >
                  <span>{t.title}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Part Navigation Tabs */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex flex-wrap items-center gap-1 shadow-lg text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Toàn Bộ Bài Thi (Full Test)
          </button>
          <button
            onClick={() => setActiveTab('part1')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'part1' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Part 1 (Biểu Mẫu • 5đ)
          </button>
          <button
            onClick={() => setActiveTab('part2')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'part2' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Part 2 (20-30 từ • 7đ)
          </button>
          <button
            onClick={() => setActiveTab('part3')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'part3' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Part 3 (Chat Nhóm • 15đ)
          </button>
          <button
            onClick={() => setActiveTab('part4')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'part4' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Part 4 (Viết 2 Email • 23đ)
          </button>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="space-y-8">
        
        {/* ================= PART 1: FORM FILLING (1 - 5 WORDS) ================= */}
        {(activeTab === 'all' || activeTab === 'part1') && (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full mb-1">
                  <span>Part 1 • Điền Biểu Mẫu (5 Điểm)</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Trả lời ngắn cho 5 câu hỏi thông tin cá nhân (1 - 5 từ mỗi câu)
                </h3>
              </div>

              <button
                onClick={() => toggleSample('part1')}
                className="self-start sm:self-auto flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                {showSamples['part1'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSamples['part1'] ? 'Ẩn câu trả lời mẫu' : 'Xem câu trả lời mẫu'}</span>
              </button>
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

                    <input
                      type="text"
                      placeholder="Nhập câu trả lời ngắn (1 - 5 từ)..."
                      value={userVal}
                      onChange={(e) => handlePart1Change(q.questionNumber, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />

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
          </div>
        )}

        {/* ================= PART 2: SHORT ANSWER (20 - 30 WORDS) ================= */}
        {(activeTab === 'all' || activeTab === 'part2') && (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full mb-1">
                  <span>Part 2 • Điền Biểu Mẫu Thành Viên (7 Điểm)</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Viết câu hoàn chỉnh trả lời câu hỏi biểu mẫu (20 - 30 từ)
                </h3>
              </div>

              <button
                onClick={() => toggleSample('part2')}
                className="self-start sm:self-auto flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                {showSamples['part2'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSamples['part2'] ? 'Ẩn câu trả lời mẫu' : 'Xem câu trả lời mẫu'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 italic">
                {activeTopic.part2.instruction}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-indigo-200">
                  👉 Câu hỏi: <span className="text-white">{activeTopic.part2.prompt}</span>
                </p>
                <WordCountBadge count={countWords(answers.part2)} min={20} max={30} />
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
            </div>
          </div>
        )}

        {/* ================= PART 3: GROUP CHAT (30 - 40 WORDS EACH) ================= */}
        {(activeTab === 'all' || activeTab === 'part3') && (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2.5 py-0.5 rounded-full mb-1">
                  <span>Part 3 • Chat Nhóm Với 3 Thành Viên (15 Điểm)</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Trả lời tin nhắn của 3 thành viên trong phòng chat (30 - 40 từ mỗi câu)
                </h3>
              </div>

              <button
                onClick={() => toggleSample('part3')}
                className="self-start sm:self-auto flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                {showSamples['part3'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSamples['part3'] ? 'Ẩn câu trả lời mẫu' : 'Xem câu trả lời mẫu'}</span>
              </button>
            </div>

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
                        <span>Câu trả lời của bạn:</span>
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
          </div>
        )}

        {/* ================= PART 4: EMAIL WRITING (50 WORDS & 120-150 WORDS) ================= */}
        {(activeTab === 'all' || activeTab === 'part4') && (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-pink-400 bg-pink-950/60 border border-pink-800/60 px-2.5 py-0.5 rounded-full mb-1">
                  <span>Part 4 • Viết 2 Email (23 Điểm)</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Đọc thông báo của câu lạc bộ và viết 2 bức thư (1 thư cho bạn bè, 1 thư cho quản lý)
                </h3>
              </div>

              <button
                onClick={() => toggleSample('part4')}
                className="self-start sm:self-auto flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                {showSamples['part4'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSamples['part4'] ? 'Ẩn thư mẫu' : 'Xem thư mẫu'}</span>
              </button>
            </div>

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
                      1. Email Gửi Bạn Bè (Thân mật)
                    </span>
                    <WordCountBadge count={countWords(answers.part4_friend)} min={45} max={60} />
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
                      2. Email Gửi Quản Lý (Trang trọng)
                    </span>
                    <WordCountBadge count={countWords(answers.part4_manager)} min={120} max={150} />
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
          </div>
        )}

        {/* Action Button: Submit & Grade with AI */}
        <div className="pt-2">
          <button
            onClick={handleGradeSubmission}
            disabled={isEvaluating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold shadow-xl shadow-indigo-600/25 transition active:scale-98 flex items-center justify-center space-x-2 text-base"
          >
            {isEvaluating ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin text-amber-300" />
                <span>Gemini AI Đang Chấm & Sửa Lỗi Chi Tiết...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Nộp Bài & Nhận Điểm Số, Sửa Lỗi Ngữ Pháp Từ AI</span>
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
                    Chấm thi theo tiêu chuẩn Aptis ESOL & Khung tham chiếu CEFR
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
                  Tổng Điểm Bài Viết
                </span>
                <div className="flex items-baseline justify-center sm:justify-start space-x-2">
                  <span className="text-4xl font-black text-white">{evaluationReport.overallScore}</span>
                  <span className="text-slate-400 font-semibold text-lg">/ {evaluationReport.maxScore} điểm</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="px-5 py-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-center">
                  <span className="text-[10px] text-indigo-300 font-bold uppercase block">Cấp Độ CEFR</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-400">
                    Bậc {evaluationReport.cefrLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Comment */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Nhận Xét Tổng Quan:
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">
                {evaluationReport.overallComment}
              </p>
            </div>

            {/* Breakdown by Part */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 block font-semibold">Part 1</span>
                <span className="text-lg font-black text-cyan-400">{evaluationReport.partScores.part1.score} / {evaluationReport.partScores.part1.max}</span>
                <p className="text-[11px] text-slate-400 line-clamp-1">{evaluationReport.partScores.part1.feedback}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 block font-semibold">Part 2</span>
                <span className="text-lg font-black text-emerald-400">{evaluationReport.partScores.part2.score} / {evaluationReport.partScores.part2.max}</span>
                <p className="text-[11px] text-slate-400 line-clamp-1">{evaluationReport.partScores.part2.feedback}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 block font-semibold">Part 3</span>
                <span className="text-lg font-black text-purple-400">{evaluationReport.partScores.part3.score} / {evaluationReport.partScores.part3.max}</span>
                <p className="text-[11px] text-slate-400 line-clamp-1">{evaluationReport.partScores.part3.feedback}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 block font-semibold">Part 4</span>
                <span className="text-lg font-black text-pink-400">{evaluationReport.partScores.part4.score} / {evaluationReport.partScores.part4.max}</span>
                <p className="text-[11px] text-slate-400 line-clamp-1">{evaluationReport.partScores.part4.feedback}</p>
              </div>
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
                  <span>Gợi Ý Nâng Cấp Từ Vựng (B2 / C1):</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {evaluationReport.vocabularySuggestions.map((v, vIdx) => (
                    <div key={vIdx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold">
                        <span className="text-slate-400 line-through">{v.originalWord}</span>
                        <span className="text-slate-500">➔</span>
                        <span className="text-amber-300">{v.suggestedWord}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{v.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
              >
                Đã Hiểu & Đóng Lại
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= GEMINI API KEY MODAL ================= */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Cấu Hình Google Gemini API Key</span>
              </h3>
              <button onClick={() => setShowApiKeyModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Nhập API Key miễn phí từ <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-semibold">Google AI Studio</a> để mở khóa tính năng AI chấm thi, phát hiện lỗi ngữ pháp và viết lại câu chuẩn B2/C1.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Gemini API Key:</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Lưu API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BOTTOM TOPIC SWITCHER ================= */}
      <div className="pt-6 pb-12 border-t border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <button
            onClick={handlePrevTopic}
            disabled={currentTopicIdx <= 0}
            className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition ${
              currentTopicIdx <= 0
                ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white shadow-sm active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Chủ Đề Trước</span>
          </button>

          <div className="text-center">
            <span className="text-xs text-slate-300 font-medium">
              Chủ đề: <b className="text-indigo-400 font-bold">{activeTopic.title}</b> ({currentTopicIdx + 1}/{topics.length})
            </span>
          </div>

          <button
            onClick={handleNextTopic}
            disabled={currentTopicIdx >= topics.length - 1}
            className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition ${
              currentTopicIdx >= topics.length - 1
                ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-indigo-500/50 text-white shadow-md shadow-purple-600/20 active:scale-95'
            }`}
          >
            <span>Chủ Đề Kế Tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

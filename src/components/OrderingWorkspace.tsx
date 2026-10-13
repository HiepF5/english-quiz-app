import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Shuffle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  Trophy,
  ChevronRight,
  Lock,
  GripVertical,
  BookOpen,
  ArrowRight,
  ListOrdered,
  PlusCircle,
  Check,
  Flame,
  Award,
  Layers,
  Search,
  Key
} from 'lucide-react';
import type { SentenceItem, OrderingTopic, OrderingScoreRecord } from '../types/ordering';
import { ORDERING_TOPICS } from '../data/orderingTopics';

// Helper to shuffle array (Fisher-Yates) ensuring it's not already in sorted order
function shuffleSentences(sentences: SentenceItem[], keepFixedLead: boolean): SentenceItem[] {
  if (sentences.length <= 1) return [...sentences];

  let leadItem: SentenceItem | null = null;
  let itemsToShuffle: SentenceItem[] = [];

  if (keepFixedLead && sentences.some(s => s.isFixed || s.originalIndex === 1)) {
    leadItem = sentences.find(s => s.isFixed || s.originalIndex === 1) || sentences[0];
    itemsToShuffle = sentences.filter(s => s.id !== leadItem!.id);
  } else {
    itemsToShuffle = [...sentences];
  }

  // Shuffle itemsToShuffle
  let shuffled: SentenceItem[] = [];
  let attempts = 0;
  do {
    shuffled = [...itemsToShuffle];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    attempts++;
  } while (
    attempts < 10 &&
    shuffled.every((item, idx) => {
      const expectedIndex = leadItem ? idx + 2 : idx + 1;
      return item.originalIndex === expectedIndex;
    })
  );

  return leadItem ? [leadItem, ...shuffled] : shuffled;
}

// Helper to format bold markdown tags: **text** -> <strong>text</strong>
function renderMarkdownBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span
          key={index}
          className="font-bold text-amber-500 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/10 px-1 py-0.5 rounded border border-amber-500/20"
        >
          {part.slice(2, -2)}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export const OrderingWorkspace: React.FC = () => {
  // Topics list state (built-in + custom from localStorage)
  const [topics, setTopics] = useState<OrderingTopic[]>(() => {
    try {
      const savedCustom = localStorage.getItem('custom_ordering_topics');
      if (savedCustom) {
        const parsed: OrderingTopic[] = JSON.parse(savedCustom);
        return [...ORDERING_TOPICS, ...parsed];
      }
    } catch (e) {
      console.error('Error loading custom ordering topics:', e);
    }
    return ORDERING_TOPICS;
  });

  const [activeTopicId, setActiveTopicId] = useState<string>(ORDERING_TOPICS[0].id);
  const activeTopic = topics.find(t => t.id === activeTopicId) || topics[0];

  // Game configuration & Display options
  const [keepFixedLead, setKeepFixedLead] = useState<boolean>(true);
  const [showVietnamese, setShowVietnamese] = useState<boolean>(false);
  const [showKeywordHints, setShowKeywordHints] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reordering workspace state
  const [orderedList, setOrderedList] = useState<SentenceItem[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; total: number; percentage: number } | null>(null);
  const [showCorrectOrderModal, setShowCorrectOrderModal] = useState<boolean>(false);
  const [isAddCustomOpen, setIsAddCustomOpen] = useState<boolean>(false);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // History / Scores storage
  const [historyScores, setHistoryScores] = useState<Record<string, OrderingScoreRecord>>(() => {
    try {
      const saved = localStorage.getItem('ordering_scores_history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Custom topic modal form state
  const [customRawInput, setCustomRawInput] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customTitleVi, setCustomTitleVi] = useState<string>('');

  // Initialize or shuffle when topic changes or mode changes
  const initTopicOrdering = (topic: OrderingTopic, lockLead: boolean) => {
    const randomized = shuffleSentences(topic.sentences, lockLead && topic.hasFixedLead);
    setOrderedList(randomized);
    setIsSubmitted(false);
    setScoreResult(null);
  };

  useEffect(() => {
    if (activeTopic) {
      initTopicOrdering(activeTopic, keepFixedLead);
    }
  }, [activeTopic, keepFixedLead]);

  // Handle reordering via arrow buttons
  const moveSentence = (fromIndex: number, toIndex: number) => {
    if (isSubmitted) return;
    if (toIndex < 0 || toIndex >= orderedList.length) return;

    // Check if the fixed lead is locked at position 0
    if (keepFixedLead && activeTopic.hasFixedLead && (fromIndex === 0 || toIndex === 0)) {
      return;
    }

    const updated = [...orderedList];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setOrderedList(updated);
  };

  // Handle Drag and Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isSubmitted) return;
    if (keepFixedLead && activeTopic.hasFixedLead && index === 0) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    if (keepFixedLead && activeTopic.hasFixedLead && index === 0) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (keepFixedLead && activeTopic.hasFixedLead && index === 0) return;

    moveSentence(draggedIndex, index);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Evaluate order & record score
  const handleCheckOrder = () => {
    if (!activeTopic) return;

    let correctCount = 0;
    orderedList.forEach((item, currentIndex) => {
      if (item.originalIndex === currentIndex + 1) {
        correctCount++;
      }
    });

    const total = orderedList.length;
    const percentage = Math.round((correctCount / total) * 100);
    const isPerfect = correctCount === total;

    setScoreResult({ score: correctCount, total, percentage });
    setIsSubmitted(true);

    if (isPerfect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Save to history record
    const updatedHistory: Record<string, OrderingScoreRecord> = {
      ...historyScores,
      [activeTopic.id]: {
        topicId: activeTopic.id,
        topicTitle: activeTopic.title,
        lastScore: correctCount,
        maxScore: Math.max(historyScores[activeTopic.id]?.maxScore || 0, correctCount),
        totalSentences: total,
        percentage,
        completedAt: new Date().toISOString(),
        isPerfect: isPerfect || !!historyScores[activeTopic.id]?.isPerfect
      }
    };

    setHistoryScores(updatedHistory);
    localStorage.setItem('ordering_scores_history', JSON.stringify(updatedHistory));
  };

  // Shuffle current topic again
  const handleReshuffle = () => {
    if (!activeTopic) return;
    initTopicOrdering(activeTopic, keepFixedLead);
  };

  // Navigate to next topic
  const handleNextTopic = () => {
    const currentIndex = topics.findIndex(t => t.id === activeTopicId);
    if (currentIndex >= 0 && currentIndex < topics.length - 1) {
      setActiveTopicId(topics[currentIndex + 1].id);
    } else {
      setActiveTopicId(topics[0].id);
    }
  };

  // Categories list
  const categories = ['all', ...Array.from(new Set(topics.map(t => t.category)))];

  const filteredTopics = topics.filter(t => {
    const matchCat = filterCategory === 'all' || t.category === filterCategory;
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.titleVi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalCompleted = Object.values(historyScores).filter(h => h.isPerfect).length;

  // Add custom topic parser
  const handleSaveCustomTopic = () => {
    if (!customTitle.trim()) {
      alert('Vui lòng nhập tiêu đề cho bài tập!');
      return;
    }
    if (!customRawInput.trim()) {
      alert('Vui lòng nhập các câu tiếng Anh và tiếng Việt!');
      return;
    }

    // Parse lines: e.g. "1. It started early...\nSự kiện..."
    const rawLines = customRawInput.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedSentences: SentenceItem[] = [];
    let currentIdx = 1;

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      // Check if line starts with a number e.g. "1. " or "1)"
      const numMatch = line.match(/^(\d+)[.)]\s*(.*)$/);
      if (numMatch) {
        const enText = numMatch[2];
        const nextLine = rawLines[i + 1];
        let viText = '';
        if (nextLine && !nextLine.match(/^\d+[.)]/)) {
          viText = nextLine;
          i++; // skip next line as translation
        }
        parsedSentences.push({
          id: `custom-sent-${Date.now()}-${currentIdx}`,
          originalIndex: currentIdx,
          textEn: enText,
          textVi: viText,
          isFixed: currentIdx === 1
        });
        currentIdx++;
      } else if (line.length > 5) {
        parsedSentences.push({
          id: `custom-sent-${Date.now()}-${currentIdx}`,
          originalIndex: currentIdx,
          textEn: line,
          textVi: '',
          isFixed: currentIdx === 1
        });
        currentIdx++;
      }
    }

    if (parsedSentences.length < 3) {
      alert('Cần ít nhất 3 câu để tạo bài tập sắp xếp!');
      return;
    }

    const newTopic: OrderingTopic = {
      id: `custom-${Date.now()}`,
      title: customTitle,
      titleVi: customTitleVi || customTitle,
      category: 'Tự Soạn (Custom)',
      hasFixedLead: true,
      keywordChain: [],
      sentences: parsedSentences
    };

    const updatedTopics = [...topics, newTopic];
    setTopics(updatedTopics);

    // Save custom topics in localStorage
    const customOnly = updatedTopics.filter(t => !ORDERING_TOPICS.some(def => def.id === t.id));
    localStorage.setItem('custom_ordering_topics', JSON.stringify(customOnly));

    setActiveTopicId(newTopic.id);
    setIsAddCustomOpen(false);
    setCustomRawInput('');
    setCustomTitle('');
    setCustomTitleVi('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold tracking-wide">
              <ListOrdered className="w-4 h-4 text-indigo-400" />
              <span>Aptis ESOL Reading Part 2 • Luyện Sắp Xếp Trật Tự Câu</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Sắp Xếp Đoạn Văn Hoàn Chỉnh</span>
              <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                10 Chủ Đề Chuẩn
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Kéo thả hoặc nhấn nút mũi tên để sắp xếp các câu bị đảo trật tự thành một đoạn văn logic, mạch lạc.
              Khám phá <span className="text-amber-300 font-semibold">móc xích từ khóa liên kết (Cohesion Signals)</span> để chinh phục điểm tuyệt đối!
            </p>

            {/* Quick Stat Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>
                  Đạt điểm 100%: <strong className="text-white font-bold">{totalCompleted}</strong> / {topics.length} bài
                </span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Mỗi lần làm bài sẽ tự động đảo ngẫu nhiên</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => setIsAddCustomOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm Đề Mới (Custom)</span>
            </button>
            <button
              onClick={() => setShowCorrectOrderModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Xem Đoạn Mẫu Hoàn Chỉnh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: 2 Columns (Topic Selector & Workspace) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Topics Selector (1 Column) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Danh Sách Đề Bài ({topics.length})</span>
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm chủ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                    filterCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'all' ? 'Tất cả' : cat}
                </button>
              ))}
            </div>

            {/* List of Topic Cards */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredTopics.map((topic, idx) => {
                const isActive = topic.id === activeTopicId;
                const hist = historyScores[topic.id];

                return (
                  <div
                    key={topic.id}
                    onClick={() => setActiveTopicId(topic.id)}
                    className={`p-3 rounded-xl cursor-pointer border transition-all text-left relative ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {topic.title}
                        </h3>
                      </div>

                      {hist?.isPerfect && (
                        <span title="Hoàn thành xuất sắc 100%" className="text-amber-400 text-xs">
                          ⭐
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 pl-7">
                      {topic.titleVi}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pl-7">
                      <span>{topic.sentences.length} câu</span>
                      {hist ? (
                        <span className={hist.isPerfect ? 'text-emerald-500 font-bold' : 'text-amber-500'}>
                          Điểm: {hist.lastScore}/{hist.totalSentences} ({hist.percentage}%)
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600">Chưa làm</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content: Active Ordering Workspace (3 Columns) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Active Topic Header & Toolbar */}
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {activeTopic.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    • {activeTopic.sentences.length} câu cần sắp xếp
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
                  onClick={handleReshuffle}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition border border-slate-300 dark:border-slate-700"
                  title="Đảo thứ tự các câu ngẫu nhiên một lần nữa"
                >
                  <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Đảo Lại Thứ Tự</span>
                </button>

                <button
                  onClick={() => setShowVietnamese(prev => !prev)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    showVietnamese
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                  title="Hiển thị hoặc ẩn bản dịch tiếng Việt cho từng câu"
                >
                  {showVietnamese ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{showVietnamese ? 'Ẩn Dịch TV' : 'Hiện Dịch TV'}</span>
                </button>

                <button
                  onClick={() => setShowKeywordHints(prev => !prev)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    showKeywordHints
                      ? 'bg-amber-500 text-white border-amber-400 shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                  title="Bật gợi ý từ khóa móc xích logic"
                >
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>{showKeywordHints ? 'Tắt Gợi Ý' : 'Gợi Ý Từ Khóa'}</span>
                </button>

                {activeTopic.hasFixedLead && (
                  <button
                    onClick={() => {
                      setKeepFixedLead(prev => !prev);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                      keepFixedLead
                        ? 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                    }`}
                    title="Cố định câu đầu tiên (chuẩn thi Aptis) hoặc đảo toàn bộ câu"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{keepFixedLead ? 'Khóa Câu 1 (Aptis)' : 'Đảo Cả Câu 1'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Keyword Hints Banner (when toggled on) */}
            {showKeywordHints && activeTopic.rawKeywordsSummary && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Móc xích từ khóa gợi ý (Cohesion Chain):</strong>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {activeTopic.keywordChain.map((kw, i) => (
                      <React.Fragment key={i}>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-900 dark:text-amber-200 font-semibold text-[11px]">
                          {kw}
                        </span>
                        {i < activeTopic.keywordChain.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-amber-500/60" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Result Banner if submitted */}
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
                      ? 'Tuyệt vời! Bạn đã sắp xếp đúng 100%!'
                      : scoreResult.percentage >= 60
                      ? 'Khá tốt! Nhưng còn một vài vị trí chưa chính xác.'
                      : 'Chưa chính xác! Hãy kiểm tra lại các từ khóa liên kết.'}
                  </h3>
                  <p className="text-xs opacity-90 mt-0.5">
                    Đúng {scoreResult.score} / {scoreResult.total} vị trí câu. (Các câu màu xanh lá là đúng vị trí, màu đỏ cần xem lại).
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleReshuffle}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đảo Lại & Thử Lại</span>
                </button>
                <button
                  onClick={handleNextTopic}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md"
                >
                  <span>Chủ Đề Tiếp Theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Draggable Sentence Cards List */}
          <div className="space-y-3">
            {orderedList.map((sentence, index) => {
              const currentPosition = index + 1;
              const isCorrect = isSubmitted && sentence.originalIndex === currentPosition;
              const isWrong = isSubmitted && sentence.originalIndex !== currentPosition;
              const isLeadLocked = keepFixedLead && activeTopic.hasFixedLead && index === 0;

              return (
                <div
                  key={sentence.id}
                  draggable={!isSubmitted && !isLeadLocked}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative p-4 rounded-2xl border transition-all duration-200 select-none ${
                    draggedIndex === index
                      ? 'opacity-40 scale-[0.99] border-dashed border-indigo-500'
                      : dragOverIndex === index
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20'
                      : isCorrect
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500/60 shadow-sm'
                      : isWrong
                      ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-500/60 shadow-sm'
                      : isLeadLocked
                      ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-300 dark:border-slate-800 shadow-sm opacity-95'
                      : 'bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700 border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Position Badge & Drag Handle */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : isWrong
                            ? 'bg-rose-600 text-white'
                            : isLeadLocked
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isLeadLocked ? <Lock className="w-3.5 h-3.5" /> : currentPosition}
                      </div>

                      {!isSubmitted && !isLeadLocked && (
                        <div
                          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-400 p-0.5"
                          title="Kéo thả để đổi thứ tự"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Content (English text & Vietnamese Translation) */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {isLeadLocked && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            Câu mở đầu cố định (Given Lead)
                          </span>
                        )}

                        {isCorrect && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Đúng vị trí #{currentPosition}
                          </span>
                        )}

                        {isWrong && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Sai vị trí (Đáp án chuẩn: #{sentence.originalIndex})
                          </span>
                        )}

                        {showKeywordHints && sentence.keyword && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Key: {sentence.keyword}
                          </span>
                        )}
                      </div>

                      {/* English Sentence */}
                      <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                        {renderMarkdownBold(sentence.textEn)}
                      </p>

                      {/* Vietnamese Translation (Toggleable) */}
                      {(showVietnamese || isSubmitted) && sentence.textVi && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-100/70 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                          🇻🇳 {sentence.textVi}
                        </p>
                      )}
                    </div>

                    {/* Right Control: Arrow Buttons (Move Up / Down) */}
                    {!isSubmitted && !isLeadLocked && (
                      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                        <button
                          type="button"
                          onClick={() => moveSentence(index, index - 1)}
                          disabled={index <= (keepFixedLead && activeTopic.hasFixedLead ? 1 : 0)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition"
                          title="Di chuyển lên trên"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSentence(index, index + 1)}
                          disabled={index >= orderedList.length - 1}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition"
                          title="Di chuyển xuống dưới"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Footer */}
          <div className="sticky bottom-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>
                Kéo thả thẻ câu hoặc dùng mũi tên để đổi vị trí, sau đó bấm <strong>Kiểm Tra Kết Quả</strong>.
              </span>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {isSubmitted ? (
                <>
                  <button
                    onClick={handleReshuffle}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Làm Lại (Đảo Thứ Tự Mới)</span>
                  </button>

                  <button
                    onClick={handleNextTopic}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
                  >
                    <span>Bài Kế Tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCheckOrder}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kiểm Tra Kết Quả (Nộp Bài)</span>
                </button>
              )}
            </div>
          </div>

          {/* Logic Cohesion Chain Drawer / Card */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Bí kíp Aptis Reading Part 2: Móc xích logic giữa các câu</span>
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Mỗi câu trong đoạn văn luôn chứa một cụm từ đóng vai trò bắc cầu nối tiếp ý từ câu trước đó.
              Dưới đây là chuỗi từ khóa móc xích của bài này:
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {activeTopic.keywordChain.map((kw, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                    <span className="text-[10px] text-indigo-400 mr-1.5">#{idx + (activeTopic.hasFixedLead ? 2 : 1)}</span>
                    {kw}
                  </div>
                  {idx < activeTopic.keywordChain.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Full Coherent Paragraph Modal */}
      {showCorrectOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Đáp án chuẩn & Đoạn văn đầy đủ</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{activeTopic.title}</h3>
                <p className="text-xs text-slate-500">{activeTopic.titleVi}</p>
              </div>
              <button
                onClick={() => setShowCorrectOrderModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* List in correct order 1 -> N */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trình tự sắp xếp chuẩn (1 đến {activeTopic.sentences.length})</h4>
              {activeTopic.sentences
                .sort((a, b) => a.originalIndex - b.originalIndex)
                .map((s) => (
                  <div key={s.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                        {s.originalIndex}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {renderMarkdownBold(s.textEn)}
                      </p>
                    </div>
                    {s.textVi && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 pl-7 italic">
                        {s.textVi}
                      </p>
                    )}
                  </div>
                ))}
            </div>

            {/* Complete Coherent Text Block */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
              <h4 className="text-xs font-bold text-indigo-400">Đoạn văn hoàn chỉnh khi ghép lại:</h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeTopic.sentences
                  .sort((a, b) => a.originalIndex - b.originalIndex)
                  .map(s => s.textEn.replace(/\*\*/g, ''))
                  .join(' ')}
              </p>
            </div>

            <div className="text-right">
              <button
                onClick={() => setShowCorrectOrderModal(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
              >
                Đã Hiểu & Đóng Lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Topic Modal */}
      {isAddCustomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Tạo bài tập sắp xếp câu mới</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Nhập Đề Tự Soạn</h3>
              </div>
              <button
                onClick={() => setIsAddCustomOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tiêu đề Tiếng Anh:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: My Favorite Journey"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tiêu đề Tiếng Việt:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chuyến đi yêu thích của tôi"
                  value={customTitleVi}
                  onChange={(e) => setCustomTitleVi(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Dán nội dung các câu theo đúng thứ tự logic (Hệ thống sẽ tự đảo ngẫu nhiên khi luyện tập):
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Định dạng: Mỗi câu một dòng kèm số thứ tự (ví dụ: "1. Câu tiếng Anh...\nBản dịch...").
                </p>
                <textarea
                  rows={8}
                  placeholder={`1. In the morning, I woke up early to catch the train.\nVào buổi sáng, tôi thức dậy sớm để bắt chuyến tàu.\n\n2. The train arrived on time at the central station.\nTàu đến đúng giờ tại ga trung tâm.\n\n3. After that, I met my friends at the station entrance.\nSau đó, tôi đã gặp bạn bè ở cổng nhà ga.`}
                  value={customRawInput}
                  onChange={(e) => setCustomRawInput(e.target.value)}
                  className="w-full p-3 text-xs font-mono rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsAddCustomOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:opacity-80"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCustomTopic}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition shadow-md"
              >
                Lưu & Bắt Đầu Làm Bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Users,
  Shuffle,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Languages,
  BookOpen,
  Trophy,
  Flame,
  ChevronRight,
  ChevronLeft,
  Check,
  GraduationCap
} from 'lucide-react';
import type { OpinionScoreRecord } from '../types/opinion';
import { OPINION_TOPICS } from '../data/opinionTopics';

// Helper to shuffle array and ensure it's different from the original if possible
function getShuffledPermutation(current: number[]): number[] {
  const arr = [...current];
  let tries = 0;
  while (tries < 10) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // ensure at least some elements moved
    if (arr.some((val, idx) => val !== current[idx])) {
      return arr;
    }
    tries++;
  }
  return [1, 2, 3, 0];
}

const PARAGRAPH_COLORS = [
  {
    border: 'border-indigo-500/40 hover:border-indigo-400',
    bg: 'bg-indigo-950/25',
    badge: 'bg-indigo-600 text-white shadow-indigo-500/20 shadow-md',
    accentText: 'text-indigo-300 dark:text-indigo-400',
    ring: 'ring-indigo-500'
  },
  {
    border: 'border-emerald-500/40 hover:border-emerald-400',
    bg: 'bg-emerald-950/25',
    badge: 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-md',
    accentText: 'text-emerald-300 dark:text-emerald-400',
    ring: 'ring-emerald-500'
  },
  {
    border: 'border-amber-500/40 hover:border-amber-400',
    bg: 'bg-amber-950/25',
    badge: 'bg-amber-600 text-white shadow-amber-500/20 shadow-md',
    accentText: 'text-amber-300 dark:text-amber-400',
    ring: 'ring-amber-500'
  },
  {
    border: 'border-purple-500/40 hover:border-purple-400',
    bg: 'bg-purple-950/25',
    badge: 'bg-purple-600 text-white shadow-purple-500/20 shadow-md',
    accentText: 'text-purple-300 dark:text-purple-400',
    ring: 'ring-purple-500'
  }
];

const TOPIC_MNEMONIC_SUMMARIES: Record<string, Record<string, string>> = {
  'topic-1': {
    'James': 'Lần đầu đi xem (First time) ➔ Thất vọng thời tiết mưa (weather / sunshine) ➔ Thích ngày cuối gặp thần tượng (last day / favorite singers)',
    'Lisa': 'Tham gia hàng năm (every year) ➔ Không ấn tượng, bình thường (unremarkable / not impressed) ➔ Nghi ngờ sẽ quay lại (doubt come back)',
    'Robert': 'Thích nghe đa dạng thể loại nhạc (variety of genres) ➔ Chê vé đắt, khó chi trả (expensive / high cost / difficult to afford)',
    'Christina': 'Đi diễn cùng ban nhạc (My band) ➔ Gặp lại cựu thành viên/bạn cũ (ex-band members / old friends) ➔ Địa điểm xa đường chính (location / venue far)'
  },
  'topic-2': {
    'Jose': 'Vốn không thích thể thao ➔ Thích mạo hiểm ngay lần thử đầu tiên (first attempt / fell in love) ➔ Cần tập luyện kỹ (training is important)',
    'Sira': 'Lặn tự do (free-diving) ➔ Tận hưởng thiên nhiên hoang dã (nature / surrounded by fish) ➔ Ước được chơi thường xuyên hơn (wishes do more often)',
    'Bao': 'Học thể dục ở trường là lãng phí ➔ Né tránh mọi môn thể thao (avoid doing any sports) ➔ Chỉ thích đọc sách (reading books)',
    'Marisol': 'Là phi công ➔ Thể thao mạo hiểm là không cần thiết, tự ném mình vào nguy hiểm (not necessary / danger) ➔ Thích thể thao truyền thống (traditional sports)'
  },
  'topic-3': {
    'Sarah': 'Chơi board game từ nhỏ ➔ Trò chơi truyền thống đơn giản hơn nhiều (traditional games were much simpler) ➔ Thích chơi cùng con',
    'William': 'Thích chơi ngoài trời cùng bạn bè thuở nhỏ (playing with other children / peers) ➔ Định hình tính cách hòa đồng, kết nối',
    'Sophia': 'Ít vận động, đắm chìm vào sách vở từ bé (preferred reading books) ➔ Lớn lên thích chơi game tương tác máy tính (modern games)',
    'Jack': 'Thích ra ngoài, hay ước được ra ngoài ngày u ám (wished spend time outdoors) ➔ Được mẹ tặng màu vẽ nên mê hội họa/nghệ thuật (doing arts)'
  },
  'topic-4': {
    'Boyd': 'Giúp đỡ cộng đồng địa phương (local communities) ➔ Hiểu thêm về truyền thống, văn hóa địa phương (good for culture)',
    'Chirish': 'Làm tình nguyện phát triển kỹ năng mềm cho sự nghiệp tương lai (advance career / soft skills) ➔ Kết bạn mới (make friends)',
    'Noah': 'Quá bận rộn công việc, không có thời gian trực tiếp (busy with work) ➔ Ủng hộ, giúp đỡ bằng tiền quyên góp (giving money)',
    'Chinua': 'Đã nghỉ hưu đi xây nhà thiện nguyện (retired / build houses) ➔ Cơ hội đi du lịch (reason to travel) ➔ Rèn luyện thể chất/sức khỏe (physical benefits)'
  },
  'topic-5': {
    'Olivia': 'Làm việc không công (working for free / volunteering) ➔ Nhận được nhiều lợi ích về kiến thức hữu ích (benefited from working for free)',
    'Chirish': 'Chỉ muốn làm giáo viên, không muốn đổi nghề khác (not want to change to other careers) ➔ Thích kỳ thực tập/tập huấn (enjoyed working when training)',
    'Emma': 'Thích làm việc bằng tay chân (doing things with hands / pipe leaks, screws) ➔ Tiếc vì học đại học quá dài (training was too long)',
    'Grace': 'Thiếu kinh nghiệm nên rất khó xin việc đầu tiên (hard to get first job) ➔ Thích môi trường làm việc linh hoạt (flexible work environment / hybrid)'
  }
};

export const OpinionWorkspace: React.FC = () => {
  // Active Topic selection
  const [activeTopicId, setActiveTopicId] = useState<string>(OPINION_TOPICS[0].id);
  const activeTopic = OPINION_TOPICS.find(t => t.id === activeTopicId) || OPINION_TOPICS[0];

  // Core features requested:
  // 1. Hide name mode (default: true)
  const [hideNames, setHideNames] = useState<boolean>(true);

  // 2. Shuffle paragraphs: Mapping of slot (0:A, 1:B, 2:C, 3:D) -> original personIndex
  const [paragraphOrder, setParagraphOrder] = useState<number[]>([0, 1, 2, 3]);

  // Temporary peek names toggle (so user can check who is behind ABCD if needed)
  const [showOriginalNamesPeek, setShowOriginalNamesPeek] = useState<boolean>(false);

  // Display toggles
  const [showVietnamese, setShowVietnamese] = useState<boolean>(false);
  const [showMnemonic, setShowMnemonic] = useState<boolean>(true);
  const [practiceMode, setPracticeMode] = useState<'practice' | 'exam'>('practice');

  // Per-question open mnemonic hints state
  const [openHints, setOpenHints] = useState<Record<number, boolean>>({});

  // Answers state: questionId -> selectedSlotIndex (0..3)
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; total: number; percentage: number } | null>(null);

  // Hover highlight sync between option and paragraph card
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  // Notification message for shuffle
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Score history
  const [historyScores, setHistoryScores] = useState<Record<string, OpinionScoreRecord>>(() => {
    try {
      const saved = localStorage.getItem('opinion_matching_scores');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Reset answers when switching topic
  useEffect(() => {
    setUserAnswers({});
    setIsSubmitted(false);
    setScoreResult(null);
    setParagraphOrder([0, 1, 2, 3]);
  }, [activeTopicId]);

  // Show temporary toast message
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Shuffle paragraph order
  const handleShuffle = () => {
    const newOrder = getShuffledPermutation(paragraphOrder);
    setParagraphOrder(newOrder);
    setUserAnswers({});
    setIsSubmitted(false);
    setScoreResult(null);
    triggerToast('🔀 Đã đảo thứ tự 4 đoạn văn! Vị trí Đoạn A, B, C, D đã được xáo trộn.');
  };

  // Reset order to original [0, 1, 2, 3]
  const handleResetOrder = () => {
    setParagraphOrder([0, 1, 2, 3]);
    setUserAnswers({});
    setIsSubmitted(false);
    setScoreResult(null);
    triggerToast('🔄 Đã khôi phục thứ tự đoạn văn ban đầu.');
  };

  // Select an option (slotIndex: 0=A, 1=B, 2=C, 3=D)
  const handleSelectOption = (questionId: number, slotIndex: number) => {
    if (isSubmitted && practiceMode === 'exam') return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: slotIndex
    }));
  };

  // Submit test (for Exam mode)
  const handleSubmitExam = () => {
    let correctCount = 0;
    activeTopic.questions.forEach(q => {
      const correctSlotIndex = paragraphOrder.indexOf(q.correctPersonIndex);
      if (userAnswers[q.id] === correctSlotIndex) {
        correctCount++;
      }
    });

    const total = activeTopic.questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const isPerfect = correctCount === total;

    setScoreResult({ score: correctCount, total, percentage });
    setIsSubmitted(true);

    if (isPerfect) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    const updatedHistory: Record<string, OpinionScoreRecord> = {
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
    try {
      localStorage.setItem('opinion_matching_scores', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error('Error saving score:', err);
    }
  };

  const handleNextTopic = () => {
    const currentIndex = OPINION_TOPICS.findIndex(t => t.id === activeTopicId);
    if (currentIndex >= 0 && currentIndex < OPINION_TOPICS.length - 1) {
      setActiveTopicId(OPINION_TOPICS[currentIndex + 1].id);
    } else {
      setActiveTopicId(OPINION_TOPICS[0].id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevTopic = () => {
    const currentIndex = OPINION_TOPICS.findIndex(t => t.id === activeTopicId);
    if (currentIndex > 0) {
      setActiveTopicId(OPINION_TOPICS[currentIndex - 1].id);
    } else {
      setActiveTopicId(OPINION_TOPICS[OPINION_TOPICS.length - 1].id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const letters = ['A', 'B', 'C', 'D'];

  // Calculate instant correct count in practice mode
  const practiceCorrectCount = useMemo(() => {
    let count = 0;
    activeTopic.questions.forEach(q => {
      const correctSlotIndex = paragraphOrder.indexOf(q.correctPersonIndex);
      if (userAnswers[q.id] === correctSlotIndex) {
        count++;
      }
    });
    return count;
  }, [userAnswers, paragraphOrder, activeTopic]);

  const answeredCount = Object.keys(userAnswers).length;
  const isOrderShuffled = paragraphOrder.some((val, idx) => val !== idx);
  const totalPerfectCount = Object.values(historyScores).filter(h => h.isPerfect).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-400/40 flex items-center space-x-3 text-sm font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold tracking-wide">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Aptis ESOL Reading Part 4 • Nối Ý Kiến 4 Người (Four People Opinion Matching)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Nối Ý Kiến 4 Người • Chế Độ Ẩn Tên & Đảo Đoạn ABCD</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Luyện kỹ năng đọc hiểu & định vị thông tin cốt lõi (Skimming & Scanning). Khi <strong>ẩn tên</strong> và <strong>đảo vị trí các đoạn</strong>, 
              bạn sẽ chọn theo đúng nội dung của đoạn văn thay vì học vẹt tên nhân vật!
            </p>

            {/* Quick Stat Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>
                  Đã đạt điểm tuyệt đối: <strong className="text-white font-bold">{totalPerfectCount}</strong> / {OPINION_TOPICS.length} bài thi
                </span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>
                  Trạng thái: <strong className={isOrderShuffled ? 'text-amber-300 font-bold' : 'text-emerald-400 font-bold'}>
                    {isOrderShuffled ? 'Đoạn văn đã bị xáo trộn' : 'Thứ tự đoạn văn mặc định'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Practice vs Exam Mode Toggle */}
          <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
            <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800">
              <button
                onClick={() => setPracticeMode('practice')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  practiceMode === 'practice'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Luyện Tập (Hiện Đáp Án Tức Thì)</span>
              </button>
              <button
                onClick={() => {
                  setPracticeMode('exam');
                  setIsSubmitted(false);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  practiceMode === 'exam'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Thi Tính Điểm</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Switcher Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        {OPINION_TOPICS.map((topic, index) => {
          const isActive = topic.id === activeTopic.id;
          const score = historyScores[topic.id];
          return (
            <button
              key={topic.id}
              onClick={() => setActiveTopicId(topic.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400/50 shadow-lg shadow-indigo-500/25 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {index + 1}
              </span>
              <span>{topic.title}</span>
              {score && (
                <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  score.isPerfect
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {score.lastScore}/{score.totalQuestions}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Control Toolbar: Hide Name, Shuffle, Reset, Bilingual, Mnemonic */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Hide Names & Shuffle Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Hide Name Mode Toggle */}
          <button
            onClick={() => setHideNames(!hideNames)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition shadow-sm ${
              hideNames
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 ring-1 ring-indigo-500/30'
                : 'bg-slate-800/90 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Bật/Tắt chế độ ẩn tên nhân vật, chỉ hiển thị ABCD"
          >
            {hideNames ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
            <span>Chế độ ẩn tên ABCD: {hideNames ? 'ĐANG BẬT' : 'Tắt (Hiện Tên)'}</span>
          </button>

          {/* Shuffle Paragraphs Button */}
          <button
            onClick={handleShuffle}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600/25 hover:bg-purple-600/35 text-purple-200 border border-purple-500/40 transition active:scale-95 shadow-sm"
            title="Xáo trộn ngẫu nhiên thứ tự 4 đoạn văn"
          >
            <Shuffle className="w-4 h-4 text-purple-400" />
            <span>Đảo Thứ Tự Các Đoạn</span>
          </button>

          {/* Reset Order Button */}
          {isOrderShuffled && (
            <button
              onClick={handleResetOrder}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Khôi phục thứ tự các đoạn ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Thứ tự gốc</span>
            </button>
          )}

          {/* Peek Original Names Toggle (only when hideNames is ON) */}
          {hideNames && (
            <button
              onClick={() => setShowOriginalNamesPeek(!showOriginalNamesPeek)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                showOriginalNamesPeek
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-300'
              }`}
              title="Xem tên gốc đối chiếu của từng đoạn"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showOriginalNamesPeek ? 'Ẩn đối chiếu tên gốc' : 'Soi tên gốc'}</span>
            </button>
          )}
        </div>

        {/* Right: Bilingual & Mnemonic Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bilingual Toggle */}
          <button
            onClick={() => setShowVietnamese(!showVietnamese)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              showVietnamese
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{showVietnamese ? '🇻🇳 Song ngữ Bật' : '🇬🇧 Tiếng Anh'}</span>
          </button>

          {/* Mnemonic Toggle */}
          <button
            onClick={() => {
              const next = !showMnemonic;
              setShowMnemonic(next);
              triggerToast(
                next
                  ? '💡 Đã BẬT Bảng mẹo nhớ 4 đoạn văn và gợi ý cho cả 7 câu hỏi!'
                  : '💡 Đã TẮT hiển thị mẹo nhớ.'
              );
            }}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition shadow-sm ${
              showMnemonic
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Bật/Tắt hiển thị mẹo nhớ nhanh cho bài đọc và câu hỏi"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{showMnemonic ? '💡 Mẹo nhớ: ĐANG BẬT' : '💡 Mẹo nhớ: Đang Tắt'}</span>
          </button>
        </div>

      </div>

      {/* Main Content Layout: 4 Paragraphs on Top, Questions Below */}
      <div className="space-y-6">

        {/* Topic Mnemonic Cheat Sheet Panel (when showMnemonic is ON) */}
        {showMnemonic && (
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-slate-900 to-indigo-950/40 p-4 sm:p-5 shadow-xl space-y-3 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wide">
                  Bảng Mẹo Nhớ Nhanh 4 Đoạn Văn • {activeTopic.titleVi}
                </h3>
              </div>
              <span className="text-[11px] text-amber-400/90 font-medium">
                {hideNames ? 'Mẹo định vị ứng với Đoạn A, B, C, D (đã khớp thứ tự)' : 'Mẹo ghi nhớ từng nhân vật'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {paragraphOrder.map((origPersonIndex, slotIdx) => {
                const letter = letters[slotIdx];
                const personName = activeTopic.people[origPersonIndex];
                const hint = TOPIC_MNEMONIC_SUMMARIES[activeTopic.id]?.[personName] || 'Đọc kỹ nội dung đoạn để tìm từ khóa';
                const color = PARAGRAPH_COLORS[slotIdx];

                return (
                  <div
                    key={`mnemonic-card-${slotIdx}`}
                    className={`p-3 rounded-xl bg-slate-900/90 border border-amber-500/25 space-y-1.5 transition hover:border-amber-400/50 ${
                      hoveredSlot === slotIdx ? `ring-1 ${color.ring}` : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md font-black text-xs ${color.badge}`}>
                        Đoạn {letter} {hideNames ? '' : `• ${personName}`}
                      </span>
                      {hideNames && showOriginalNamesPeek && (
                        <span className="text-[10px] text-amber-300/80 font-medium">({personName})</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                      {hint}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 1: The 4 Reading Paragraphs (A, B, C, D) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                4 Đoạn Văn Bài Đọc: {activeTopic.titleVi}
              </h2>
            </div>
            <span className="text-xs text-slate-400 italic">
              {hideNames ? 'Tên nhân vật đã được ẩn thành Đoạn A, B, C, D' : 'Đoạn văn kèm tên nhân vật'}
            </span>
          </div>

          {/* 4 Paragraph Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paragraphOrder.map((origPersonIndex, slotIndex) => {
              const paragraph = activeTopic.paragraphs[origPersonIndex];
              const slotLetter = letters[slotIndex];
              const color = PARAGRAPH_COLORS[slotIndex];
              const isHovered = hoveredSlot === slotIndex;

              return (
                <div
                  key={`${activeTopic.id}-slot-${slotIndex}`}
                  className={`relative rounded-2xl border p-4.5 transition-all duration-300 flex flex-col justify-between ${color.border} ${color.bg} ${
                    isHovered ? `ring-2 ${color.ring} scale-[1.01] shadow-xl` : 'shadow-md'
                  }`}
                >
                  <div>
                    {/* Paragraph Header: Badge A/B/C/D + Name/Label */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${color.badge}`}>
                          {slotLetter}
                        </span>
                        <div>
                          <div className={`text-xs font-bold uppercase tracking-wider ${color.accentText}`}>
                            {hideNames ? `Đoạn ${slotLetter}` : `Đoạn ${slotLetter} • ${paragraph.personName}`}
                          </div>
                          {hideNames && showOriginalNamesPeek && (
                            <div className="text-[10px] text-amber-300 font-medium">
                              (Tên gốc: {paragraph.personName})
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60 font-semibold">
                        Vị trí #{slotIndex + 1}
                      </span>
                    </div>

                    {/* Paragraph English Body */}
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                      {paragraph.contentEn}
                    </p>

                    {/* Paragraph Vietnamese Translation (if toggled) */}
                    {showVietnamese && paragraph.contentVi && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                        <div className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1 mb-1">
                          <Languages className="w-3 h-3" />
                          <span>Dịch Tiếng Việt:</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-300 italic leading-relaxed">
                          {paragraph.contentVi}
                        </p>
                      </div>
                    )}

                    {/* Paragraph Quick Mnemonic (if showMnemonic is ON) */}
                    {showMnemonic && (
                      <div className="mt-3 pt-2.5 border-t border-amber-500/20 bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/25 animate-fadeIn">
                        <div className="text-[10px] font-bold text-amber-400 flex items-center space-x-1 mb-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Mẹo nhớ Đoạn {slotLetter}:</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-amber-200/95 leading-relaxed font-medium">
                          {TOPIC_MNEMONIC_SUMMARIES[activeTopic.id]?.[paragraph.personName] || 'Đọc kỹ nội dung đoạn để tìm từ khóa'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer clue indicator */}
                  <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Aptis Part 4</span>
                    <span className="text-indigo-400/80 font-medium">Đoạn {slotLetter}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: The 7 Questions */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  7 Câu Hỏi Nối Ý Kiến
                </span>
                <span className="text-xs text-slate-400">
                  {practiceMode === 'practice'
                    ? `Đã trả lời: ${answeredCount}/7 • Đúng: ${practiceCorrectCount}/7`
                    : `Đã làm: ${answeredCount}/7 câu`}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1.5">
                Chọn đoạn văn (A, B, C, D) tương ứng với ý kiến trong từng câu hỏi
              </h3>
            </div>

            {practiceMode === 'exam' && !isSubmitted && (
              <button
                onClick={handleSubmitExam}
                disabled={answeredCount === 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition disabled:opacity-50"
              >
                Nộp Bài Tính Điểm ({answeredCount}/7)
              </button>
            )}
          </div>

          {/* Result Banner if submitted in Exam mode */}
          {practiceMode === 'exam' && isSubmitted && scoreResult && (
            <div className={`p-6 rounded-2xl border animate-fadeIn ${
              scoreResult.percentage === 100
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200'
            }`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl ${
                    scoreResult.percentage === 100
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  }`}>
                    {scoreResult.percentage === 100 ? <Trophy className="w-8 h-8" /> : `${scoreResult.score}`}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white">
                      {scoreResult.percentage === 100 ? 'Tuyệt vời! Đạt 100% Điểm' : 'Kết Quả Bài Làm'}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Bạn đã trả lời đúng <strong>{scoreResult.score} / {scoreResult.total}</strong> câu ({scoreResult.percentage}%).
                      {isOrderShuffled && ' (Đã hoàn thành ở chế độ đảo đoạn ngẫu nhiên!)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setUserAnswers({});
                      setIsSubmitted(false);
                      setScoreResult(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition"
                  >
                    Làm Lại
                  </button>
                  <button
                    onClick={handleNextTopic}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1"
                  >
                    <span>Bài Tiếp Theo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List of 7 Questions */}
          <div className="space-y-5">
            {activeTopic.questions.map((q, qIndex) => {
              // The slot index in the current shuffled order where the correct person is
              const correctSlotIndex = paragraphOrder.indexOf(q.correctPersonIndex);
              const selectedSlot = userAnswers[q.id];
              const isAnswered = selectedSlot !== undefined;
              const isCorrect = isAnswered && selectedSlot === correctSlotIndex;

              const showFeedback = (practiceMode === 'practice' && isAnswered) || (practiceMode === 'exam' && isSubmitted);

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-4.5 sm:p-5 transition-all ${
                    showFeedback
                      ? isCorrect
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/80'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-black shrink-0 mt-0.5">
                        Câu {q.questionNumber || qIndex + 1}
                      </span>
                      <p className="text-sm sm:text-base font-bold text-white leading-snug">
                        {q.question}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {q.mnemonicHint && (
                        <button
                          type="button"
                          onClick={() => setOpenHints(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-sm ${
                            (showMnemonic || openHints[q.id])
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 ring-1 ring-amber-500/30'
                              : 'bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40'
                          }`}
                          title="Bật/Tắt gợi ý mẹo nhớ cho câu này"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Mẹo nhớ</span>
                        </button>
                      )}

                      {showFeedback && (
                        <span>
                          {isCorrect ? (
                            <div className="flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Chính xác</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30">
                              <XCircle className="w-4 h-4" />
                              <span>Chưa đúng</span>
                            </div>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Mnemonic Hint (visible if global showMnemonic is ON OR user clicked Mẹo nhớ for this question) */}
                  {(showMnemonic || openHints[q.id]) && q.mnemonicHint && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start space-x-2.5 animate-fadeIn">
                      <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300">💡 Gợi ý mẹo tìm nhanh: </span>
                        <span className="text-amber-200/95 leading-relaxed font-medium">{q.mnemonicHint}</span>
                      </div>
                    </div>
                  )}

                  {/* 4 Options Grid (A, B, C, D) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
                    {paragraphOrder.map((origPersonIdx, slotIdx) => {
                      const slotLetter = letters[slotIdx];
                      const personName = activeTopic.people[origPersonIdx];
                      const isSelected = selectedSlot === slotIdx;
                      const isThisCorrect = slotIdx === correctSlotIndex;

                      let buttonStyle = 'bg-slate-800/70 border-slate-700/70 text-slate-200 hover:bg-slate-800 hover:border-slate-600';

                      if (showFeedback) {
                        if (isThisCorrect) {
                          buttonStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold ring-1 ring-emerald-500/50';
                        } else if (isSelected && !isThisCorrect) {
                          buttonStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold';
                        } else {
                          buttonStyle = 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60';
                        }
                      } else if (isSelected) {
                        buttonStyle = 'bg-indigo-600/30 border-indigo-500 text-indigo-100 font-bold ring-2 ring-indigo-500/60 shadow-md';
                      }

                      return (
                        <button
                          key={slotIdx}
                          disabled={practiceMode === 'exam' && isSubmitted}
                          onClick={() => handleSelectOption(q.id, slotIdx)}
                          onMouseEnter={() => setHoveredSlot(slotIdx)}
                          onMouseLeave={() => setHoveredSlot(null)}
                          className={`flex items-center space-x-2.5 p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-150 active:scale-95 ${buttonStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs shrink-0 ${
                              showFeedback && isThisCorrect
                                ? 'bg-emerald-500 text-white'
                                : showFeedback && isSelected && !isThisCorrect
                                ? 'bg-rose-500 text-white'
                                : isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-700/70 text-slate-300'
                            }`}
                          >
                            {slotLetter}
                          </span>

                          <span className="truncate">
                            {hideNames ? `Đoạn ${slotLetter}` : personName}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation & Mnemonic (visible in Practice mode when answered or after Exam submit) */}
                  {showFeedback && (
                    <div className="mt-4 pt-3.5 border-t border-slate-800 text-xs sm:text-sm space-y-2.5 animate-fadeIn">
                      <div className="flex flex-wrap items-center gap-2 font-bold">
                        <span className="text-emerald-400 flex items-center space-x-1">
                          <Check className="w-4 h-4" />
                          <span>Đáp án đúng: Đoạn {letters[correctSlotIndex]}</span>
                        </span>
                        <span className="text-slate-400">
                          (Nhân vật tương ứng: <strong className="text-slate-200">{activeTopic.people[q.correctPersonIndex]}</strong>)
                        </span>
                      </div>

                      {/* Explanation quote */}
                      <div className="text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        {q.explanation}
                      </div>

                      {/* Mnemonic Hint */}
                      {showMnemonic && q.mnemonicHint && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 flex items-start space-x-2">
                          <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                          <div>
                            <strong className="font-bold">Mẹo ghi nhớ câu này: </strong>
                            <span>{q.mnemonicHint}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Bottom Action Footer for Exam Mode */}
          {practiceMode === 'exam' && !isSubmitted && (
            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Hãy hoàn thành tất cả 7 câu trước khi nộp bài
              </span>
              <button
                onClick={handleSubmitExam}
                disabled={answeredCount === 0}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/20 transition disabled:opacity-50"
              >
                Nộp Bài Tính Điểm ({answeredCount}/7 câu)
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Navigation Footer: Prev / Next Topic */}
      <div className="flex items-center justify-between pt-4 pb-8">
        <button
          onClick={handlePrevTopic}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Bài Trước</span>
        </button>

        <div className="text-xs text-slate-400 font-semibold">
          Chủ đề {activeTopic.topicNumber} / {OPINION_TOPICS.length}: {activeTopic.title}
        </div>

        <button
          onClick={handleNextTopic}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-md"
        >
          <span>Bài Tiếp Theo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

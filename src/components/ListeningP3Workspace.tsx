import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Headphones,
  Play,
  Square,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Trophy,
  Users,
  User,
  FileText,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Dices,
  Lightbulb
} from 'lucide-react';
import type { ListeningP3Topic, P3Answer, ListeningP3ScoreRecord } from '../types/listeningP3';
import p3Data from '../data/aptis_listening_part3.json';
import { speakSingleSentence, stopSpeaking } from '../utils/speech';

export const ListeningP3Workspace: React.FC = () => {
  const topics: ListeningP3Topic[] = (p3Data as any).topics || [];
  const [activeTopicId, setActiveTopicId] = useState<string>(topics[0]?.id || '');
  const activeTopic = topics.find(t => t.id === activeTopicId) || topics[0];

  // Mode: 'exam' (max 2 listens, transcript hidden until submit) | 'practice' (unlimited, can peek script)
  const [mode, setMode] = useState<'exam' | 'practice'>('practice');

  // Display style: 'dropdown' (like user's exam screenshot) vs 'buttons'
  const [inputStyle, setInputStyle] = useState<'dropdown' | 'buttons'>('dropdown');

  // Rule: Shuffle option order toggle (does NOT change question order)
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(false);
  const [optionsSeed, setOptionsSeed] = useState<number>(0);

  // Active options order (Man, Woman, Both)
  const activeOptionsList = useMemo<P3Answer[]>(() => {
    const base: P3Answer[] = ['man', 'woman', 'both'];
    if (!shuffleOptions) return base;
    const variants: P3Answer[][] = [
      ['woman', 'man', 'both'],
      ['both', 'woman', 'man'],
      ['woman', 'both', 'man'],
      ['both', 'man', 'woman'],
      ['man', 'both', 'woman']
    ];
    return variants[optionsSeed % variants.length];
  }, [shuffleOptions, optionsSeed]);

  // Answers: questionId -> 'man' | 'woman' | 'both'
  const [userAnswers, setUserAnswers] = useState<Record<number, P3Answer>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; total: number; percentage: number } | null>(null);

  // Audio / Speech state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [listenCount, setListenCount] = useState<number>(0);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showScript, setShowScript] = useState<boolean>(false);
  const [showVietnamese, setShowVietnamese] = useState<boolean>(false);

  // User preference: Option to hide audio player completely for distraction-free exam practice
  const [showAudioPlayer, setShowAudioPlayer] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aptis_listening_p3_show_audio');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleAudioPlayer = () => {
    setShowAudioPlayer(prev => {
      const next = !prev;
      try {
        localStorage.setItem('aptis_listening_p3_show_audio', String(next));
      } catch {}
      if (!next) {
        stopSpeaking();
        setIsPlaying(false);
        isPlayingRef.current = false;
        setCurrentTurnIndex(-1);
      }
      return next;
    });
  };

  // User setting to show or hide Key Hint / Mnemonic Poem
  const [showKeyHint, setShowKeyHint] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aptis_listening_p3_show_key_hint');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const toggleKeyHint = () => {
    setShowKeyHint(prev => {
      const next = !prev;
      try {
        localStorage.setItem('aptis_listening_p3_show_key_hint', String(next));
      } catch {}
      return next;
    });
  };

  // User setting to hide topic title/keywords and only show topic numbers (Đề 1, Đề 2, ...)
  const [hideTopicName, setHideTopicName] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aptis_listening_p3_hide_topic_name');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const toggleHideTopicName = () => {
    setHideTopicName(prev => {
      const next = !prev;
      try {
        localStorage.setItem('aptis_listening_p3_hide_topic_name', String(next));
      } catch {}
      return next;
    });
  };

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // Audio element ref if audioUrl exists
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  // History
  const [history, setHistory] = useState<Record<string, ListeningP3ScoreRecord>>(() => {
    try {
      const saved = localStorage.getItem('aptis_listening_p3_history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Current topic index (0-based)
  const currentTopicIdx = topics.findIndex(t => t.id === activeTopicId);

  // Reset when topic changes
  useEffect(() => {
    stopSpeaking();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentTurnIndex(-1);
    setUserAnswers({});
    setIsSubmitted(false);
    setScoreResult(null);
    setListenCount(0);
    setSecondsElapsed(0);
    setShowScript(false);
  }, [activeTopicId]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (!isSubmitted) {
      interval = setInterval(() => {
        setSecondsElapsed(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSubmitted]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Format seconds mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // Switch to next or previous topic
  const handlePrevTopic = () => {
    if (currentTopicIdx > 0) {
      setActiveTopicId(topics[currentTopicIdx - 1].id);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleNextTopic = () => {
    if (currentTopicIdx < topics.length - 1) {
      setActiveTopicId(topics[currentTopicIdx + 1].id);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Rule: "Làm bài thi đổi đề" - Pick a random test from 15 sets
  const handleRandomTopic = () => {
    if (topics.length <= 1) return;
    const otherTopics = topics.filter(t => t.id !== activeTopicId);
    const randomChoice = otherTopics[Math.floor(Math.random() * otherTopics.length)];
    if (randomChoice) {
      setActiveTopicId(randomChoice.id);
      if (shuffleOptions) {
        setOptionsSeed(prev => prev + 1);
      }
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Play full dialogue using Web Speech API sequentially
  const playFullDialogueTTS = () => {
    if (!activeTopic) return;
    if (mode === 'exam' && listenCount >= 2) {
      alert('Ở chế độ Thi thật, bạn chỉ được nghe tối đa 2 lần!');
      return;
    }

    stopSpeaking();
    setIsPlaying(true);
    isPlayingRef.current = true;
    setListenCount(prev => prev + 1);

    let index = 0;

    const speakNextTurn = () => {
      if (!isPlayingRef.current || index >= activeTopic.dialogue.length) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        setCurrentTurnIndex(-1);
        return;
      }

      const turn = activeTopic.dialogue[index];
      setCurrentTurnIndex(index);

      speakSingleSentence(turn.text, turn.speaker, playbackSpeed, () => {
        index++;
        setTimeout(() => {
          speakNextTurn();
        }, 400);
      });
    };

    speakNextTurn();
  };

  const stopAudio = () => {
    stopSpeaking();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentTurnIndex(-1);
  };

  const handleSelectOption = (questionId: number, answer: P3Answer) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    if (!activeTopic) return;
    const answeredCount = Object.keys(userAnswers).length;
    const totalCount = activeTopic.questions.length;

    if (answeredCount < totalCount) {
      const confirmSubmit = window.confirm(
        `Bạn mới chọn câu trả lời cho ${answeredCount}/${totalCount} nhận định. Bạn có chắc chắn muốn nộp bài không?`
      );
      if (!confirmSubmit) return;
    }

    stopAudio();

    let score = 0;
    activeTopic.questions.forEach(q => {
      if (userAnswers[q.id] === q.correct) {
        score++;
      }
    });

    const percentage = Math.round((score / totalCount) * 100);
    setScoreResult({ score, total: totalCount, percentage });
    setIsSubmitted(true);
    setShowScript(true);

    const record: ListeningP3ScoreRecord = {
      topicId: activeTopic.id,
      topicTitle: activeTopic.title,
      score,
      total: totalCount,
      percentage,
      completedAt: new Date().toISOString()
    };

    const newHistory = { ...history, [activeTopic.id]: record };
    setHistory(newHistory);
    try {
      localStorage.setItem('aptis_listening_p3_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error(e);
    }

    if (percentage >= 75) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleRetake = () => {
    stopAudio();
    setUserAnswers({});
    setIsSubmitted(false);
    setScoreResult(null);
    setListenCount(0);
    setSecondsElapsed(0);
    setShowScript(false);
    if (shuffleOptions) {
      setOptionsSeed(prev => prev + 1);
    }
  };

  const getOptionLabel = (opt: P3Answer) => {
    if (opt === 'man') return 'Man';
    if (opt === 'woman') return 'Woman';
    return 'Both';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <Headphones className="w-4 h-4 text-cyan-400" />
              <span>Aptis ESOL Listening • Part 3 (Hội Thoại Đối Đáp)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Phân Định Ý Kiến: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">Man • Woman • Both</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Kho 15 đề thi chuẩn Aptis ESOL. Nghe cuộc trò chuyện giữa 1 Nam và 1 Nữ để xác định ai giữ quan điểm cho 4 nhận định.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-xl flex items-center text-xs">
              <button
                onClick={() => setMode('practice')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  mode === 'practice' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Luyện tập
              </button>
              <button
                onClick={() => setMode('exam')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  mode === 'exam' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Thi thật (Max 2 lần nghe)
              </button>
            </div>
          </div>
        </div>

        {/* Action Bar: Làm Bài Thi Đổi Đề & Tùy Biến Thứ Tự Đáp Án */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          
          {/* Controls: Đổi Đề Ngẫu Nhiên & Next/Prev */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRandomTopic}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition active:scale-95"
              title="Bốc ngẫu nhiên một đề khác trong kho 15 đề"
            >
              <Dices className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span>🎲 Làm Bài Thi Đổi Đề Ngẫu Nhiên</span>
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

          {/* Options Order & UI View Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Rule: Đổi thứ tự đáp án (không đổi thứ tự câu hỏi) */}
            <button
              onClick={() => {
                setShuffleOptions(!shuffleOptions);
                setOptionsSeed(s => s + 1);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-semibold transition ${
                shuffleOptions
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Đảo thứ tự các đáp án lựa chọn (Man, Woman, Both) để tránh học vẹt"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{shuffleOptions ? 'Đang Đảo Thứ Tự Đáp Án' : 'Thứ Tự Đáp Án: Mặc Định'}</span>
            </button>

            {/* Input Style: Dropdown (as in image) vs Buttons */}
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center">
              <button
                onClick={() => setInputStyle('dropdown')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  inputStyle === 'dropdown' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Giao diện dạng Dropdown chọn đáp án giống đề thi thật"
              >
                Dropdown
              </button>
              <button
                onClick={() => setInputStyle('buttons')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  inputStyle === 'buttons' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Giao diện 3 nút bấm chọn nhanh"
              >
                Nút Bấm
              </button>
            </div>

            {/* Toggle Audio Player On/Off (or hide completely for clean exam view) */}
            <button
              onClick={toggleAudioPlayer}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-semibold transition ${
                showAudioPlayer
                  ? 'bg-slate-800/80 text-cyan-300 border-cyan-500/30 hover:bg-slate-800'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25'
              }`}
              title={showAudioPlayer ? "Bỏ / Ẩn hoàn toàn trình phát âm để làm bài thi tập trung" : "Bật lại trình phát âm thanh"}
            >
              {showAudioPlayer ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
              <span>{showAudioPlayer ? '🔊 Trình Phát: Bật' : '🔇 Trình Phát: Đã Bỏ'}</span>
            </button>

            {/* Gợi Ý Key / Bài Thơ Mẹo Nhớ */}
            <button
              onClick={toggleKeyHint}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-semibold transition ${
                showKeyHint
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Bật/Tắt gợi ý key và bài thơ mẹo nhớ của đề này"
            >
              <Lightbulb className={`w-3.5 h-3.5 ${showKeyHint ? 'text-amber-300 fill-amber-300/30' : ''}`} />
              <span>{showKeyHint ? '💡 Gợi ý key: ĐANG BẬT' : '💡 Gợi ý key'}</span>
            </button>

            {/* Option: Bỏ tên đề tài, chỉ hiện số đề */}
            <button
              onClick={toggleHideTopicName}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-semibold transition ${
                hideTopicName
                  ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40 shadow'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title={hideTopicName ? "Hiển thị lại tên đề tài đầy đủ" : "Bỏ tên đề tài, chỉ để số đề (Đề 1, Đề 2...)"}
            >
              {hideTopicName ? <EyeOff className="w-3.5 h-3.5 text-fuchsia-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
              <span>{hideTopicName ? 'Chỉ Để Số Đề' : 'Hiện Tên Đề'}</span>
            </button>
          </div>

        </div>

        {/* 15 Đề Selector Grid */}
        <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
          {topics.map((t, idx) => {
            const hist = history[t.id];
            const isActive = t.id === activeTopicId;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTopicId(t.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                  isActive
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800'
                }`}
                title={hideTopicName ? `Đề ${idx + 1}` : t.title}
              >
                <span>{hideTopicName ? `Đề ${idx + 1}` : `Đề ${idx + 1}: ${t.keyword || t.title.replace(/^Đề \d+:\s*/, '')}`}</span>
                {hist && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" title={`Điểm: ${hist.score}/${hist.total}`} />
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* Main Practice Container */}
      <div className={showAudioPlayer ? "grid grid-cols-1 lg:grid-cols-3 gap-8" : "max-w-4xl mx-auto w-full"}>
        
        {/* Left Col: Audio Player Hub (Only rendered when showAudioPlayer is true) */}
        {showAudioPlayer && (
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-lg sticky top-20">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Trình Phát Âm Thanh AI</span>
                </h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  listenCount >= 2 && mode === 'exam'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                }`}>
                  Đã nghe: {listenCount} {mode === 'exam' ? '/ 2 lần' : 'lần'}
                </span>
              </div>

              {/* Play/Pause Button */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
                {isPlaying ? (
                  <button
                    onClick={stopAudio}
                    className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/25 transition active:scale-95"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Dừng Phát Âm</span>
                  </button>
                ) : (
                  <button
                    onClick={playFullDialogueTTS}
                    disabled={mode === 'exam' && listenCount >= 2}
                    className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg transition active:scale-95 ${
                      mode === 'exam' && listenCount >= 2
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-600/25'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{listenCount > 0 ? 'Nghe Lại Lần 2' : 'Bắt Đầu Nghe Hội Thoại'}</span>
                  </button>
                )}

                {/* Status / Speaker Indicator */}
                <div className="text-xs text-slate-400 flex items-center justify-center gap-2 pt-1">
                  {isPlaying && currentTurnIndex >= 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-cyan-300 font-semibold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      Đang nói: {activeTopic.dialogue[currentTurnIndex]?.speaker === 'man' ? '👨 Người Nam (Man)' : '👩 Người Nữ (Woman)'}
                    </span>
                  ) : (
                    <span>Tự động đổi cao độ Nam / Nữ</span>
                  )}
                </div>
              </div>

              {/* Playback speed toggle */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Tốc độ đọc:</span>
                <div className="flex items-center space-x-1">
                  {[0.85, 1.0, 1.15].map(spd => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        playbackSpeed === spd
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Practice Helpers */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Thời gian làm bài:</span>
                  <span className="font-mono text-cyan-400 font-bold">{formatTime(secondsElapsed)}</span>
                </div>

                {(mode === 'practice' || isSubmitted) && (
                  <button
                    onClick={() => setShowScript(!showScript)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700/60 transition"
                  >
                    {showScript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showScript ? 'Ẩn Lời Thoại (Transcript)' : 'Xem Lời Thoại (Transcript)'}</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Right Col: 4 Questions & Selection */}
        <div className={showAudioPlayer ? "lg:col-span-2 space-y-6" : "w-full space-y-6"}>
          
          {/* Quick Info bar when Audio Player is hidden */}
          {!showAudioPlayer && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs shadow-sm">
              <div className="flex items-center space-x-3 text-slate-300">
                <span className="inline-flex items-center gap-1.5 text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg font-semibold">
                  <VolumeX className="w-3.5 h-3.5" />
                  Đã ẩn trình phát âm (Làm bài tập trung)
                </span>
                <span className="text-slate-400 hidden sm:inline">Thời gian: <b className="font-mono text-cyan-400 font-bold">{formatTime(secondsElapsed)}</b></span>
              </div>

              <div className="flex items-center space-x-2">
                {(mode === 'practice' || isSubmitted) && (
                  <button
                    onClick={() => setShowScript(!showScript)}
                    className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                  >
                    {showScript ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showScript ? 'Ẩn Lời Thoại' : 'Xem Lời Thoại'}</span>
                  </button>
                )}

                <button
                  onClick={toggleAudioPlayer}
                  className="py-1 px-2.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 font-semibold flex items-center gap-1.5 border border-cyan-500/30 transition"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Bật lại âm</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Result Alert if submitted */}
          {isSubmitted && scoreResult && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border border-indigo-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">
                      Kết Quả {hideTopicName ? `Đề ${currentTopicIdx + 1}` : activeTopic.title}: {scoreResult.score} / {scoreResult.total} ({scoreResult.percentage}%)
                    </h4>
                    <p className="text-xs text-slate-300">
                      {scoreResult.percentage >= 75
                        ? 'Xuất sắc! Bạn đã xác định chính xác các quan điểm của người nói.'
                        : 'Xem lại lời thoại và giải thích chi tiết phía dưới để ghi nhớ nhé!'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRetake}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm Lại</span>
                  </button>
                  <button
                    onClick={handleRandomTopic}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Đổi Đề Khác</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Heading */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
                  Listening • Part 3
                </span>
                {!hideTopicName && activeTopic.keyword && (
                  <span className="text-xs font-semibold text-slate-300">
                    Từ khóa: <b className="text-white">{activeTopic.keyword}</b>
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                {hideTopicName ? `Đề ${currentTopicIdx + 1}` : activeTopic.title}
              </h2>
              {!hideTopicName && activeTopic.titleVi && (
                <p className="text-xs text-slate-400">{activeTopic.titleVi}</p>
              )}
            </div>

            <div className="flex items-center space-x-3 text-xs">
              {/* Quick toggle for Gợi ý key */}
              <button
                onClick={toggleKeyHint}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-bold transition ${
                  showKeyHint
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-amber-300 hover:border-amber-500/30'
                }`}
                title="Bật/Tắt hiển thị gợi ý bài thơ mẹo nhớ"
              >
                <Lightbulb className={`w-3.5 h-3.5 ${showKeyHint ? 'text-amber-300 fill-amber-300/30' : ''}`} />
                <span>Gợi ý key {showKeyHint ? '(Đang bật)' : ''}</span>
              </button>

              <div className="text-slate-400 hidden sm:block">
                Thứ tự đáp án: <b className="text-cyan-400 uppercase">{activeOptionsList.join(' • ')}</b>
              </div>
            </div>
          </div>

          {/* Gợi Ý Key / Bài Thơ Mẹo Nhớ (Chỉ hiện khi tích vào button 'Gợi ý key') */}
          {showKeyHint && activeTopic.mnemonicPoem && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/30 border border-amber-500/40 text-amber-200 shadow-xl space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>💡 Gợi Ý Key • Bài Thơ Mẹo Nhớ:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm">
                    Đáp án: {activeTopic.questions.map(q => q.correct === 'both' ? 'B' : q.correct === 'man' ? 'M' : 'W').join('')}
                  </span>
                  <button
                    onClick={() => setShowKeyHint(false)}
                    className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-slate-800 transition"
                    title="Đóng gợi ý key"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="text-sm sm:text-base font-bold text-amber-100 flex items-start space-x-2.5 leading-relaxed bg-amber-950/40 border border-amber-500/20 rounded-xl p-3">
                <span className="text-lg">📜</span>
                <span className="tracking-wide select-all">{activeTopic.mnemonicPoem}</span>
              </div>
            </div>
          )}

          {/* List of 4 Questions (Strictly Original Order: 1, 2, 3, 4) */}
          <div className="space-y-4">
            {activeTopic.questions.map((q, idx) => {
              const currentAns = userAnswers[q.id];
              const isCorrect = isSubmitted && currentAns === q.correct;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    inputStyle === 'dropdown'
                      ? 'border-l-4 border-l-blue-500 bg-white/95 text-slate-900 dark:bg-slate-900/90 dark:text-slate-100 dark:border-slate-800 dark:border-l-cyan-400 shadow-sm'
                      : isSubmitted
                      ? isCorrect
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-100'
                        : 'bg-rose-950/20 border-rose-500/40 text-slate-100'
                      : currentAns
                      ? 'bg-slate-900/80 border-cyan-500/40 text-slate-100'
                      : 'bg-slate-900/50 border-slate-800 text-slate-100'
                  }`}
                >
                  {/* Question Title */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-baseline space-x-2">
                        <span className="font-bold text-sm text-blue-600 dark:text-cyan-400">
                          {idx + 1}.
                        </span>
                        <p className="text-sm font-semibold leading-relaxed">
                          {q.statement}
                        </p>
                      </div>
                      {q.statementVi && (
                        <p className="text-xs opacity-70 pl-5">{q.statementVi}</p>
                      )}
                    </div>

                    {isSubmitted && (
                      <div className="shrink-0">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" /> Sai
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Input Rendering: Dropdown (like in image) OR Buttons */}
                  <div className="mt-4">
                    {inputStyle === 'dropdown' ? (
                      /* Exact replica of the user's uploaded screenshot */
                      <div className="relative max-w-full">
                        <select
                          value={currentAns || ''}
                          onChange={(e) => handleSelectOption(q.id, e.target.value as P3Answer)}
                          disabled={isSubmitted}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition appearance-none cursor-pointer ${
                            isSubmitted
                              ? isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-200'
                                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-800 dark:text-rose-200'
                              : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-blue-400 dark:hover:border-cyan-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
                          }`}
                        >
                          <option value="">-- Chọn --</option>
                          {activeOptionsList.map(opt => (
                            <option key={opt} value={opt}>
                              {getOptionLabel(opt)}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      /* 3 Fast Buttons */
                      <div className="grid grid-cols-3 gap-2.5">
                        {activeOptionsList.map(opt => {
                          const isSelected = currentAns === opt;
                          const isOptCorrect = isSubmitted && q.correct === opt;

                          let bgClass = 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/60';
                          if (isSelected) {
                            if (opt === 'man') bgClass = 'bg-blue-600 text-white border-blue-500 shadow-md';
                            else if (opt === 'woman') bgClass = 'bg-pink-600 text-white border-pink-500 shadow-md';
                            else bgClass = 'bg-purple-600 text-white border-purple-500 shadow-md';
                          }

                          return (
                            <button
                              key={opt}
                              onClick={() => handleSelectOption(q.id, opt)}
                              disabled={isSubmitted}
                              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition border ${bgClass} ${
                                isOptCorrect ? 'ring-2 ring-emerald-400' : ''
                              }`}
                            >
                              {opt === 'both' ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                              <span>{getOptionLabel(opt)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Explanation after submit */}
                  {isSubmitted && (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                      <div className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-blue-600 dark:text-cyan-400">Đáp án chuẩn: </span>
                        <span className="uppercase font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                          {getOptionLabel(q.correct)}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{q.explanation}</p>
                      {q.keywordClue && (
                        <div className="text-[11px] text-amber-600 dark:text-amber-300 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 inline-block">
                          Dẫn chứng: "{q.keywordClue}"
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Action Footer Button */}
          {!isSubmitted && (
            <div className="pt-2">
              <button
                onClick={handleSubmit}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold shadow-lg shadow-emerald-600/25 transition active:scale-98 flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Nộp Bài & Xem Điểm Số Chi Tiết</span>
              </button>
            </div>
          )}

          {/* Transcript Viewer Accordion */}
          {showScript && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Kịch Bản Lời Thoại (Audio Script)</span>
                </h3>

                <button
                  onClick={() => setShowVietnamese(!showVietnamese)}
                  className="text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  {showVietnamese ? 'Ẩn Dịch Tiếng Việt' : 'Hiện Dịch Song Ngữ'}
                </button>
              </div>

              <div className="space-y-3">
                {activeTopic.dialogue.map((turn, tIdx) => {
                  const isCurrent = isPlaying && currentTurnIndex === tIdx;
                  const isMan = turn.speaker === 'man';

                  return (
                    <div
                      key={turn.id || tIdx}
                      className={`p-3.5 rounded-xl border transition ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-500/50 ring-1 ring-cyan-500/40'
                          : 'bg-slate-950/40 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            isMan ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'
                          }`}>
                            {isMan ? '👨 Man' : '👩 Woman'}
                          </span>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mt-1">
                            {turn.text}
                          </p>
                          {showVietnamese && turn.textVi && (
                            <p className="text-xs text-slate-400 italic mt-1 pl-2 border-l border-slate-700">
                              {turn.textVi}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => speakSingleSentence(turn.text, turn.speaker, playbackSpeed)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          title="Phát câu này"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

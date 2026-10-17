import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Mic,
  Play,
  Square,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Trophy,
  Clock,
  FileText
} from 'lucide-react';
import type { ListeningP4Topic, P4Speaker, ListeningP4ScoreRecord } from '../types/listeningP4';
import p4Data from '../data/aptis_listening_part4.json';
import { speakSingleSentence, stopSpeaking } from '../utils/speech';

export const ListeningP4Workspace: React.FC = () => {
  const topics: ListeningP4Topic[] = (p4Data as any).topics || [];
  const [activeTopicId, setActiveTopicId] = useState<string>(topics[0]?.id || '');
  const activeTopic = topics.find(t => t.id === activeTopicId) || topics[0];

  const [mode, setMode] = useState<'exam' | 'practice'>('practice');

  // Answers: questionId -> selectedOption (0, 1, 2)
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; total: number; percentage: number } | null>(null);

  // Audio / Speech state
  const [playingSpeakerId, setPlayingSpeakerId] = useState<number | null>(null);
  const [speakerListenCounts, setSpeakerListenCounts] = useState<Record<number, number>>({});
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showScript, setShowScript] = useState<boolean>(false);
  const [showVietnamese, setShowVietnamese] = useState<boolean>(false);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // History
  const [history, setHistory] = useState<Record<string, ListeningP4ScoreRecord>>(() => {
    try {
      const saved = localStorage.getItem('aptis_listening_p4_history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Reset when topic changes
  useEffect(() => {
    stopSpeaking();
    setPlayingSpeakerId(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setScoreResult(null);
    setSpeakerListenCounts({});
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

  const handlePlaySpeaker = (speaker: P4Speaker) => {
    const currentCount = speakerListenCounts[speaker.speakerId] || 0;
    if (mode === 'exam' && currentCount >= 2) {
      alert(`Ở chế độ Thi thật, bạn chỉ được nghe ${speaker.speakerName} tối đa 2 lần!`);
      return;
    }

    stopSpeaking();
    setPlayingSpeakerId(speaker.speakerId);
    setSpeakerListenCounts(prev => ({
      ...prev,
      [speaker.speakerId]: currentCount + 1
    }));

    speakSingleSentence(speaker.scriptEn, speaker.speakerGender, playbackSpeed, () => {
      setPlayingSpeakerId(null);
    });
  };

  const handleStopAudio = () => {
    stopSpeaking();
    setPlayingSpeakerId(null);
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  // Total questions in topic
  const allQuestions = activeTopic ? activeTopic.speakers.flatMap(s => s.questions) : [];

  const handleSubmit = () => {
    if (!activeTopic) return;
    const answeredCount = Object.keys(userAnswers).length;
    const totalCount = allQuestions.length;

    if (answeredCount < totalCount) {
      const confirmSubmit = window.confirm(
        `Bạn mới trả lời ${answeredCount}/${totalCount} câu hỏi. Bạn có chắc chắn muốn nộp bài không?`
      );
      if (!confirmSubmit) return;
    }

    handleStopAudio();

    let score = 0;
    allQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correct) {
        score++;
      }
    });

    const percentage = Math.round((score / totalCount) * 100);
    setScoreResult({ score, total: totalCount, percentage });
    setIsSubmitted(true);
    setShowScript(true);

    // Save score history
    const record: ListeningP4ScoreRecord = {
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
      localStorage.setItem('aptis_listening_p4_history', JSON.stringify(newHistory));
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
    handleStopAudio();
    setUserAnswers({});
    setIsSubmitted(false);
    setScoreResult(null);
    setSpeakerListenCounts({});
    setSecondsElapsed(0);
    setShowScript(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
              <Mic className="w-4 h-4 text-purple-400" />
              <span>Aptis ESOL Listening • Part 4 (Độc Thoại / Hai Diễn Giả)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Độc Thoại Nâng Cao: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">Quan Điểm & Thái Độ</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Lắng nghe hai người nói chia sẻ quan điểm chuyên sâu về cùng một đề tài. Trả lời các câu hỏi trắc nghiệm A, B, C tương ứng cho từng diễn giả.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-2">
            <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-xl flex items-center text-xs">
              <button
                onClick={() => setMode('practice')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  mode === 'practice' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
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

        {/* Topic Selector Tabs */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {topics.map((t, idx) => {
            const hist = history[t.id];
            const isActive = t.id === activeTopicId;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTopicId(t.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>{`Bài ${idx + 1}: ${t.titleVi || t.title}`}</span>
                {hist && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                    {hist.score}/{hist.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Controls & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center space-x-4">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            Thời gian: <b className="font-mono text-purple-300">{formatTime(secondsElapsed)}</b>
          </span>
          <span className="text-slate-400">
            Tổng câu hỏi: <b className="text-white">{allQuestions.length} câu (3 lựa chọn A, B, C)</b>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Tốc độ đọc:</span>
            {[0.85, 1.0, 1.15].map(spd => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded font-semibold transition ${
                  playbackSpeed === spd
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {(mode === 'practice' || isSubmitted) && (
            <button
              onClick={() => setShowScript(!showScript)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1.5 transition"
            >
              {showScript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showScript ? 'Ẩn Lời Thoại' : 'Xem Lời Thoại'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Result Alert if submitted */}
      {isSubmitted && scoreResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border border-purple-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Kết Quả: {scoreResult.score} / {scoreResult.total} ({scoreResult.percentage}%)</h4>
                <p className="text-xs text-slate-300">
                  {scoreResult.percentage >= 75
                    ? 'Làm rất tốt! Bạn đã nhận diện rất chính xác quan điểm của cả 2 diễn giả.'
                    : 'Hãy kiểm tra lại phần kịch bản và dẫn chứng keyword phía dưới nhé!'}
                </p>
              </div>
            </div>

            <button
              onClick={handleRetake}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm Lại</span>
            </button>
          </div>
        </div>
      )}

      {/* Speakers Sections */}
      <div className="space-y-8">
        {activeTopic.speakers.map((speaker, sIdx) => {
          const isPlayingThis = playingSpeakerId === speaker.speakerId;
          const listenCount = speakerListenCounts[speaker.speakerId] || 0;

          return (
            <div
              key={speaker.speakerId}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
            >
              {/* Speaker Card Header & Audio Trigger */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      speaker.speakerGender === 'man' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                    }`}>
                      {speaker.speakerGender === 'man' ? '👨 Diễn Giả Nam' : '👩 Diễn Giả Nữ'}
                    </span>
                    <h3 className="text-lg font-bold text-white">{speaker.speakerName}</h3>
                  </div>
                  {speaker.topicStance && (
                    <p className="text-xs text-slate-400">{speaker.topicStance}</p>
                  )}
                </div>

                {/* Speaker Audio Button */}
                <div className="flex items-center space-x-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    listenCount >= 2 && mode === 'exam'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                  }`}>
                    Đã nghe: {listenCount} {mode === 'exam' ? '/ 2 lần' : 'lần'}
                  </span>

                  {isPlayingThis ? (
                    <button
                      onClick={handleStopAudio}
                      className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-rose-600/25 transition"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Dừng Phát</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePlaySpeaker(speaker)}
                      disabled={mode === 'exam' && listenCount >= 2}
                      className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-lg transition ${
                        mode === 'exam' && listenCount >= 2
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/25'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{listenCount > 0 ? 'Nghe Lại Người Này' : 'Phát Âm Bài Nói'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Transcript for this speaker (if revealed) */}
              {showScript && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-1">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Lời thoại của {speaker.speakerName}:
                    </span>
                    <button
                      onClick={() => setShowVietnamese(!showVietnamese)}
                      className="text-slate-400 hover:text-white"
                    >
                      {showVietnamese ? 'Ẩn dịch' : 'Xem dịch tiếng Việt'}
                    </button>
                  </div>
                  <p>{speaker.scriptEn}</p>
                  {showVietnamese && speaker.scriptVi && (
                    <p className="text-xs text-slate-400 italic pt-2 border-t border-slate-800">
                      {speaker.scriptVi}
                    </p>
                  )}
                </div>
              )}

              {/* Questions for this speaker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {speaker.questions.map((q, qIdx) => {
                  const currentSelection = userAnswers[q.id];
                  const isCorrect = isSubmitted && currentSelection === q.correct;

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isSubmitted
                          ? isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-rose-950/20 border-rose-500/40'
                          : 'bg-slate-950/40 border-slate-800'
                      }`}
                    >
                      {/* Question Text */}
                      <div className="space-y-1 mb-4">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                            Câu {sIdx * 2 + qIdx + 1}
                          </span>
                          {isSubmitted && (
                            <span>
                              {isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-400" />
                              )}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100">{q.question}</h4>
                        {q.questionVi && (
                          <p className="text-xs text-slate-400">{q.questionVi}</p>
                        )}
                      </div>

                      {/* Options A, B, C */}
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = currentSelection === optIdx;
                          const isThisCorrect = isSubmitted && q.correct === optIdx;

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              disabled={isSubmitted}
                              className={`w-full text-left p-3 rounded-xl text-xs font-medium transition border flex items-start space-x-2.5 ${
                                isSelected
                                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/25'
                                  : 'bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 border-slate-800'
                              } ${isThisCorrect ? 'ring-2 ring-emerald-400 bg-emerald-500/10' : ''}`}
                            >
                              <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <div className="space-y-0.5">
                                <span>{opt}</span>
                                {q.optionsVi && q.optionsVi[optIdx] && (
                                  <p className="text-[11px] text-slate-400 font-normal">
                                    {q.optionsVi[optIdx]}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation after submit */}
                      {isSubmitted && (
                        <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-1.5">
                          <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                          {q.keywordClue && (
                            <div className="text-[11px] text-amber-300 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 inline-block">
                              Dẫn chứng: "{q.keywordClue}"
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!isSubmitted && (
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold shadow-lg shadow-emerald-600/25 transition active:scale-98 flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Nộp Toàn Bộ Bài Nghe Part 4 & Xem Giải Thích Chi Tiết</span>
          </button>
        </div>
      )}

    </div>
  );
};


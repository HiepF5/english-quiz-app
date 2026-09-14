import React, { useState, useEffect } from 'react';
import type { QuizSet, QuizMode, QuizHistoryRecord } from './types/quiz';
import { Navbar } from './components/Navbar';
import { QuizSelector } from './components/QuizSelector';
import { QuizCard } from './components/QuizCard';
import { QuizTracker } from './components/QuizTracker';
import { ResultSummary } from './components/ResultSummary';
import { JsonCreatorModal } from './components/JsonCreatorModal';
import { JsonTemplateModal } from './components/JsonTemplateModal';
import { GithubPushModal } from './components/GithubPushModal';
import { JsonPasteModal } from './components/JsonPasteModal';

// Dynamically import ALL .json files inside src/data/ at build time via Vite glob
const jsonModules = import.meta.glob('./data/*.json', { eager: true });
const DEFAULT_QUIZZES: QuizSet[] = Object.values(jsonModules).map((mod: any) => mod.default || mod);

export const App: React.FC = () => {
  // Load custom saved quizzes from localStorage on initial render
  const [quizSets, setQuizSets] = useState<QuizSet[]>(() => {
    try {
      const savedCustom = localStorage.getItem('custom_saved_quiz_sets');
      if (savedCustom) {
        const parsedCustom: QuizSet[] = JSON.parse(savedCustom);
        const uniqueCustom = parsedCustom.filter(
          (cQuiz) => !DEFAULT_QUIZZES.some((defQuiz) => defQuiz.id === cQuiz.id)
        );
        return [...uniqueCustom, ...DEFAULT_QUIZZES];
      }
    } catch (e) {
      console.error('Error loading custom saved quizzes from localStorage:', e);
    }
    return DEFAULT_QUIZZES;
  });

  // Load completion history map from localStorage per client
  const [quizHistoryMap, setQuizHistoryMap] = useState<Record<string, QuizHistoryRecord>>(() => {
    try {
      const savedHistory = localStorage.getItem('quiz_completion_history');
      if (savedHistory) {
        return JSON.parse(savedHistory);
      }
    } catch (e) {
      console.error('Error loading quiz completion history:', e);
    }
    return {};
  });

  const [activeQuiz, setActiveQuiz] = useState<QuizSet | null>(null);
  const [quizMode, setQuizMode] = useState<QuizMode>('exam');
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // Modals state
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState<boolean>(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState<boolean>(false);

  const [completedCount, setCompletedCount] = useState<number>(() => Object.keys(quizHistoryMap).length);

  // Helper to save new custom quiz to localStorage
  const saveCustomQuizLocally = (newQuiz: QuizSet) => {
    setQuizSets((prev) => {
      const filtered = prev.filter(q => q.id !== newQuiz.id);
      const updatedList = [newQuiz, ...filtered];
      
      const customOnly = updatedList.filter(q => !DEFAULT_QUIZZES.some(def => def.id === q.id));
      try {
        localStorage.setItem('custom_saved_quiz_sets', JSON.stringify(customOnly));
      } catch (err) {
        console.error('Could not save custom quiz to localStorage:', err);
      }

      return updatedList;
    });
  };

  // Helper to record completion in localStorage per client
  const recordQuizCompletion = (score: number, total: number, mode: QuizMode) => {
    if (!activeQuiz) return;
    const percentage = Math.round((score / total) * 100);

    setQuizHistoryMap((prev) => {
      const existing = prev[activeQuiz.id];
      const timesCompleted = existing ? existing.timesCompleted + 1 : 1;
      const highestScore = existing ? Math.max(existing.highestScore, score) : score;
      const highestPercentage = existing ? Math.max(existing.highestPercentage, percentage) : percentage;

      const updatedHistory: QuizHistoryRecord = {
        quizId: activeQuiz.id,
        quizTitle: activeQuiz.title,
        lastCompletedAt: new Date().toISOString(),
        timesCompleted,
        highestScore,
        totalQuestions: total,
        highestPercentage,
        lastMode: mode
      };

      const newMap = {
        ...prev,
        [activeQuiz.id]: updatedHistory
      };

      try {
        localStorage.setItem('quiz_completion_history', JSON.stringify(newMap));
      } catch (err) {
        console.error('Error saving quiz completion history:', err);
      }

      setCompletedCount(Object.keys(newMap).length);
      return newMap;
    });
  };

  // Timer interval effect
  useEffect(() => {
    let timer: any = null;
    if (activeQuiz && !isSubmitted) {
      timer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeQuiz, isSubmitted]);

  // Handle option selection
  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  // Start selected quiz
  const handleSelectQuiz = (quiz: QuizSet, mode: QuizMode) => {
    setActiveQuiz(quiz);
    setQuizMode(mode);
    setUserAnswers({});
    setIsSubmitted(false);
    setSecondsElapsed(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit test
  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    const answeredCount = Object.keys(userAnswers).length;
    const totalCount = activeQuiz.questions.length;

    if (answeredCount < totalCount) {
      const confirmSubmit = window.confirm(
        `Bạn mới trả lời ${answeredCount}/${totalCount} câu hỏi. Bạn có chắc chắn muốn nộp bài không?`
      );
      if (!confirmSubmit) return;
    }

    const currentScore = calculateScore();
    recordQuizCompletion(currentScore, totalCount, quizMode);

    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset current quiz
  const handleResetCurrentQuiz = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setSecondsElapsed(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Import JSON file handler
  const handleImportJson = (jsonText: string, filename: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      let newQuizSet: QuizSet;

      if (Array.isArray(parsed)) {
        newQuizSet = {
          id: `custom-file-${Date.now()}`,
          title: filename.replace('.json', ''),
          description: `Đề thi nhập từ file ${filename} (${parsed.length} câu hỏi)`,
          level: 'Custom',
          category: 'Uploaded',
          timeLimitMinutes: Math.max(5, Math.ceil(parsed.length * 0.8)),
          questions: parsed
        };
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        newQuizSet = {
          id: parsed.id || `custom-file-${Date.now()}`,
          title: parsed.title || filename.replace('.json', ''),
          description: parsed.description || `Đề thi nhập từ file ${filename}`,
          level: parsed.level || 'Custom',
          category: parsed.category || 'Uploaded',
          timeLimitMinutes: parsed.timeLimitMinutes || 15,
          questions: parsed.questions
        };
      } else {
        alert('File JSON không đúng cấu trúc đề bài (thiếu mảng câu hỏi).');
        return;
      }

      saveCustomQuizLocally(newQuizSet);
      handleSelectQuiz(newQuizSet, 'practice');
    } catch (err: any) {
      alert(`Không thể đọc file JSON: ${err.message}`);
    }
  };

  // Calculate score
  const calculateScore = () => {
    if (!activeQuiz) return 0;
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct) {
        score++;
      }
    });
    return score;
  };

  // Map of correct answers
  const getCorrectAnswersMap = () => {
    if (!activeQuiz) return {};
    const map: Record<number, number> = {};
    activeQuiz.questions.forEach((q, idx) => {
      map[idx] = q.correct;
    });
    return map;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Navbar
        onImportJson={handleImportJson}
        onOpenCreator={() => setIsCreatorOpen(true)}
        onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
        onOpenPasteModal={() => setIsPasteModalOpen(true)}
        onOpenGithubModal={() => setIsGithubModalOpen(true)}
        onResetToSelection={() => setActiveQuiz(null)}
        currentQuizTitle={activeQuiz?.title}
        scoreHistoryCount={completedCount}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {!activeQuiz ? (
          /* Quiz Selector Screen */
          <QuizSelector
            quizSets={quizSets}
            quizHistoryMap={quizHistoryMap}
            onSelectQuiz={handleSelectQuiz}
            onFileUpload={handleImportJson}
            onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
            onOpenPasteModal={() => setIsPasteModalOpen(true)}
            onOpenGithubModal={() => setIsGithubModalOpen(true)}
            customQuizCount={quizSets.length - DEFAULT_QUIZZES.length}
          />
        ) : (
          /* Active Quiz Workspace */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">
            
            {/* Summary Modal on submit */}
            {isSubmitted && (
              <div className="mb-8">
                <ResultSummary
                  score={calculateScore()}
                  total={activeQuiz.questions.length}
                  timeTakenSeconds={secondsElapsed}
                  quizTitle={activeQuiz.title}
                  onRetake={handleResetCurrentQuiz}
                  onChangeQuiz={() => setActiveQuiz(null)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Questions Stream (Cols 1-3) */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Active Quiz Header info */}
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Chế độ: {quizMode === 'exam' ? 'Thi tính giờ' : 'Luyện tập (Giải thích tức thì)'}
                    </span>
                    <h2 className="text-xl font-bold text-white mt-2">{activeQuiz.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">{activeQuiz.description}</p>
                  </div>

                  <button
                    onClick={() => setIsGithubModalOpen(true)}
                    className="flex items-center space-x-1.5 text-xs px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-semibold border border-purple-500/30 shadow-sm"
                  >
                    <span>Đẩy Đề Này Lên GitHub & Vercel</span>
                  </button>
                </div>

                {/* List of Questions */}
                <div className="space-y-6">
                  {activeQuiz.questions.map((q, idx) => (
                    <QuizCard
                      key={q.id || idx}
                      question={q}
                      index={idx}
                      selectedOption={userAnswers[idx]}
                      onSelectOption={(optIdx) => handleSelectOption(idx, optIdx)}
                      isSubmitted={isSubmitted}
                      mode={quizMode}
                    />
                  ))}
                </div>

              </div>

              {/* Sidebar Tracker (Col 4) */}
              <div className="lg:col-span-1">
                <QuizTracker
                  totalQuestions={activeQuiz.questions.length}
                  userAnswers={userAnswers}
                  correctAnswers={isSubmitted ? getCorrectAnswersMap() : undefined}
                  secondsElapsed={secondsElapsed}
                  timeLimitSeconds={(activeQuiz.timeLimitMinutes || 15) * 60}
                  isSubmitted={isSubmitted}
                  onSubmit={handleSubmitQuiz}
                  onReset={handleResetCurrentQuiz}
                  mode={quizMode}
                />
              </div>

            </div>

          </div>
        )}
      </main>

      {/* JSON Creator Modal */}
      <JsonCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onLoadCreatedQuiz={(newQuiz) => {
          saveCustomQuizLocally(newQuiz);
          handleSelectQuiz(newQuiz, 'practice');
        }}
      />

      {/* JSON Direct Paste & Auto-Sync Modal */}
      <JsonPasteModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onLoadQuiz={(newQuiz) => {
          saveCustomQuizLocally(newQuiz);
          handleSelectQuiz(newQuiz, 'practice');
        }}
      />

      {/* JSON Template Structure Modal */}
      <JsonTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />

      {/* GitHub Auto-Commit & Deploy Modal */}
      <GithubPushModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        currentQuiz={activeQuiz || (quizSets.length > 0 ? quizSets[0] : null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>English Quiz App — Powered by JSON Test Banks & React + Vite</span>
          <span>Sẵn sàng Deploy lên Vercel</span>
        </div>
      </footer>

    </div>
  );
};

export default App;

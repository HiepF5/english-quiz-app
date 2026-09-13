import React, { useState, useEffect } from 'react';
import type { QuizSet, QuizMode } from './types/quiz';
import { Navbar } from './components/Navbar';
import { QuizSelector } from './components/QuizSelector';
import { QuizCard } from './components/QuizCard';
import { QuizTracker } from './components/QuizTracker';
import { ResultSummary } from './components/ResultSummary';
import { JsonCreatorModal } from './components/JsonCreatorModal';

// Import default datasets
import day1Data from './data/day1_present_simple.json';
import day2Data from './data/day2_past_tenses.json';
import day3Data from './data/day3_toeic_vocab.json';

export const App: React.FC = () => {
  const [quizSets, setQuizSets] = useState<QuizSet[]>([
    day1Data as unknown as QuizSet,
    day2Data as unknown as QuizSet,
    day3Data as unknown as QuizSet
  ]);

  const [activeQuiz, setActiveQuiz] = useState<QuizSet | null>(null);
  const [quizMode, setQuizMode] = useState<QuizMode>('exam');
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(false);
  const [completedCount, setCompletedCount] = useState<number>(0);

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

    setIsSubmitted(true);
    setCompletedCount((prev) => prev + 1);
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
        // If it's a raw array of questions
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
        // Standard QuizSet object format
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

      setQuizSets((prev) => [newQuizSet, ...prev]);
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
            onSelectQuiz={handleSelectQuiz}
            onFileUpload={handleImportJson}
            customQuizCount={quizSets.length - 3}
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
          setQuizSets((prev) => [newQuiz, ...prev]);
          handleSelectQuiz(newQuiz, 'practice');
        }}
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

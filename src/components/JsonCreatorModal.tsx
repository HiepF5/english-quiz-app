import React, { useState } from 'react';
import type { QuizSet, Question } from '../types/quiz';
import { X, Plus, Trash2, Download, Copy, Check, FileCode } from 'lucide-react';

interface JsonCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCreatedQuiz: (quiz: QuizSet) => void;
}

export const JsonCreatorModal: React.FC<JsonCreatorModalProps> = ({
  isOpen,
  onClose,
  onLoadCreatedQuiz
}) => {
  const [title, setTitle] = useState('Đề Thi Tiếng Anh Tự Tạo');
  const [description, setDescription] = useState('Đề luyện tập trắc nghiệm tự biên soạn');
  const [category, setCategory] = useState('Grammar');
  const [level, setLevel] = useState('Intermediate (B1)');
  const [timeLimitMinutes] = useState(15);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      part: 'Part A — Cơ bản',
      question: 'She ______ english fluently every day.',
      options: ['speak', 'speaks', 'speaking', 'spoke'],
      correct: 1,
      explanation: 'Chủ ngữ "She" ngôi thứ ba số ít ở hiện tại đơn -> chia "speaks".'
    }
  ]);

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    const nextId = questions.length + 1;
    setQuestions([
      ...questions,
      {
        id: nextId,
        part: 'Part A — Cơ bản',
        question: `Câu hỏi ${nextId} ______ ?`,
        options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
        correct: 0,
        explanation: 'Giải thích chi tiết cho câu hỏi này.'
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length === 1) {
      alert('Đề thi phải có ít nhất 1 câu hỏi.');
      return;
    }
    const updated = questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, id: i + 1 }));
    setQuestions(updated);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    const newOptions = [...updated[qIndex].options];
    newOptions[optIndex] = value;
    updated[qIndex].options = newOptions;
    setQuestions(updated);
  };

  const buildQuizObject = (): QuizSet => ({
    id: `custom-created-${Date.now()}`,
    title,
    description,
    level,
    category,
    timeLimitMinutes,
    questions
  });

  const getFormattedJson = () => JSON.stringify(buildQuizObject(), null, 2);

  const handleDownload = () => {
    const jsonStr = getFormattedJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFormattedJson());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadDirectly = () => {
    onLoadCreatedQuiz(buildQuizObject());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Tạo Đề Thi JSON Trực Quan</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Metadata Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-400">Tiêu Đề Bộ Đề</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Mô Tả Bộ Đề</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Danh Mục (Category)</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Trình Độ (Level)</label>
              <input
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Questions Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-200">Danh Sách Câu Hỏi ({questions.length})</h4>
              <button
                onClick={handleAddQuestion}
                className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Câu Hỏi</span>
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={qIdx} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">Câu {qIdx + 1}</span>
                  <button
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                  placeholder="Nội dung câu hỏi tiếng Anh..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-medium focus:border-indigo-500 focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correct === oIdx}
                        onChange={() => updateQuestion(qIdx, 'correct', oIdx)}
                        className="text-indigo-600 focus:ring-indigo-500"
                        title="Đánh dấu đáp án đúng"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                        placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <input
                  type="text"
                  value={q.explanation}
                  onChange={(e) => updateQuestion(qIdx, 'explanation', e.target.value)}
                  placeholder="Giải thích ngữ pháp/từ vựng chi tiết..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã Sao Chép' : 'Sao Chép JSON'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải File .json</span>
            </button>
          </div>

          <button
            onClick={handleLoadDirectly}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25"
          >
            <span>Vào Làm Ngay Đề Này</span>
          </button>
        </div>

      </div>
    </div>
  );
};

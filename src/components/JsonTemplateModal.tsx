import React, { useState } from 'react';
import { X, Copy, Download, Check, FileJson, Info, Bot, Sparkles } from 'lucide-react';

interface JsonTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AI_PROMPT_TEXT = `Hãy chuyển đổi bộ đề thi trắc nghiệm tiếng Anh dưới đây thành một file JSON chuẩn duy nhất theo đúng cấu trúc bên dưới (chỉ trả về đúng duy nhất khối mã JSON hợp lệ, không thêm bất kỳ văn bản chào hỏi hay dẫn dắt nào khác):

{
  "id": "custom-toeic-quiz",
  "title": "Tên Bộ Đề Thi Tiếng Anh",
  "description": "Mô tả ngắn gọn về bài thi và chủ đề",
  "level": "Intermediate (B1)",
  "category": "Grammar & Vocabulary",
  "timeLimitMinutes": 15,
  "questions": [
    {
      "id": 1,
      "part": "Part A — Ngữ Pháp Cơ Bản",
      "question": "The manager ______ the office at 8 a.m. every day.",
      "options": [
        "arrive",
        "arrives",
        "arriving",
        "arrived"
      ],
      "correct": 1,
      "explanation": "Chủ ngữ ngôi 3 số ít + thói quen hiện tại đơn (every day) -> chọn 'arrives'."
    }
  ]
}

Lưu ý quan trọng:
1. Trường "correct" là CHỈ SỐ số học của đáp án đúng trong mảng "options" (0 tương ứng đáp án A, 1 tương ứng B, 2 tương ứng C, 3 tương ứng D).
2. Trường "explanation" bắt buộc phải giải thích chi tiết ngữ pháp/từ vựng bằng tiếng Việt giúp người học hiểu rõ bản chất.
3. Phần vị trí cần điền trong câu hỏi phải dùng ký tự 6 gạch dưới: "______".

Nội dung đề thi trắc nghiệm cần chuyển đổi:
[DÁN NỘI DUNG ĐỀ THI DẠNG VĂN BẢN/WORD/PDF CỦA BẠN VÀO ĐÂY]`;

const SAMPLE_JSON = {
  id: "toeic-grammar-sample",
  title: "Đề Thi Trắc Nghiệm Tiếng Anh Mẫu",
  description: "Mô tả về chủ đề đề thi (Ví dụ: Ngữ pháp thì hiện tại đơn & từ vựng TOEIC Part 5)",
  level: "Intermediate (B1)",
  category: "Grammar & Vocab",
  timeLimitMinutes: 15,
  questions: [
    {
      id: 1,
      part: "Part A — Ngữ Pháp Cơ Bản",
      question: "The manager ______ the office at 8 a.m. every day.",
      options: [
        "arrive",
        "arrives",
        "arriving",
        "arrived"
      ],
      correct: 1,
      explanation: "Chủ ngữ 'The manager' là ngôi thứ ba số ít, dấu hiệu 'every day' chỉ thói quen hiện tại đơn -> chọn 'arrives'."
    },
    {
      id: 2,
      part: "Part B — Từ Vựng TOEIC",
      question: "The company offers a highly ______ salary package to attract top talents.",
      options: [
        "competitive",
        "compete",
        "competition",
        "competitor"
      ],
      correct: 0,
      explanation: "Sau trạng từ 'highly' và trước danh từ 'salary package' cần một tính từ -> chọn 'competitive' (cạnh tranh)."
    }
  ]
};

export const JsonTemplateModal: React.FC<JsonTemplateModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'prompt'>('json');
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const formattedJson = JSON.stringify(SAMPLE_JSON, null, 2);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(AI_PROMPT_TEXT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mau_de_thi_tieng_anh.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Cấu Trúc JSON Mẫu & Prompt AI Tạo Đề
              </h3>
              <p className="text-xs text-slate-400">Định dạng file JSON chuẩn hoặc câu Lệnh Prompt nhờ AI tự động tạo file JSON</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-6 pt-3 bg-slate-950/50 space-x-2">
          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'json'
                ? 'border-indigo-500 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Mẫu JSON Đề Bài</span>
          </button>

          <button
            onClick={() => setActiveTab('prompt')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'prompt'
                ? 'border-purple-500 text-purple-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span className="flex items-center gap-1.5">
              Prompt AI Tạo JSON Tự Động
              <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">Mới</span>
            </span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {activeTab === 'json' ? (
            <>
              {/* Legend / Guidance Box */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs leading-relaxed space-y-2 text-slate-300">
                <div className="flex items-center space-x-2 font-bold text-indigo-300 text-sm">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Giải Thích Các Trường Trong File JSON:</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 list-disc list-inside text-slate-300 pt-1">
                  <li><strong className="text-indigo-300">title</strong>: Tên bộ đề thi tiếng Anh.</li>
                  <li><strong className="text-indigo-300">description</strong>: Mô tả ngắn về đề thi.</li>
                  <li><strong className="text-indigo-300">timeLimitMinutes</strong>: Thời gian làm bài (phút).</li>
                  <li><strong className="text-indigo-300">question</strong>: Câu hỏi có phần điền <code className="bg-slate-800 px-1 rounded text-indigo-300">______</code></li>
                  <li><strong className="text-indigo-300">options</strong>: Mảng 4 lựa chọn [A, B, C, D].</li>
                  <li><strong className="text-indigo-300">correct</strong>: Chỉ số đáp án đúng (<code className="text-emerald-400 font-bold">0=A, 1=B, 2=C, 3=D</code>).</li>
                  <li><strong className="text-indigo-300">explanation</strong>: Lời giải thích ngữ pháp chi tiết.</li>
                </ul>
              </div>

              {/* JSON Code Viewer */}
              <div className="relative group">
                <div className="absolute top-3 right-3 flex items-center space-x-2 z-10">
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? 'Đã Sao Chép' : 'Sao Chép'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Mẫu .json</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-200 overflow-x-auto max-h-96 leading-relaxed">
                  <code>{formattedJson}</code>
                </pre>
              </div>
            </>
          ) : (
            <>
              {/* Prompt Guidance Box */}
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs leading-relaxed space-y-2 text-slate-300">
                <div className="flex items-center space-x-2 font-bold text-purple-300 text-sm">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Cách Sử Dụng Prompt AI Này:</span>
                </div>
                <p className="text-slate-300">
                  Sao chép đoạn Prompt dưới đây, dán vào ChatGPT / Gemini / Claude cùng với bài thi dạng văn bản (Word/PDF) của bạn. 
                  AI sẽ tự động phân tích và xuất ra file JSON đúng 100% cấu trúc để bạn nạp vào web!
                </p>
              </div>

              {/* Prompt Text Viewer */}
              <div className="relative group">
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPrompt ? 'Đã Sao Chép Prompt' : 'Sao Chép Prompt AI'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-purple-200 overflow-x-auto max-h-96 leading-relaxed whitespace-pre-wrap">
                  <code>{AI_PROMPT_TEXT}</code>
                </pre>
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">
          <span className="text-xs text-slate-400">
            {activeTab === 'json' ? 'Mẹo: Bạn có thể tải file này về máy để làm mẫu.' : 'Mẹo: Dán prompt này kèm theo đề văn bản vào bất kỳ AI nào (ChatGPT, Gemini).'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

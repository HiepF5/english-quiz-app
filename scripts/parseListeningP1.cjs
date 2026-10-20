const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '../task-agent/part 1 listen apitis.md');
const content = fs.readFileSync(mdPath, 'utf8');

const regex = /Câu\s+(\d+)\s+ID:(\d+)\r?\n([\s\S]*?)(?=(?:Câu\s+\d+\s+ID:\d+|$))/g;
let match;
let questions = [];

while ((match = regex.exec(content)) !== null) {
  const num = parseInt(match[1]);
  const id = match[2];
  const block = match[3].trim();

  const qLines = block.split(/\r?\n/);
  const aIdx = qLines.findIndex(l => l.trim() === 'A.');
  const bIdx = qLines.findIndex(l => l.trim() === 'B.');
  const cIdx = qLines.findIndex(l => l.trim() === 'C.');
  const explainIdx = qLines.findIndex(l => l.trim().startsWith('Giải thích'));

  const qText = qLines.slice(0, aIdx).join(' ').trim();
  const optA = qLines.slice(aIdx + 1, bIdx).join(' ').trim();
  const optB = qLines.slice(bIdx + 1, cIdx).join(' ').trim();
  const optC = qLines.slice(cIdx + 1, explainIdx).join(' ').trim();

  // Correct answer
  const correctMatch = block.match(/Đáp án đúng:\s*([A-C])/);
  const correctLetter = correctMatch ? correctMatch[1] : 'A';
  const letterToIndex = { 'A': 0, 'B': 1, 'C': 2 };
  const correctIndex = letterToIndex[correctLetter];

  // Dịch câu hỏi
  const qViMatch = block.match(/-\s*Dịch câu hỏi:\s*(.+)/);
  const qVi = qViMatch ? qViMatch[1].trim() : '';

  // Dịch đáp án
  const transOptMatch = block.split(/-\s*Dịch đáp án:\s*/);
  let transOpts = [];
  if (transOptMatch.length > 1) {
    const after = transOptMatch[1].trim();
    transOpts = after
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => s.startsWith('-'))
      .map(s => s.replace(/^-\s*/, '').trim());
  }

  // Explanation text
  const explanation = `Đáp án đúng: ${correctLetter}. ${[optA, optB, optC][correctIndex]}\n` +
    `• Dịch câu hỏi: ${qVi}\n` +
    `• Dịch các đáp án:\n` +
    `  - A. ${optA} ➔ ${transOpts[0] || ''}\n` +
    `  - B. ${optB} ➔ ${transOpts[1] || ''}\n` +
    `  - C. ${optC} ➔ ${transOpts[2] || ''}`;

  questions.push({
    num,
    id,
    question: qText,
    options: [optA, optB, optC],
    correctLetter,
    correct: correctIndex,
    questionVi: qVi,
    optionsVi: transOpts,
    explanation,
    part: "Aptis Listening Part 1"
  });
}

console.log(`Parsed ${questions.length} questions.`);

// 1. Write the specialized dataset
const p1Data = {
  id: "aptis-listening-part-1-50-questions",
  title: "Aptis Listening Part 1 - 50 Câu Nhận Diện Thông Tin",
  description: "Luyện tập theo trí nhớ tiếng Việt & Thi thử trắc nghiệm 50 câu nghe Aptis Part 1",
  level: "B1-B2",
  category: "Listening",
  timeLimitMinutes: 25,
  totalQuestions: questions.length,
  questions: questions
};

const outputPath = path.join(__dirname, '../src/data/aptis_listening_part1.json');
fs.writeFileSync(outputPath, JSON.stringify(p1Data, null, 2), 'utf8');
console.log(`Successfully saved to ${outputPath}`);

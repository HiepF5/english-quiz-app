const fs = require('fs');
const path = require('path');

function parseQuestions(filePath, partName, setIndex) {
  const fullPath = path.join(__dirname, '..', filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
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

    const correctMatch = block.match(/Đáp án đúng:\s*([A-C])/);
    const correctLetter = correctMatch ? correctMatch[1] : 'A';
    const letterToIndex = { 'A': 0, 'B': 1, 'C': 2 };
    const correctIndex = letterToIndex[correctLetter];

    const qViMatch = block.match(/-\s*Dịch câu hỏi:\s*(.+)/);
    const qVi = qViMatch ? qViMatch[1].trim() : '';

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

    const explanation = `Đáp án đúng: ${correctLetter}. ${[optA, optB, optC][correctIndex]}\n` +
      `• Dịch câu hỏi: ${qVi}\n` +
      `• Dịch các đáp án:\n` +
      `  - A. ${optA} ➔ ${transOpts[0] || ''}\n` +
      `  - B. ${optB} ➔ ${transOpts[1] || ''}\n` +
      `  - C. ${optC} ➔ ${transOpts[2] || ''}`;

    questions.push({
      num,
      id,
      setIndex,
      question: qText,
      options: [optA, optB, optC],
      correctLetter,
      correct: correctIndex,
      questionVi: qVi,
      optionsVi: transOpts,
      explanation,
      part: partName
    });
  }
  return questions;
}

const q1 = parseQuestions('task-agent/part 1 listen apitis.md', 'Phần 1 (Câu 1 - 50)', 1);
const q2 = parseQuestions('task-agent/part 1 v2 listen aptis.md', 'Phần 2 (Câu 51 - 100)', 2);
const q3 = parseQuestions('task-agent/part 1 v3 aptis.md', 'Phần 3 (Câu 101 - 188)', 3);

console.log('Set 1 questions:', q1.length);
console.log('Set 2 questions:', q2.length);
console.log('Set 3 questions:', q3.length);

const allQuestions = [...q1, ...q2, ...q3];
console.log('Total questions:', allQuestions.length);

const p1Data = {
  id: "aptis-listening-part-1-all-questions",
  title: "Aptis Listening Part 1 - Tổng hợp 188 câu",
  description: "Luyện tập theo trí nhớ tiếng Việt & Thi thử 188 câu nghe Aptis Part 1 (Set 1: 1-50, Set 2: 51-100, Set 3: 101-188)",
  level: "B1-B2",
  category: "Listening",
  timeLimitMinutes: 60,
  totalQuestions: allQuestions.length,
  sets: [
    { id: "set-1", name: "Set 1 (Câu 1 - 50)", count: q1.length, questionStart: 1, questionEnd: 50 },
    { id: "set-2", name: "Set 2 (Câu 51 - 100)", count: q2.length, questionStart: 51, questionEnd: 100 },
    { id: "set-3", name: "Set 3 (Câu 101 - 188)", count: q3.length, questionStart: 101, questionEnd: 188 }
  ],
  questions: allQuestions
};

const outputPath = path.join(__dirname, '../src/data/aptis_listening_part1.json');
fs.writeFileSync(outputPath, JSON.stringify(p1Data, null, 2), 'utf8');
console.log(`Saved updated dataset to ${outputPath}`);

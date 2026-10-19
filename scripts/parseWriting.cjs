const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, '../task-agent/writing and ai review , check.md'), 'utf-8');
const lines = raw.split('\n');

function cleanText(str) {
  if (!str) return '';
  return str.trim()
    .replace(/\r/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ');
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Find club headers
const clubHeaderRegex = /^(Community Club|Business club\.|Museum Club|Car Club|Nature Club|PHOTOGRAPHY CLUB|PHIÊN BẢN 2|FASHION CLUB|Food Club :|Food Club 2 :|SCIENCE CLUB|COMPUTER CLUB|HEALTH CLUB|HEALTH CLUB 2|Book club|Book club:\s*2|BOOK CLUB phiên bản 3|Language Club|LANGUAGE CLUB 2|English Club|Art Club|Home Living club|Walking club|OUTDOOR CLUB|MOVIE MAKERS CLUB|Social club|MUSIC CLUB|SPORT CLUB|TV Club|FITNESS CLUB 1|FITNESS POWER CLUB 2|READING CLUB|TRAVEL CLUB|ĐỀ TRAVEL CLUB phiên bản 2|Travel club phiên bản 3|DEBATE CLUB|TECHNOLOGY CLUB|GARDEN CLUB|Writing\s*Club)/i;

const rawSections = [];
let curTitle = '';
let curLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  if (clubHeaderRegex.test(trimmed)) {
    if (curTitle && curLines.length > 0) {
      rawSections.push({ title: curTitle, lines: curLines });
    }
    curTitle = trimmed;
    curLines = [];
  } else {
    if (curTitle) {
      curLines.push(line);
    }
  }
}
if (curTitle && curLines.length > 0) {
  rawSections.push({ title: curTitle, lines: curLines });
}

// Merge 'PHIÊN BẢN 2' with the next section if needed
const mergedSections = [];
for (let i = 0; i < rawSections.length; i++) {
  const sec = rawSections[i];
  if (sec.title.toUpperCase().includes('PHIÊN BẢN 2') && i + 1 < rawSections.length) {
    const nextSec = rawSections[i + 1];
    nextSec.title = nextSec.title + ' (Phiên bản 2)';
    nextSec.lines = [...sec.lines, ...nextSec.lines];
  } else {
    mergedSections.push(sec);
  }
}

// Parse each section into Aptis Writing Topic
const topics = [];

mergedSections.forEach((sec, idx) => {
  let title = sec.title
    .replace(/[:.]\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Normalize Title casing
  const formattedTitle = title
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .replace(/\bClub\b/i, 'Club');

  const id = slugify(formattedTitle) || `topic-${idx + 1}`;
  const secContent = sec.lines.join('\n');

  // Split into Part 1, Part 2, Part 3, Part 4
  const p1Match = secContent.search(/Part 1|Task 1/i);
  const p2Match = secContent.search(/Part 2|Task 2/i);
  const p3Match = secContent.search(/Part 3|Task 3/i);
  const p4Match = secContent.search(/Part 4|Task 4/i);

  const p1Text = p1Match !== -1 && p2Match !== -1 ? secContent.slice(p1Match, p2Match) : '';
  const p2Text = p2Match !== -1 && p3Match !== -1 ? secContent.slice(p2Match, p3Match) : '';
  const p3Text = p3Match !== -1 && p4Match !== -1 ? secContent.slice(p3Match, p4Match) : (p3Match !== -1 ? secContent.slice(p3Match) : '');
  const p4Text = p4Match !== -1 ? secContent.slice(p4Match) : '';

  // Parse Part 1 (5 items)
  const part1 = [];
  const p1Lines = p1Text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let p1Question = '';
  let p1Num = 1;

  for (let i = 0; i < p1Lines.length; i++) {
    const l = p1Lines[i];
    if (/^(Part 1|Task 1|You want|Fill in)/i.test(l)) continue;
    
    // Check if line is a numbered question like "1. What is..." or "What is..."
    const qMatch = l.match(/^(\d+)[\.\)]\s*(.+)/);
    if (qMatch) {
      if (p1Question) {
        part1.push({ questionNumber: p1Num++, question: p1Question, sampleAnswer: '' });
      }
      p1Question = qMatch[2];
      // check if answer is on same line
      const inlineAns = p1Question.match(/(.+?)\?\s*(.+)/);
      if (inlineAns) {
        p1Question = inlineAns[1] + '?';
        part1.push({ questionNumber: p1Num++, question: p1Question, sampleAnswer: inlineAns[2].trim() });
        p1Question = '';
      }
    } else if (l.endsWith('?')) {
      if (p1Question) {
        part1.push({ questionNumber: p1Num++, question: p1Question, sampleAnswer: '' });
      }
      p1Question = l;
    } else {
      // Possible answer to p1Question
      if (p1Question) {
        part1.push({ questionNumber: p1Num++, question: p1Question, sampleAnswer: l });
        p1Question = '';
      }
    }
  }
  if (p1Question) {
    part1.push({ questionNumber: p1Num++, question: p1Question, sampleAnswer: '' });
  }

  // Parse Part 2
  const p2Lines = p2Text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let p2Prompt = '';
  let p2Answer = '';
  let p2Instruction = 'You are a new member of the club. Fill in the form. Write in sentences. Use 20-30 words.';

  for (let i = 0; i < p2Lines.length; i++) {
    const l = p2Lines[i];
    if (/^(Part 2|Task 2|You are a new member|Fill in the form|Write in sentences)/i.test(l)) {
      if (l.length > 30) p2Instruction = l;
      continue;
    }
    if (!p2Prompt && (l.includes('?') || l.toLowerCase().startsWith('tell me') || l.toLowerCase().startsWith('where') || l.toLowerCase().startsWith('when') || l.toLowerCase().startsWith('what') || l.toLowerCase().startsWith('why') || l.toLowerCase().startsWith('please') || l.toLowerCase().startsWith('who'))) {
      p2Prompt = l;
    } else if (p2Prompt && !p2Answer) {
      p2Answer = l;
    } else if (p2Prompt && p2Answer) {
      p2Answer += ' ' + l;
    }
  }

  // Parse Part 3 (Chat with 3 members A, B, C)
  const part3Items = [];
  const p3Lines = p3Text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let p3Speaker = '';
  let p3Question = '';
  let p3Answer = '';

  for (let i = 0; i < p3Lines.length; i++) {
    const l = p3Lines[i];
    if (/^(Part 3|Task 3|You are a member|You are talking|Talk to them|Use 30|Respond to them)/i.test(l)) continue;
    
    const speakerMatch = l.match(/^([A-Z0-9]+)\s*[:.-]\s*(.+)/);
    if (speakerMatch && speakerMatch[1].length <= 8) {
      if (p3Question) {
        part3Items.push({ speaker: p3Speaker || 'Member', question: p3Question, sampleAnswer: p3Answer.trim() });
      }
      p3Speaker = speakerMatch[1];
      p3Question = speakerMatch[2];
      p3Answer = '';
    } else if (l.includes('?') && !p3Question) {
      p3Question = l;
      p3Speaker = p3Speaker || `Member ${part3Items.length + 1}`;
    } else if (l.includes('?') && p3Answer) {
      part3Items.push({ speaker: p3Speaker || 'Member', question: p3Question, sampleAnswer: p3Answer.trim() });
      p3Speaker = `Member ${part3Items.length + 1}`;
      p3Question = l;
      p3Answer = '';
    } else {
      if (p3Question) {
        p3Answer += (p3Answer ? ' ' : '') + l;
      }
    }
  }
  if (p3Question) {
    part3Items.push({ speaker: p3Speaker || 'Member', question: p3Question, sampleAnswer: p3Answer.trim() });
  }

  // Parse Part 4 (Email from club + 2 tasks + sample answers)
  const p4Lines = p4Text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let p4Context = '';
  let p4Task1Prompt = 'Write an email to your friend. Write about 50 words.';
  let p4Task2Prompt = 'Write an email to the manager of the club. Write about 120-150 words.';
  let p4Task1Answer = '';
  let p4Task2Answer = '';
  let readingMode = 'context'; // 'context' | 'task1_ans' | 'task2_ans'

  for (let i = 0; i < p4Lines.length; i++) {
    const l = p4Lines[i];
    if (/^Part 4/i.test(l)) continue;

    if (/1[\.\)]\s*(Write an email to your friend|Write to your friend|Email to a friend)/i.test(l)) {
      p4Task1Prompt = l;
      readingMode = 'task1_ans';
      continue;
    }
    if (/2[\.\)]\s*(Write an email to the manager|Write to the manager|Write to the club manager|Email to the manager)/i.test(l)) {
      p4Task2Prompt = l;
      readingMode = 'task2_ans';
      continue;
    }

    if (readingMode === 'context') {
      p4Context += (p4Context ? ' ' : '') + l;
    } else if (readingMode === 'task1_ans') {
      p4Task1Answer += (p4Task1Answer ? '\n' : '') + l;
    } else if (readingMode === 'task2_ans') {
      p4Task2Answer += (p4Task2Answer ? '\n' : '') + l;
    }
  }

  // Clean default context if empty
  if (!p4Context) {
    p4Context = `You are a member of ${formattedTitle}. You received an announcement from the club regarding upcoming events and membership feedback. Please read and respond to the two tasks below.`;
  }

  topics.push({
    id,
    title: formattedTitle,
    description: `Aptis ESOL Writing • Chủ đề ${formattedTitle}`,
    part1,
    part2: {
      instruction: p2Instruction,
      prompt: p2Prompt || `Why did you decide to join ${formattedTitle}?`,
      wordLimit: '20 - 30 từ',
      sampleAnswer: p2Answer.trim()
    },
    part3: {
      instruction: `You are speaking to other members in the ${formattedTitle} chat room. Respond to them in full sentences (30 - 40 words per answer).`,
      items: part3Items.length > 0 ? part3Items : [
        { speaker: 'Member A', question: `Tell me about your interest in ${formattedTitle}?`, sampleAnswer: '' },
        { speaker: 'Member B', question: `What do you think our club should do to attract more members?`, sampleAnswer: '' },
        { speaker: 'Member C', question: `Do you prefer participating online or meeting in person? Why?`, sampleAnswer: '' }
      ],
      wordLimit: '30 - 40 từ'
    },
    part4: {
      context: p4Context,
      task1: {
        prompt: p4Task1Prompt,
        wordLimit: 'Khoảng 50 từ (Thư thân mật)',
        sampleAnswer: p4Task1Answer.trim()
      },
      task2: {
        prompt: p4Task2Prompt,
        wordLimit: '120 - 150 từ (Thư trang trọng)',
        sampleAnswer: p4Task2Answer.trim()
      }
    }
  });
});

console.log(`Parsed ${topics.length} topics successfully.`);
fs.writeFileSync(path.join(__dirname, '../src/data/aptis_writing_topics.json'), JSON.stringify(topics, null, 2), 'utf-8');
console.log('Saved to src/data/aptis_writing_topics.json');

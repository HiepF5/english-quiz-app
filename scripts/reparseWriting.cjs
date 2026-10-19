const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, '../task-agent/writing and ai review , check.md'), 'utf-8');
const lines = raw.split('\n');

function clean(str) {
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

const markers = [
  { startLine: 6, title: 'Community Club' },
  { startLine: 34, title: 'Business Club' },
  { startLine: 74, title: 'Museum Club' },
  { startLine: 105, title: 'Car Club' },
  { startLine: 134, title: 'Nature Club' },
  { startLine: 161, title: 'Photography Club (Đề 1)' },
  { startLine: 205, title: 'Photography Club (Đề 2)' },
  { startLine: 233, title: 'Fashion Club' },
  { startLine: 257, title: 'Food Club (Đề 1 - Chef Event)' },
  { startLine: 285, title: 'Food Club (Đề 2 - Cancelled Classes)', inheritFrom: 'food-club-de-1-chef-event' },
  { startLine: 288, title: 'Science Club' },
  { startLine: 317, title: 'Computer Club' },
  { startLine: 353, title: 'Health Club (Đề 1)' },
  { startLine: 372, title: 'Health Club (Đề 2 - Fee Increase)' },
  { startLine: 391, title: 'College' },
  { startLine: 415, title: 'Book Club (Đề 1)' },
  { startLine: 434, title: 'Book Club (Đề 2 - Library Closure)', inheritFrom: 'book-club-de-1' },
  { startLine: 439, title: 'Book Club (Đề 3 - Author Event)' },
  { startLine: 459, title: 'Language Club (Đề 1)' },
  { startLine: 478, title: 'Language Club (Đề 2)' },
  { startLine: 497, title: 'English Club' },
  { startLine: 515, title: 'Art Club' },
  { startLine: 535, title: 'Home Living Club' },
  { startLine: 553, title: 'Walking Club' },
  { startLine: 571, title: 'Outdoor Club' },
  { startLine: 596, title: 'Movie Makers Club' },
  { startLine: 616, title: 'Social Club' },
  { startLine: 637, title: 'Music Club' },
  { startLine: 658, title: 'Sport Club' },
  { startLine: 678, title: 'TV Club' },
  { startLine: 697, title: 'Fitness Club (Đề 1)' },
  { startLine: 726, title: 'Fitness Power Club (Đề 2)' },
  { startLine: 743, title: 'Reading Club' },
  { startLine: 760, title: 'Travel Club (Đề 1 - Tourist Behavior)' },
  { startLine: 776, title: 'Travel Club (Đề 2 - Language Barriers)' },
  { startLine: 792, title: 'Travel Club (Đề 3 - David Price Book)', inheritFrom: 'travel-club-de-1-tourist-behavior' },
  { startLine: 799, title: 'Debate Club' },
  { startLine: 818, title: 'Technology Club' },
  { startLine: 836, title: 'Garden Club' },
  { startLine: 855, title: 'Writing Club' }
];

function parseSection(secLines, title, id) {
  const content = secLines.join('\n');

  // Find Part 1, 2, 3, 4 positions
  // Regex accommodating Part 1, PART 1, Task 1, Part1:, Part 2, Part2:, etc.
  const p1Idx = content.search(/(Part\s*1|Task\s*1|PART\s*1)\b/i);
  const p2Idx = content.search(/(Part\s*2|Task\s*2|PART\s*2)\b/i);
  const p3Idx = content.search(/(Part\s*3|Task\s*3|PART\s*3)\b/i);
  const p4Idx = content.search(/(Part\s*4|Task\s*4|PART\s*4)\b/i);

  let p1Text = '';
  let p2Text = '';
  let p3Text = '';
  let p4Text = '';

  if (p1Idx !== -1) {
    const end = p2Idx !== -1 ? p2Idx : (p3Idx !== -1 ? p3Idx : (p4Idx !== -1 ? p4Idx : content.length));
    p1Text = content.slice(p1Idx, end);
  }
  if (p2Idx !== -1) {
    const end = p3Idx !== -1 ? p3Idx : (p4Idx !== -1 ? p4Idx : content.length);
    p2Text = content.slice(p2Idx, end);
  }
  if (p3Idx !== -1) {
    const end = p4Idx !== -1 ? p4Idx : content.length;
    p3Text = content.slice(p3Idx, end);
  }
  if (p4Idx !== -1) {
    p4Text = content.slice(p4Idx);
  } else if (p1Idx === -1 && p2Idx === -1 && p3Idx === -1) {
    // If the entire section is just Part 4 (like Food Club 2, Book Club 2, Travel Club 3)
    p4Text = content;
  }

  // --- Parse Part 1 ---
  const part1 = [];
  if (p1Text) {
    const rawP1Lines = p1Text.split('\n').map(l => clean(l)).filter(l => l.length > 0);
    let curQ = '';
    let curAns = '';
    let qNum = 1;

    for (let i = 0; i < rawP1Lines.length; i++) {
      const line = rawP1Lines[i];
      if (/^(Part\s*1|Task\s*1|PART\s*1|You want to join|Fill in the form|Write short)/i.test(line)) continue;

      const numMatch = line.match(/^(\d+)[\.\)]\s*(.+)/);
      if (numMatch) {
        if (curQ) {
          part1.push({ questionNumber: qNum++, question: curQ, sampleAnswer: curAns.trim() });
          curAns = '';
        }
        let qBody = numMatch[2].trim();
        // check inline question mark
        const inlineQ = qBody.match(/(.+?\?)\s*(.+)/);
        if (inlineQ) {
          curQ = inlineQ[1].trim();
          curAns = inlineQ[2].trim();
        } else {
          curQ = qBody.endsWith('?') ? qBody : qBody + '?';
        }
      } else if (line.endsWith('?')) {
        if (curQ) {
          part1.push({ questionNumber: qNum++, question: curQ, sampleAnswer: curAns.trim() });
          curAns = '';
        }
        curQ = line;
      } else {
        if (curQ) {
          curAns += (curAns ? ' ' : '') + line;
        }
      }
    }
    if (curQ) {
      part1.push({ questionNumber: qNum++, question: curQ, sampleAnswer: curAns.trim() });
    }
  }

  // Ensure 5 questions for Part 1
  const defaultP1Defaults = [
    { question: "What is your hobby?", sampleAnswer: "I enjoy listening to music" },
    { question: "How do you get to work?", sampleAnswer: "I ride my motorbike" },
    { question: "What is the weather like today?", sampleAnswer: "It is warm and sunny" },
    { question: "What is your favorite food?", sampleAnswer: "I like Vietnamese noodles" },
    { question: "Where are you from?", sampleAnswer: "I am from Vietnam" }
  ];

  while (part1.length < 5) {
    const def = defaultP1Defaults[part1.length];
    part1.push({
      questionNumber: part1.length + 1,
      question: def.question,
      sampleAnswer: def.sampleAnswer
    });
  }

  // Trim Part 1 to exactly 5 questions
  const finalPart1 = part1.slice(0, 5).map((q, idx) => ({
    questionNumber: idx + 1,
    question: q.question,
    sampleAnswer: q.sampleAnswer || defaultP1Defaults[idx]?.sampleAnswer || "I like it"
  }));

  // --- Parse Part 2 ---
  let p2Prompt = '';
  let p2Answer = '';
  let p2Instruction = `You are a new member of ${title}. Fill in the form. Write in sentences. Use 20 - 30 words.`;

  if (p2Text) {
    const rawP2Lines = p2Text.split('\n').map(l => clean(l)).filter(l => l.length > 0);
    for (let i = 0; i < rawP2Lines.length; i++) {
      const line = rawP2Lines[i];
      if (/^(Part\s*2|Task\s*2|PART\s*2|Fill in the form|Write in sentences|Now you've become)/i.test(line)) {
        if (line.length > 35) p2Instruction = line;
        continue;
      }
      if (!p2Prompt && (line.includes('?') || /^(tell me|where|when|what|why|please|who|describe)/i.test(line))) {
        p2Prompt = line;
      } else if (p2Prompt && !p2Answer) {
        p2Answer = line;
      } else if (p2Prompt && p2Answer) {
        p2Answer += ' ' + line;
      }
    }
  }

  if (!p2Prompt) {
    p2Prompt = `Please tell us why you decided to join ${title} and what you hope to achieve here?`;
    p2Answer = `I decided to join the club because I want to learn more, meet new people with similar interests, and improve my personal skills. It will be a wonderful experience for me.`;
  }

  // --- Parse Part 3 ---
  const part3Items = [];
  if (p3Text) {
    const rawP3Lines = p3Text.split('\n').map(l => clean(l)).filter(l => l.length > 0);
    let curSpeaker = '';
    let curQ = '';
    let curAns = '';

    for (let i = 0; i < rawP3Lines.length; i++) {
      const line = rawP3Lines[i];
      if (/^(Part\s*3|Task\s*3|PART\s*3|You are a member|You are talking|Talk to them|Use 30|Respond to them|Answer our questions)/i.test(line)) continue;

      const speakerMatch = line.match(/^([A-Za-z0-9]+)\s*[:.-]\s*(.+)/);
      if (speakerMatch && speakerMatch[1].length <= 8 && !/^(in my|as for|yesterday|when I|last|first)/i.test(speakerMatch[1])) {
        if (curQ) {
          part3Items.push({ speaker: curSpeaker || 'Member', question: curQ, sampleAnswer: curAns.trim() });
          curAns = '';
        }
        curSpeaker = speakerMatch[1];
        curQ = speakerMatch[2].trim();
      } else if (line.includes('?') && !curQ) {
        curQ = line;
        curSpeaker = curSpeaker || `Member ${part3Items.length + 1}`;
      } else if (line.includes('?') && curAns) {
        part3Items.push({ speaker: curSpeaker || 'Member', question: curQ, sampleAnswer: curAns.trim() });
        curSpeaker = `Member ${part3Items.length + 1}`;
        curQ = line;
        curAns = '';
      } else {
        if (curQ) {
          curAns += (curAns ? ' ' : '') + line;
        }
      }
    }
    if (curQ) {
      part3Items.push({ speaker: curSpeaker || 'Member', question: curQ, sampleAnswer: curAns.trim() });
    }
  }

  // Ensure exactly 3 questions for Part 3
  const defaultP3Speakers = ['Member A', 'Member B', 'Member C'];
  const defaultP3Questions = [
    `Hi! Welcome to ${title}. How did you first get interested in this activity?`,
    `Do you prefer participating on weekdays or on weekends? Why?`,
    `What suggestions do you have for our club to attract more young members?`
  ];
  const defaultP3Answers = [
    `I have been interested in this field since I was in high school. Joining this club gives me an excellent chance to share ideas with others and learn new techniques from experienced members.`,
    `In my opinion, I prefer joining activities on weekends because I have plenty of free time. During weekdays, I am usually occupied with work and study, so weekends help me relax completely.`,
    `I think the club should organize engaging workshops and promote our activities on social media platforms. This is an effective way to reach young people and raise their interest.`
  ];

  while (part3Items.length < 3) {
    const idx = part3Items.length;
    part3Items.push({
      speaker: defaultP3Speakers[idx],
      question: defaultP3Questions[idx],
      sampleAnswer: defaultP3Answers[idx]
    });
  }

  const finalPart3Items = part3Items.slice(0, 3).map((item, idx) => ({
    speaker: item.speaker || defaultP3Speakers[idx],
    question: item.question,
    sampleAnswer: item.sampleAnswer || defaultP3Answers[idx]
  }));

  // --- Parse Part 4 ---
  let p4Context = '';
  let p4Task1Prompt = 'Write an email to your friend. Write about your feelings and what you would like to do. Write about 50 words.';
  let p4Task2Prompt = 'Write an email to the manager of the club. Write about your feelings and suggest possible alternatives. Write about 120-150 words.';
  let p4Task1Answer = '';
  let p4Task2Answer = '';
  let readingMode = 'context'; // 'context' | 'task1_ans' | 'task2_ans'

  if (p4Text) {
    const rawP4Lines = p4Text.split('\n').map(l => clean(l)).filter(l => l.length > 0);
    for (let i = 0; i < rawP4Lines.length; i++) {
      const line = rawP4Lines[i];
      if (/^(Part\s*4|Task\s*4|PART\s*4)/i.test(line)) continue;

      if (/^1[\.\)]\s*(Write an email to your friend|Write to your friend|Email to a friend|Write a short email)/i.test(line) ||
          /(Write an email to your friend|Email to your friend)/i.test(line)) {
        p4Task1Prompt = line;
        readingMode = 'task1_ans';
        continue;
      }
      if (/^2[\.\)]\s*(Write an email to the manager|Write to the manager|Write to the club|Email to the club|Write an email to talk about)/i.test(line) ||
          /(Write an email to the manager|Write an email to the president|Write to the club manager)/i.test(line)) {
        p4Task2Prompt = line;
        readingMode = 'task2_ans';
        continue;
      }

      if (readingMode === 'context') {
        p4Context += (p4Context ? '\n' : '') + line;
      } else if (readingMode === 'task1_ans') {
        p4Task1Answer += (p4Task1Answer ? '\n' : '') + line;
      } else if (readingMode === 'task2_ans') {
        p4Task2Answer += (p4Task2Answer ? '\n' : '') + line;
      }
    }
  }

  if (!p4Context.trim()) {
    p4Context = `Dear Member,\nOur club is planning new upcoming events and would like to collect opinions from members regarding schedule adjustments and fee policies. Please review and respond to the two tasks below.`;
  }

  if (!p4Task1Answer.trim()) {
    p4Task1Answer = `Hi Alex,\nI hope you're doing well. Have you heard the latest announcement from our club? To be honest, I was quite surprised and a bit worried about these changes. We should definitely meet up this weekend to discuss what we can do about it. Let me know what you think!\nBest,\nNam`;
  }

  if (!p4Task2Answer.trim()) {
    p4Task2Answer = `Dear Club Manager,\n\nI am writing this email to express my views regarding the recent announcement about upcoming club adjustments. As an active and dedicated member, I appreciate the committee's continuous efforts to develop our club.\n\nHowever, I am somewhat concerned that the proposed changes might inconvenience many participants, especially students and busy professionals. Therefore, I would like to put forward a couple of constructive suggestions.\n\nFirstly, it would be beneficial to conduct a member survey before making a final decision. Secondly, offering flexible participation options or hybrid sessions could help accommodate everyone.\n\nThank you for taking the time to consider my recommendations. I look forward to hearing your thoughts on this matter.\n\nYours sincerely,\nNam Nguyen`;
  }

  return {
    id,
    title,
    description: `Aptis ESOL Writing • Chủ đề ${title}`,
    part1: finalPart1,
    part2: {
      instruction: p2Instruction,
      prompt: p2Prompt,
      wordLimit: '20 - 30 từ',
      sampleAnswer: p2Answer.trim()
    },
    part3: {
      instruction: `You are speaking to other members in the ${title} chat room. Respond to them in full sentences (30 - 40 words per answer).`,
      items: finalPart3Items,
      wordLimit: '30 - 40 từ'
    },
    part4: {
      context: p4Context.trim(),
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
  };
}

// Execute parsing across all 40 markers
const topics = [];
const topicMap = {};

for (let i = 0; i < markers.length; i++) {
  const m = markers[i];
  const start = m.startLine - 1;
  const end = i < markers.length - 1 ? markers[i + 1].startLine - 1 : lines.length;
  const secLines = lines.slice(start, end);
  const id = slugify(m.title);

  const topicObj = parseSection(secLines, m.title, id);
  topics.push(topicObj);
  topicMap[id] = topicObj;
}

// For topics with inheritFrom, copy Part 1, 2, 3 from the parent topic
markers.forEach(m => {
  if (m.inheritFrom && topicMap[m.inheritFrom]) {
    const parent = topicMap[m.inheritFrom];
    const target = topicMap[slugify(m.title)];
    if (target) {
      target.part1 = JSON.parse(JSON.stringify(parent.part1));
      target.part2 = JSON.parse(JSON.stringify(parent.part2));
      target.part3 = JSON.parse(JSON.stringify(parent.part3));
    }
  }
});

console.log(`Successfully generated ${topics.length} complete topics!`);

fs.writeFileSync(path.join(__dirname, '../src/data/aptis_writing_topics.json'), JSON.stringify(topics, null, 2), 'utf-8');
console.log('Saved 40 topics to src/data/aptis_writing_topics.json');

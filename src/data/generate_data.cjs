const fs = require('fs');
const path = require('path');

const targetDir = __dirname;

// Copy day 1
const day1Source = path.join(__dirname, '..', '..', '..', 'day1_present_simple.json');
if (fs.existsSync(day1Source)) {
  const day1 = fs.readFileSync(day1Source, 'utf8');
  const parsed1 = JSON.parse(day1);
  parsed1.id = 'day1-present-simple';
  fs.writeFileSync(path.join(targetDir, 'day1_present_simple.json'), JSON.stringify(parsed1, null, 2));
}

// Day 2 Past Tenses
const day2 = {
  id: 'day2-past-tenses',
  title: 'Day 2: Past Simple & Past Continuous',
  description: 'Thì Quá khứ đơn & Quá khứ tiếp diễn trong đề thi TOEIC & Ngữ cảnh công sở (15 câu)',
  level: 'Intermediate (B1)',
  category: 'Grammar',
  timeLimitMinutes: 15,
  questions: [
    {
      id: 1,
      part: 'Part A — Quá Khứ Đơn Cơ Bản',
      question: 'The accounting team ______ the annual financial audit yesterday.',
      options: ['finalize', 'finalizes', 'finalized', 'was finalizing'],
      correct: 2,
      explanation: 'Dấu hiệu thời gian "yesterday" chỉ hành động đã hoàn tất hoàn toàn trong quá khứ -> chọn thì Quá khứ đơn "finalized".'
    },
    {
      id: 2,
      part: 'Part A — Quá Khứ Đơn Cơ Bản',
      question: 'Ms. Clara ______ the contract before sending it to the legal division.',
      options: ['review', 'reviewed', 'reviews', 'has reviewed'],
      correct: 1,
      explanation: 'Chuỗi hành động xảy ra tuần tự trong quá khứ -> "reviewed".'
    },
    {
      id: 3,
      part: 'Part B — Quá Khứ Tiếp Diễn & Cắt Ngang',
      question: 'While Mr. Tanaka ______ the proposal, the system crashed unexpectedly.',
      options: ['is writing', 'wrote', 'was writing', 'writes'],
      correct: 2,
      explanation: 'Hành động đang diễn ra trong quá khứ dùng Quá khứ tiếp diễn (was writing), hành động ngắn xen vào dùng Quá khứ đơn (crashed).'
    },
    {
      id: 4,
      part: 'Part B — Quá Khứ Tiếp Diễn & Cắt Ngang',
      question: 'The clients arrived at the venue while we ______ up the presentation screens.',
      options: ['set', 'were setting', 'are setting', 'have set'],
      correct: 1,
      explanation: 'Hành động đang diễn ra lúc khách đến là "were setting up".'
    },
    {
      id: 5,
      part: 'Part C — Bẫy Động Từ & Từ Vựng TOEIC',
      question: 'Two days ago, the project director ______ to expand the marketing budget.',
      options: ['decides', 'decided', 'deciding', 'decision'],
      correct: 1,
      explanation: 'Dấu hiệu "Two days ago" cần động từ chia quá khứ đơn -> "decided".'
    },
    {
      id: 6,
      part: 'Part C — Bẫy Động Từ & Từ Vựng TOEIC',
      question: 'The firm ______ a major increase in sales during the previous quarter.',
      options: ['report', 'reported', 'reporting', 'reports'],
      correct: 1,
      explanation: '"During the previous quarter" chỉ thời gian quý trước đã kết thúc -> "reported".'
    },
    {
      id: 7,
      part: 'Part C — Bẫy Động Từ & Từ Vựng TOEIC',
      question: 'When the fire alarm rang, everyone ______ out of the building safely.',
      options: ['walks', 'was walking', 'walked', 'has walked'],
      correct: 2,
      explanation: 'Chuỗi phản ứng liên tiếp trong quá khứ -> "walked".'
    },
    {
      id: 8,
      part: 'Part C — Bẫy Động Từ & Từ Vựng TOEIC',
      question: 'The software engineer ______ the bug before the end of his shift.',
      options: ['fix', 'fixed', 'fixing', 'fixes'],
      correct: 1,
      explanation: 'Hành động đã hoàn thành trong quá khứ -> "fixed".'
    },
    {
      id: 9,
      part: 'Part C — Bẫy Động Từ & Từ Vựng TOEIC',
      question: 'Last night, the CEO ______ an emergency announcement regarding the merger.',
      options: ['make', 'makes', 'made', 'making'],
      correct: 2,
      explanation: 'Quá khứ của "make" là "made". Dấu hiệu "Last night".'
    },
    {
      id: 10,
      part: 'Part C — Bẫy Động Từ & Từ Vựng TOEIC',
      question: 'We ______ any major complaints from users last week.',
      options: ["didn't receive", "don't receive", "haven't received", "not received"],
      correct: 0,
      explanation: 'Phủ định quá khứ đơn dùng "didn\'t + V-inf" -> "didn\'t receive".'
    },
    {
      id: 11,
      part: 'Part C — Bẫy Động Từ & Từ Vựng TOEIC',
      question: 'The new regional branch ______ operations three months ago.',
      options: ['commence', 'commenced', 'commences', 'commencing'],
      correct: 1,
      explanation: '"Commence" (bắt đầu), chia quá khứ đơn có "ago" -> "commenced".'
    },
    {
      id: 12,
      part: 'Part C — Bẫy Động Từ & Từ Vựng TOEIC',
      question: 'While the technical team ______ the server, users experienced brief interruptions.',
      options: ['upgraded', 'was upgrading', 'upgrades', 'is upgrading'],
      correct: 1,
      explanation: '"The technical team" (dạng số ít) đang nâng cấp máy chủ -> "was upgrading".'
    },
    {
      id: 13,
      part: 'Part C — Bẫy Động Từ & Từ Vựng TOEIC',
      question: 'She ______ her flight ticket to Tokyo last Tuesday.',
      options: ['book', 'booked', 'booking', 'books'],
      correct: 1,
      explanation: 'Dấu hiệu "last Tuesday" -> chia quá khứ đơn "booked".'
    },
    {
      id: 14,
      part: 'Part C — Bẫy Động Từ & Từ Vựng TOEIC',
      question: 'The company ______ its 10th anniversary celebration in Paris last year.',
      options: ['hosts', 'hosted', 'hosting', 'host'],
      correct: 1,
      explanation: '"Last year" -> chia quá khứ đơn "hosted".'
    },
    {
      id: 15,
      part: 'Part C — Bẫy Động Từ & Từ Vựng TOEIC',
      question: 'They ______ to an agreement after hours of intensive negotiation.',
      options: ['come', 'came', 'coming', 'comes'],
      correct: 1,
      explanation: 'Quá khứ đơn của "come" là "came".'
    }
  ]
};

// Day 3 Vocabulary
const day3 = {
  id: 'day3-toeic-vocab',
  title: 'Day 3: Essential Business Vocabulary & Collocations',
  description: 'Từ vựng Tiếng Anh thương mại & TOEIC Part 5/6 thông dụng nhất (15 câu)',
  level: 'Intermediate (B1 - B2)',
  category: 'Vocabulary',
  timeLimitMinutes: 12,
  questions: [
    {
      id: 1,
      part: 'Part A — Từ Vựng Văn Phòng & Thương Mại',
      question: 'The company offers a highly ______ salary package to attract top talents.',
      options: ['competitive', 'compete', 'competition', 'competitor'],
      correct: 0,
      explanation: 'Sau trạng từ "highly" và trước danh từ "salary package" cần một tính từ -> "competitive" (cạnh tranh).'
    },
    {
      id: 2,
      part: 'Part A — Từ Vựng Văn Phòng & Thương Mại',
      question: 'Please submit your application before the deadline to ensure ______ consideration.',
      options: ['prompt', 'promptly', 'promptness', 'prompts'],
      correct: 0,
      explanation: 'Trước danh từ "consideration" cần tính từ bổ nghĩa -> "prompt" (nhanh chóng, kịp thời).'
    },
    {
      id: 3,
      part: 'Part A — Từ Vựng Văn Phòng & Thương Mại',
      question: 'All employees are required to attend the mandatory safety ______ tomorrow.',
      options: ['seminar', 'product', 'invoice', 'receipt'],
      correct: 0,
      explanation: 'Cụm từ "safety seminar" (hội thảo an toàn). Các đáp án khác không phù hợp ngữ cảnh.'
    },
    {
      id: 4,
      part: 'Part B — Từ Loại & Cụm Từ Thường Gặp',
      question: 'The board of directors approved the proposed budget ______ after reviewing the financial audit.',
      options: ['unanimously', 'unanimous', 'unanimity', 'unanimousness'],
      correct: 0,
      explanation: 'Sau động từ "approved" cần trạng từ chỉ thể cách -> "unanimously" (nhất trí 100%).'
    },
    {
      id: 5,
      part: 'Part B — Từ Loại & Cụm Từ Thường Gặp',
      question: 'Passengers are advised to keep their personal belongings ______ at all times.',
      options: ['secure', 'securely', 'security', 'securing'],
      correct: 0,
      explanation: 'Cấu trúc "keep + O + adj" -> chọn tính từ "secure" (an toàn, bảo vệ).'
    },
    {
      id: 6,
      part: 'Part C — Cụm Từ Giới Từ & Cấu Trúc TOEIC',
      question: 'Due to unforeseen circumstances, the workshop has been postponed ______ further notice.',
      options: ['until', 'by', 'for', 'since'],
      correct: 0,
      explanation: 'Cụm cố định "until further notice" nghĩa là cho đến khi có thông báo mới.'
    },
    {
      id: 7,
      part: 'Part C — Cụm Từ Giới Từ & Cấu Trúc TOEIC',
      question: 'The new policy will take ______ starting next Monday.',
      options: ['effect', 'affect', 'effective', 'effectively'],
      correct: 0,
      explanation: 'Cụm từ "take effect" có nghĩa là có hiệu lực.'
    },
    {
      id: 8,
      part: 'Part C — Cụm Từ Giới Từ & Cấu Trúc TOEIC',
      question: 'Mr. David is directly responsible ______ managing international client relations.',
      options: ['for', 'to', 'with', 'about'],
      correct: 0,
      explanation: 'Cấu trúc "be responsible for + V-ing/N" (chịu trách nhiệm cho việc gì).'
    },
    {
      id: 9,
      part: 'Part C — Cụm Từ Giới Từ & Cấu Trúc TOEIC',
      question: 'The revised manual contains clear instructions for equipment ______.',
      options: ['maintenance', 'maintain', 'maintained', 'maintaining'],
      correct: 0,
      explanation: 'Sau danh từ "equipment" cần danh từ ghép -> "equipment maintenance" (việc bảo trì thiết bị).'
    },
    {
      id: 10,
      part: 'Part C — Cụm Từ Giới Từ & Cấu Trúc TOEIC',
      question: 'We sincerely appreciate your ongoing ______ to our charitable foundation.',
      options: ['contribution', 'contribute', 'contributed', 'contributing'],
      correct: 0,
      explanation: 'Sau tính từ sở hữu "your" và tính từ "ongoing" cần một danh từ -> "contribution" (sự đóng góp).'
    },
    {
      id: 11,
      part: 'Part C — Cụm Từ Giới Từ & Cấu Trúc TOEIC',
      question: 'The warranty covers free repair service for any manufacturing ______.',
      options: ['defects', 'defective', 'defectively', 'defecting'],
      correct: 0,
      explanation: '"manufacturing defects" (lỗi từ nhà sản xuất).'
    },
    {
      id: 12,
      part: 'Part C — Cụm Từ Giới Từ & Cấu Trúc TOEIC',
      question: 'Please review the attached document and let us know if any ______ are needed.',
      options: ['revisions', 'revise', 'revising', 'revised'],
      correct: 0,
      explanation: 'Sau "any" cần một danh từ số nhiều -> "revisions" (sự chỉnh sửa).'
    },
    {
      id: 13,
      part: 'Part C — Cụm Từ Giới Từ & Cấu Trúc TOEIC',
      question: 'The marketing campaign resulted in a substantial ______ in customer engagements.',
      options: ['increase', 'increasing', 'increasingly', 'increased'],
      correct: 0,
      explanation: 'Sau tính từ "substantial" cần danh từ -> "increase" (sự gia tăng).'
    },
    {
      id: 14,
      part: 'Part C — Cụm Từ Giới Từ & Cấu Trúc TOEIC',
      question: 'Candidates must possess excellent communication skills and a strong work ______.',
      options: ['ethic', 'ethical', 'ethically', 'ethics'],
      correct: 0,
      explanation: 'Cụm danh từ "work ethic" (đạo đức nghề nghiệp / tác phong làm việc).'
    },
    {
      id: 15,
      part: 'Part C — Cụm Từ Giới Từ & Cấu Trúc TOEIC',
      question: 'The hotel is conveniently ______ within walking distance of the central train station.',
      options: ['located', 'location', 'locating', 'locate'],
      correct: 0,
      explanation: 'Cụm "be conveniently located" (nằm ở vị trí thuận tiện).'
    }
  ]
};

fs.writeFileSync(path.join(targetDir, 'day2_past_tenses.json'), JSON.stringify(day2, null, 2));
fs.writeFileSync(path.join(targetDir, 'day3_toeic_vocab.json'), JSON.stringify(day3, null, 2));

// Copy files to public/data so they can be fetched as static files or bundled
const publicDataDir = path.join(__dirname, '..', '..', 'public', 'data');
if (!fs.existsSync(publicDataDir)) fs.mkdirSync(publicDataDir, { recursive: true });

fs.copyFileSync(path.join(targetDir, 'day1_present_simple.json'), path.join(publicDataDir, 'day1_present_simple.json'));
fs.copyFileSync(path.join(targetDir, 'day2_past_tenses.json'), path.join(publicDataDir, 'day2_past_tenses.json'));
fs.copyFileSync(path.join(targetDir, 'day3_toeic_vocab.json'), path.join(publicDataDir, 'day3_toeic_vocab.json'));

console.log('All JSON datasets successfully generated in src/data and public/data!');

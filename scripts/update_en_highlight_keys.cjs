const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../src/data/aptis_listening_part4_pairs.json');
const rootDataPath = path.join(__dirname, '../data/aptis_listening_part4_pairs.json');

const data = JSON.parse(fs.readFileSync(srcPath, 'utf8'));

// Updates map for English keywords corresponding to user's Vietnamese request:
// 1: Tiêu cực (harmful effect / harmful), cân bằng (balance)
// 2: Khác biệt (different), lắng nghe (listen)
// 4: nghỉ hưu (retire), thành công (successful)
// 7: Tiếng ồn (noise), Truyền thông (media)
// 8: hấp dẫn (exciting), độc giả nói chung (general audience)
// 9: kỳ vọng (expected), hoàn cảnh (situation)
// 10: linh hoạt và cởi mở hơn (more flexible and open-minded), cạnh tranh hơn (more competitive)
// 13: chính xác (accurately), câu trả lời (answer)
// 14: Khoảng thời gian riêng (dedicated periods), tìm kiếm lời khuyên (seek advice)
// 15: thái độ tích cực (positive attitude), thay đổi (changing)
// 16: lo lắng (worried), sự hiện diện của chúng (their presence)
// 18: Cuộc phiêu lưu (adventure), Thế hệ (generations)
// 21: Phục vụ không tốt (service wasn't good), khách hàng cảm thấy được coi trọng (feel valued)

const enUpdates = {
  1: ['harmful effect', 'balance'],
  2: ['different', 'listen'],
  4: ['retire', 'successful'],
  7: ['noise', 'media'],
  8: ['exciting', 'general audience'],
  9: ['expected', 'situation'],
  10: ['more flexible and open-minded', 'more competitive'],
  13: ['accurately', 'answer'],
  14: ['dedicated periods', 'seek advice'],
  15: ['positive attitude', 'changing'],
  16: ['worried', 'their presence'],
  18: ['adventure', 'generations'],
  21: ["service wasn't good", 'feel valued']
};

Object.keys(enUpdates).forEach(pIdxStr => {
  const pIdx = parseInt(pIdxStr, 10);
  const pair = data.pairs[pIdx - 1];
  const [en1, en2] = enUpdates[pIdx];
  const q1 = pair.questions[0];
  const q2 = pair.questions[1];
  const opt1 = q1.options[q1.correct];
  const opt2 = q2.options[q2.correct];
  const m1 = opt1.toLowerCase().includes(en1.toLowerCase());
  const m2 = opt2.toLowerCase().includes(en2.toLowerCase());

  console.log(`Pair ${pIdx} En: Q1 match=${m1} [${en1}] in [${opt1}] | Q2 match=${m2} [${en2}] in [${opt2}]`);
  if (!m1 || !m2) throw new Error(`English keyword match failed for pair ${pIdx}`);

  q1.keyHighlight = en1;
  q2.keyHighlight = en2;
});

fs.writeFileSync(srcPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
if (fs.existsSync(rootDataPath)) {
  fs.writeFileSync(rootDataPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
console.log('Successfully updated English keyHighlight in JSON files!');

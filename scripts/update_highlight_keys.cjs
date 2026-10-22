const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../src/data/aptis_listening_part4_pairs.json');
const rootDataPath = path.join(__dirname, '../data/aptis_listening_part4_pairs.json');

const data = JSON.parse(fs.readFileSync(srcPath, 'utf8'));

const updates = {
  1: ['tiêu cực', 'cân bằng'],
  2: ['khác biệt', 'lắng nghe'],
  4: ['nghỉ hưu', 'thành công'],
  7: ['tiếng ồn', 'truyền thông'],
  8: ['hấp dẫn', 'độc giả nói chung'],
  9: ['kỳ vọng', 'hoàn cảnh'],
  10: ['linh hoạt và cởi mở hơn', 'cạnh tranh hơn'],
  13: ['chính xác', 'câu trả lời'],
  14: ['khoảng thời gian riêng', 'tìm kiếm lời khuyên'],
  15: ['thái độ tích cực', 'thay đổi'],
  16: ['lo lắng', 'sự hiện diện của chúng'],
  18: ['cuộc phiêu lưu', 'thế hệ'],
  21: ['phục vụ không tốt', 'khách hàng cảm thấy được coi trọng']
};

// For pair 2, adjust option text to use 'khác biệt' so it matches the keyword exactly
const p2 = data.pairs[1];
p2.questions[0].optionsVi[0] = 'Nó khá khác biệt so với những tác phẩm trước đây của anh ấy';

Object.keys(updates).forEach(pairIdxStr => {
  const pIdx = parseInt(pairIdxStr, 10);
  const pair = data.pairs[pIdx - 1];
  const [k1, k2] = updates[pIdx];
  pair.questions[0].keyHighlightVi = k1;
  pair.questions[1].keyHighlightVi = k2;
});

// Verify each
Object.keys(updates).forEach(pairIdxStr => {
  const pIdx = parseInt(pairIdxStr, 10);
  const pair = data.pairs[pIdx - 1];
  const q1 = pair.questions[0];
  const q2 = pair.questions[1];
  const opt1 = q1.optionsVi[q1.correct];
  const opt2 = q2.optionsVi[q2.correct];
  const m1 = opt1.toLowerCase().includes(q1.keyHighlightVi.toLowerCase());
  const m2 = opt2.toLowerCase().includes(q2.keyHighlightVi.toLowerCase());
  console.log(`Pair ${pIdx}: Q1 match=${m1} [${q1.keyHighlightVi}] in [${opt1}], Q2 match=${m2} [${q2.keyHighlightVi}] in [${opt2}]`);
  if (!m1 || !m2) throw new Error(`Match failed for pair ${pIdx}`);
});

fs.writeFileSync(srcPath, JSON.stringify(data, null, 2) + '\n', 'utf8');

if (fs.existsSync(rootDataPath)) {
  fs.writeFileSync(rootDataPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
console.log('Successfully updated JSON files!');

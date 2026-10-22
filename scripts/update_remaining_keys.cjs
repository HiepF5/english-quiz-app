const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../src/data/aptis_listening_part4_pairs.json');
const rootDataPath = path.join(__dirname, '../data/aptis_listening_part4_pairs.json');

const data = JSON.parse(fs.readFileSync(srcPath, 'utf8'));

// Cặp từ khóa ngắn gọn, dễ nhớ (1-3 từ đắt giá nhất) cho toàn bộ 17 bài còn lại:
const remainingUpdates = {
  3: {
    en: ['modern society', 'not always easily identified'],
    vi: ['xã hội hiện đại', 'dễ nhận diện']
  },
  5: {
    en: ['interesting', 'popularity'],
    vi: ['thú vị', 'sự nổi tiếng']
  },
  6: {
    en: ['independent', 'not ready'],
    vi: ['độc lập', 'chưa sẵn sàng']
  },
  11: {
    en: ['alternatives to driving', 'resistance'],
    vi: ['thay thế cho việc lái xe', 'sự phản đối']
  },
  12: {
    en: ['exaggerated claims', 'too similar'],
    vi: ['phóng đại', 'quá giống']
  },
  17: {
    en: ['new customers', 'fans'],
    vi: ['khách hàng mới', 'người hâm mộ']
  },
  19: {
    en: ['resources', 'experienced'],
    vi: ['nguồn lực', 'có kinh nghiệm']
  },
  20: {
    en: ['unrealistic', 'negatively'],
    vi: ['phi thực tế', 'tiêu cực']
  },
  22: {
    en: ['overexposure', 'attention'],
    vi: ['xuất hiện quá nhiều', 'sự chú ý']
  },
  23: {
    en: ['flexible', 'limits'],
    vi: ['linh hoạt', 'giới hạn']
  },
  24: {
    en: ['relate to', 'ambitious failure'],
    vi: ['đồng cảm', 'thất bại đầy tham vọng']
  },
  25: {
    en: ['similar', 'plot'],
    vi: ['rất giống', 'cốt truyện']
  },
  26: {
    en: ['not promote', 'community'],
    vi: ['không quảng bá', 'cộng đồng']
  },
  27: {
    en: ['time management', 'effort'],
    vi: ['quản lý thời gian', 'nỗ lực']
  },
  28: {
    en: ['description', 'unconventional'],
    vi: ['mô tả', 'phá cách']
  },
  29: {
    en: ['instincts', 'hard to get started'],
    vi: ['bản năng', 'khó khăn khi mới bắt đầu']
  },
  30: {
    en: ['similar', 'window to the past'],
    vi: ['tương tự', 'cánh cửa sổ nhìn về quá khứ']
  }
};

Object.keys(remainingUpdates).forEach(pIdxStr => {
  const pIdx = parseInt(pIdxStr, 10);
  const pair = data.pairs[pIdx - 1];
  const conf = remainingUpdates[pIdx];

  const q1 = pair.questions[0];
  const q2 = pair.questions[1];

  const opt1En = q1.options[q1.correct];
  const opt2En = q2.options[q2.correct];
  const opt1Vi = q1.optionsVi[q1.correct];
  const opt2Vi = q2.optionsVi[q2.correct];

  const m1En = opt1En.toLowerCase().includes(conf.en[0].toLowerCase());
  const m2En = opt2En.toLowerCase().includes(conf.en[1].toLowerCase());
  const m1Vi = opt1Vi.toLowerCase().includes(conf.vi[0].toLowerCase());
  const m2Vi = opt2Vi.toLowerCase().includes(conf.vi[1].toLowerCase());

  console.log(`Pair ${pIdx}:`);
  console.log(`  Q1: En match=${m1En} [${conf.en[0]}] in [${opt1En}] | Vi match=${m1Vi} [${conf.vi[0]}] in [${opt1Vi}]`);
  console.log(`  Q2: En match=${m2En} [${conf.en[1]}] in [${opt2En}] | Vi match=${m2Vi} [${conf.vi[1]}] in [${opt2Vi}]`);

  if (!m1En || !m2En || !m1Vi || !m2Vi) {
    throw new Error(`Match validation failed for pair ${pIdx}`);
  }

  q1.keyHighlight = conf.en[0];
  q1.keyHighlightVi = conf.vi[0];
  q2.keyHighlight = conf.en[1];
  q2.keyHighlightVi = conf.vi[1];
});

fs.writeFileSync(srcPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
if (fs.existsSync(rootDataPath)) {
  fs.writeFileSync(rootDataPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

console.log('Successfully updated all remaining key highlights!');

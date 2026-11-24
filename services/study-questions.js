const { createHash, randomInt } = require('node:crypto');
const { selectAdaptiveQuestions } = require('../core/rules/adaptive.rules');

const BLOOM_LEVELS = ['REMEMBER', 'UNDERSTAND', 'APPLY'];
const BLOOM_PRESETS = {
  3: [
    ['Khởi động & Ghi nhớ', 80, 20, 0],
    ['Thấu hiểu bản chất', 30, 50, 20],
    ['Vận dụng thực tiễn', 10, 30, 60]
  ],
  4: [
    ['Khởi động & Nhận biết', 70, 30, 0],
    ['Tăng tốc & Thấu hiểu', 40, 40, 20],
    ['Bứt phá & Vận dụng', 20, 30, 50],
    ['Làm chủ & Sắp xếp', 10, 60, 30]
  ],
  5: [
    ['Khởi động & Nhận diện', 70, 30, 0],
    ['Thấm sâu khái niệm', 30, 50, 20],
    ['Tăng tốc & Thử thách', 10, 40, 50],
    ['Bứt phá kỹ năng', 0, 30, 70],
    ['Đỉnh tháp & Làm chủ', 0, 10, 90]
  ]
};

function getStepConfig(milestone, stepNo) {
  const preset = BLOOM_PRESETS[milestone.step_count >= 5 ? 5 : milestone.step_count] || BLOOM_PRESETS[4];
  const [title, remember, understand, apply] = preset[stepNo - 1] ?? ['Chặng ' + stepNo, 33, 33, 34];
  const override = milestone.bloom_config?.[stepNo];
  return {
    step_no: stepNo,
    title,
    remember_pct: override?.remember_pct ?? remember,
    understand_pct: override?.understand_pct ?? understand,
    apply_pct: override?.apply_pct ?? apply
  };
}

function shuffle(items) {
  const values = [...items];
  for (let index = values.length - 1; index > 0; index--) {
    const other = randomInt(index + 1);
    [values[index], values[other]] = [values[other], values[index]];
  }
  return values;
}

function chooseAdaptive(candidates, memory, count) {
  if (!count) return [];
  // Reuse the existing memory selector with its internal question identifier.
  const choices = candidates.map(question => ({ ma_cau_hoi: question.id, question }));
  return selectAdaptiveQuestions(choices, memory, count).slice(0, count).map(choice => choice.question);
}

function pickStudyQuestions(questions, count, config, memory = {}) {
  if (questions.length <= count) return shuffle(questions);

  const remember = Math.round(count * config.remember_pct / 100);
  const understand = Math.min(count - remember, Math.round(count * config.understand_pct / 100));
  const needs = [remember, understand, count - remember - understand];
  const picked = new Set(BLOOM_LEVELS.flatMap((level, index) => chooseAdaptive(
    questions.filter(question => question.bloom_level === level),
    memory,
    needs[index]
  )));
  const remaining = questions.filter(question => !picked.has(question));
  return shuffle([...picked, ...chooseAdaptive(remaining, memory, count - picked.size)]);
}

function shuffledPresentation(items, sessionId, questionId, field) {
  // Reopening an issued question must show the same presentation order.
  return items
    .map((item, index) => ({
      item,
      order: createHash('sha256').update([sessionId, questionId, field, index].join(':')).digest()
    }))
    .sort((left, right) => Buffer.compare(left.order, right.order))
    .map(entry => entry.item);
}

function presentQuestion(question, sessionId) {
  const { position, id, type, stem, bloom_level, difficulty, payload } = question;
  const dto = { position, id, type, stem, bloom_level, difficulty };
  const reorder = (items, field) => shuffledPresentation(items, sessionId, id, field);

  switch (type) {
    case 'MULTIPLE_CHOICE':
      if (question.options.length !== 4) throw new Error('Câu trắc nghiệm thiếu phương án hợp lệ.');
      return { ...dto, options: reorder(question.options.map(option => ({
        position: option.position,
        text: option.text
      })), 'options') };
    case 'MATCHING':
      return {
        ...dto,
        left_items: reorder(payload.pairs.map(pair => pair.left), 'left'),
        right_items: reorder(payload.pairs.map(pair => pair.right), 'right')
      };
    case 'FILL_BLANK':
      return {
        ...dto,
        sentence_template: payload.sentence_template,
        options: reorder(payload.options, 'fill')
      };
    case 'ORDERING':
      return {
        ...dto,
        prompt: payload.prompt,
        tokens: reorder([...payload.correct_order, ...payload.distractors], 'tokens'),
        token_count: payload.correct_order.length
      };
    default:
      throw new Error('Dạng câu hỏi không hợp lệ.');
  }
}

const isText = value => typeof value === 'string' && value.trim().length > 0;
const trimmed = text => text.trim();

function fitsBank(values, available) {
  const counts = new Map();
  for (const text of available) counts.set(trimmed(text), (counts.get(trimmed(text)) || 0) + 1);
  for (const text of values) {
    const key = trimmed(text);
    const count = counts.get(key);
    if (!count) return false;
    counts.set(key, count - 1);
  }
  return true;
}

function correctAnswer(question) {
  switch (question.type) {
    case 'MULTIPLE_CHOICE': return question.options.find(option => option.is_correct)?.position;
    case 'FILL_BLANK': return question.payload.blank_answer;
    case 'MATCHING': return question.payload.pairs;
    case 'ORDERING': return question.payload.correct_order;
    default: throw new Error('Dạng câu hỏi không hợp lệ.');
  }
}

function pairMatches(question, left, right) {
  if (question.type !== 'MATCHING' || !isText(left) || !isText(right)
      || !question.payload.pairs.some(pair => trimmed(pair.left) === trimmed(left))
      || !question.payload.pairs.some(pair => trimmed(pair.right) === trimmed(right))) {
    throw new Error('Cặp ghép không thuộc câu hỏi này.');
  }
  return question.payload.pairs.some(pair => trimmed(pair.left) === trimmed(left)
    && trimmed(pair.right) === trimmed(right));
}

function gradeQuestion(question, submission) {
  const { selected_option_position: position, submitted_text: text, response } = submission;
  const provided = [position, text, response].filter(value => value !== undefined && value !== null);
  if (provided.length !== 1) throw new Error('Mỗi lượt cần đúng một dạng câu trả lời.');

  const normalized = { selected_option_position: null, submitted_text: null, response: null };
  const expected = correctAnswer(question);
  let isCorrect;

  if (response?.kind === 'TIMEOUT' && Object.keys(response).length === 1) {
    normalized.response = { kind: 'TIMEOUT' };
    return { ...normalized, is_correct: false };
  }

  switch (question.type) {
    case 'MULTIPLE_CHOICE':
      if (!Number.isInteger(position) || !question.options.some(option => option.position === position)) {
        throw new Error('Phương án trắc nghiệm không hợp lệ.');
      }
      normalized.selected_option_position = position;
      isCorrect = position === expected;
      break;
    case 'FILL_BLANK': {
      const option = isText(text) && question.payload.options.find(item => trimmed(item) === trimmed(text));
      if (!option) throw new Error('Từ đã chọn không thuộc ngân hàng của câu.');
      normalized.submitted_text = option;
      isCorrect = trimmed(option).toLowerCase() === trimmed(expected).toLowerCase();
      break;
    }
    case 'MATCHING': {
      const pairs = response?.pairs;
      if (response?.kind !== 'MATCHING' || Object.keys(response).length !== 2 || !Array.isArray(pairs)
          || !pairs.length || pairs.some(pair => !pair || !isText(pair.left) || !isText(pair.right)
            || Object.keys(pair).length !== 2)
          || !fitsBank(pairs.map(pair => pair.left), expected.map(pair => pair.left))
          || !fitsBank(pairs.map(pair => pair.right), expected.map(pair => pair.right))) {
        throw new Error('Cặp ghép không thuộc câu hỏi này.');
      }
      normalized.response = { kind: 'MATCHING', pairs: pairs.map(({ left, right }) => ({ left, right })) };
      const encode = pair => JSON.stringify([trimmed(pair.left), trimmed(pair.right)]);
      isCorrect = pairs.length === expected.length
        && fitsBank(pairs.map(encode), expected.map(encode));
      break;
    }
    case 'ORDERING': {
      const tokens = response?.tokens;
      if (response?.kind !== 'ORDERING' || Object.keys(response).length !== 2 || !Array.isArray(tokens)
          || !tokens.length || tokens.length > expected.length || tokens.some(token => !isText(token))
          || !fitsBank(tokens, [...expected, ...question.payload.distractors])) {
        throw new Error('Thẻ xếp từ không thuộc câu hỏi này.');
      }
      normalized.response = { kind: 'ORDERING', tokens };
      isCorrect = tokens.length === expected.length
        && tokens.every((token, index) => trimmed(token) === trimmed(expected[index]));
      break;
    }
    default:
      throw new Error('Dạng câu hỏi không hợp lệ.');
  }
  return { ...normalized, is_correct: isCorrect };
}

module.exports = { correctAnswer, getStepConfig, gradeQuestion, pairMatches, pickStudyQuestions, presentQuestion };

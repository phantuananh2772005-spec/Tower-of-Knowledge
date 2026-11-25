const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { checkpoints: chapterOneMilestones, questionsList: chapterOneQuestions } = require('./seed_chapter1_5levels');

const subjectSlugs = { mon_csdl: 'co-so-du-lieu', mon_cds: 'chuyen-doi-so' };
const milestoneKinds = { LY_THUYET: 'THEORY', TRAC_NGHIEM: 'QUIZ', THU_THACH_BOSS: 'BOSS' };
const questionTypes = {
  TRAC_NGHIEM_4: 'MULTIPLE_CHOICE',
  NOI_CAP: 'MATCHING',
  DIEN_TU: 'FILL_BLANK',
  SAP_XEP_CAU: 'ORDERING'
};
const bloomLevels = {
  NHO: 'REMEMBER',
  HIEU: 'UNDERSTAND',
  THONG_HIEU: 'UNDERSTAND',
  VAN_DUNG: 'APPLY',
  VAN_DUNG_CAO: 'APPLY',
  PHAN_TICH: 'APPLY'
};

// The legacy SQL files are data sources. Read only literal VALUES from curricula statements.
function readLegacySeed(filename) {
  const input = readFileSync(path.join(__dirname, '../database', filename), 'utf8');
  const sections = { chuong_hoc: [], moc_bai_hoc: [], cau_hoi: [] };
  const statements = /^INSERT\s+INTO\s+(chuong_hoc|moc_bai_hoc|cau_hoi)\s*\(([^)]+)\)\s*VALUES\b/gim;
  const tokens = /\s*(?:'((?:[^']|'')*)'|(NULL\b|-?\d+)|([(),]))/iy;
  const rowSeparator = /\s*,/y;

  for (const statement of input.matchAll(statements)) {
    const [, tableName, columnList] = statement;
    const table = tableName.toLowerCase();
    const columns = columnList.toLowerCase().split(',').map(column => column.trim());
    tokens.lastIndex = statement.index + statement[0].length;
    const readToken = () => {
      const match = tokens.exec(input);
      if (!match) throw new Error(filename + ': unsupported value in ' + table);
      return match;
    };
    for (;;) {
      if (readToken()[3] !== '(') throw new Error(filename + ': expected first value in ' + table);
      const row = {};
      columns.forEach((column, index) => {
        const [, quoted, plain] = readToken();
        if (quoted === undefined && plain === undefined) throw new Error(filename + ': missing ' + column);
        row[column] = quoted !== undefined ? quoted.replace(/''/g, "'") : plain.toUpperCase() === 'NULL' ? null : Number(plain);
        const separator = index === columns.length - 1 ? ')' : ',';
        if (readToken()[3] !== separator) throw new Error(filename + ': invalid VALUES in ' + table);
      });
      sections[table].push(row);
      rowSeparator.lastIndex = tokens.lastIndex;
      if (!rowSeparator.test(input)) break;
      tokens.lastIndex = rowSeparator.lastIndex;
    }
  }
  if (Object.values(sections).some(rows => rows.length === 0)) {
    throw new Error(filename + ': missing curriculum data');
  }
  return sections;
}

function contentId(table, legacyId) {
  if (!legacyId) throw new Error('Missing source ID for ' + table);
  const bytes = createHash('sha256').update('thaptrithuc-v1-content/' + table + '/' + legacyId).digest().subarray(0, 16);
  // Stable UUIDs make reruns safe even after Admin changes content or moves its sort order.
  bytes[6] = (bytes[6] & 0x0f) | 0x80;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)].join('-');
}

function normalizeQuestion(source) {
  const {
    ma_cau_hoi, ma_moc, loai_cau_hoi, muc_bloom, noi_dung, giai_thich, do_kho, buoc_luyen_tap,
    du_lieu_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung
  } = source;
  const type = questionTypes[loai_cau_hoi];
  const bloom_level = bloomLevels[muc_bloom];
  if (!type || !bloom_level) throw new Error('Unknown question type/Bloom level for ' + ma_cau_hoi);

  const id = contentId('questions', ma_cau_hoi);
  let payload = null;
  let options = [];
  if (type === 'MULTIPLE_CHOICE') {
    const texts = [dap_an_a, dap_an_b, dap_an_c, dap_an_d];
    if (!Number.isInteger(vi_tri_dap_an_dung) || !texts[vi_tri_dap_an_dung]
        || texts.some(text => typeof text !== 'string' || !text.trim())) {
      throw new Error('Invalid four-option question ' + ma_cau_hoi);
    }
    options = texts.map((text, position) => ({
      question_id: id, position, text, is_correct: position === vi_tri_dap_an_dung
    }));
  } else {
    const legacy = JSON.parse(du_lieu_cau_hoi);
    if (type === 'MATCHING') {
      const pairs = legacy.pairs ?? legacy.left_items.map(({ id, text }) => ({
        left: text,
        right: legacy.right_items.find(item => item.id === legacy.matches[id])?.text
      }));
      payload = { pairs };
    } else if (type === 'FILL_BLANK') {
      payload = {
        sentence_template: legacy.sentence_template, options: legacy.options, blank_answer: legacy.blank_answer
      };
    } else {
      payload = {
        prompt: legacy.prompt || noi_dung, correct_order: legacy.correct_order, distractors: legacy.distractors ?? []
      };
    }
  }
  return {
    id, milestone_id: contentId('milestones', ma_moc), type, bloom_level,
    // Digital Transformation used a fourth difficulty. APPLY/3 is the highest V1 level.
    stem: noi_dung, explanation: giai_thich ?? null, difficulty: do_kho === 4 ? 3 : do_kho ?? 1,
    step_no: buoc_luyen_tap ?? 1, payload, options
  };
}

function collectContent(subjectIds) {
  const csdl = readLegacySeed('seed_postgres.sql');
  const cds = readLegacySeed('seed_postgres_cds.sql');
  const chapters = [...csdl.chuong_hoc, ...cds.chuong_hoc].map(source => ({
    id: contentId('chapters', source.ma_chuong),
    subject_id: subjectIds.get(subjectSlugs[source.ma_mon]),
    title: source.tieu_de,
    sort_order: source.thu_tu
  }));

  // Old PostgreSQL setup applied the expanded Chapter 1 after the base curriculum.
  const milestoneSources = new Map([...csdl.moc_bai_hoc, ...chapterOneMilestones, ...cds.moc_bai_hoc]
    .map(row => [row.ma_moc, row]));
  const milestones = [...milestoneSources.values()].map(source => {
    const kind = milestoneKinds[source.loai_moc];
    if (!kind) throw new Error('Unknown milestone kind for ' + source.ma_moc);
    return {
      id: contentId('milestones', source.ma_moc), chapter_id: contentId('chapters', source.ma_chuong), kind,
      title: source.tieu_de, theory_markdown: source.noi_dung_ly_thuyet ?? null,
      sort_order: source.thu_tu, reward_xp: source.diem_thuong, reward_coins: source.xu_thuong,
      step_count: kind === 'THEORY' ? 0 : source.tong_so_buoc ?? (kind === 'BOSS' ? 5 : 4),
      questions_per_step: kind === 'THEORY' ? 0 : source.so_cau_moi_buoc ?? 10
    };
  });
  const questionSources = new Map([...csdl.cau_hoi, ...chapterOneQuestions, ...cds.cau_hoi]
    .map(row => [row.ma_cau_hoi, row]));
  const questions = [...questionSources.values()].map(normalizeQuestion);
  return { chapters, milestones, questions };
}

async function seedCourseContent(tx) {
  const slugs = Object.values(subjectSlugs);
  const subjects = await tx.query('SELECT id, slug FROM subjects WHERE slug = ANY($1::text[])', [slugs]);
  const subjectIds = new Map(subjects.map(({ slug, id }) => [slug, id]));
  if (subjectIds.size !== slugs.length) {
    throw new Error('Run database/pg-v1/seed_reference.sql before loading demo course content.');
  }
  const { chapters, milestones, questions } = collectContent(subjectIds);
  const insertedChapters = await tx.execute(
    'INSERT INTO chapters (id, subject_id, title, sort_order)'
      + ' SELECT id, subject_id, title, sort_order FROM jsonb_to_recordset($1::jsonb)'
      + ' AS source(id uuid, subject_id uuid, title text, sort_order integer) ON CONFLICT (id) DO NOTHING',
    [JSON.stringify(chapters)]
  );
  const insertedMilestones = await tx.execute(
    'INSERT INTO milestones (id, chapter_id, title, kind, theory_markdown, sort_order, reward_xp, reward_coins,'
      + ' step_count, questions_per_step)'
      + ' SELECT id, chapter_id, title, kind, theory_markdown, sort_order, reward_xp, reward_coins,'
      + ' step_count, questions_per_step FROM jsonb_to_recordset($1::jsonb)'
      + ' AS source(id uuid, chapter_id uuid, title text, kind text, theory_markdown text, sort_order integer,'
      + ' reward_xp integer, reward_coins integer, step_count smallint, questions_per_step smallint)'
      + ' ON CONFLICT (id) DO NOTHING',
    [JSON.stringify(milestones)]
  );
  const insertedQuestions = await tx.query(
    'INSERT INTO questions (id, milestone_id, type, bloom_level, step_no, difficulty, stem, explanation, payload)'
      + ' SELECT id, milestone_id, type, bloom_level, step_no, difficulty, stem, explanation, payload'
      + ' FROM jsonb_to_recordset($1::jsonb) AS source(id uuid, milestone_id uuid, type text, bloom_level text,'
      + ' step_no smallint, difficulty smallint, stem text, explanation text, payload jsonb)'
      + ' ON CONFLICT (id) DO NOTHING RETURNING id',
    [JSON.stringify(questions)]
  );

  const newQuestionIds = new Set(insertedQuestions.map(row => row.id));
  const options = questions.filter(question => newQuestionIds.has(question.id)).flatMap(question => question.options);
  if (options.length) {
    await tx.execute(
      'INSERT INTO question_options (question_id, position, text, is_correct)'
        + ' SELECT question_id, position, text, is_correct FROM jsonb_to_recordset($1::jsonb)'
        + ' AS source(question_id uuid, position smallint, text text, is_correct boolean)',
      [JSON.stringify(options)]
    );
  }
  return {
    chapters: insertedChapters.rowCount,
    milestones: insertedMilestones.rowCount,
    questions: insertedQuestions.length,
    options: options.length
  };
}

if (require.main === module) {
  const db = require('../database/db');
  db.verifyRuntime()
    .then(() => db.transaction(seedCourseContent))
    .then(counts => console.log('Added demo content:', counts))
    .catch(error => {
      console.error('V1 content seed failed:', error.message);
      process.exitCode = 1;
    })
    .finally(() => db.close());
}

module.exports = { seedCourseContent };

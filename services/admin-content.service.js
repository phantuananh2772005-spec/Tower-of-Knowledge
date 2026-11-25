const { randomUUID } = require('node:crypto');
const { isDeepStrictEqual } = require('node:util');
const db = require('../database/db');

const subjectFields = ['slug', 'name', 'description', 'sort_order', 'status'];
const chapterFields = ['title', 'sort_order', 'status'];
const checkpointFields = [
  'title', 'kind', 'theory_markdown', 'sort_order', 'reward_xp', 'reward_coins',
  'step_count', 'questions_per_step', 'bloom_config', 'status'
];
const questionFields = [
  'milestone_id', 'type', 'bloom_level', 'step_no', 'difficulty', 'stem', 'explanation', 'payload', 'options'
];
const immutableQuestionFields = [
  'milestone_id', 'type', 'bloom_level', 'stem', 'explanation', 'payload', 'options'
];
const petFields = ['name', 'description', 'image_path', 'price_coins', 'minimum_level', 'required_role', 'status'];

function readFields(data, allowed) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Dữ liệu nội dung không hợp lệ.');
  }
  if (Object.keys(data).some(key => !allowed.includes(key))) {
    throw new Error('Dữ liệu nội dung có trường không được hỗ trợ.');
  }
  return Object.fromEntries(allowed.filter(key => Object.hasOwn(data, key)).map(key => [key, data[key]]));
}

async function updateById(connection, table, id, fields) {
  // Table names and editable column names come from the fixed service allowlists.
  const entries = Object.entries(fields);
  const params = [id, ...entries.map(([, value]) => value)];
  const row = entries.length
    ? await connection.queryOne(
      'UPDATE ' + table + ' SET ' + entries.map(([key], index) => key + ' = $' + (index + 2)).join(', ')
        + ' WHERE id = $1 RETURNING *',
      params
    )
    : await connection.queryOne('SELECT * FROM ' + table + ' WHERE id = $1', [id]);
  if (!row) throw new Error('Không tìm thấy nội dung cần cập nhật.');
  return row;
}

function archive(connection, table, id) {
  return updateById(connection, table, id, { status: 'ARCHIVED' });
}

function listCourses() {
  return db.query(`
    WITH question_counts AS (
      SELECT milestone_id, count(*)::int AS question_count
      FROM questions
      WHERE status = 'ACTIVE'
      GROUP BY milestone_id
    ), milestone_lists AS (
      SELECT m.chapter_id, jsonb_agg(
        to_jsonb(m) || jsonb_build_object('question_count', COALESCE(q.question_count, 0))
        ORDER BY m.sort_order, m.id
      ) AS milestones
      FROM milestones AS m
      LEFT JOIN question_counts AS q ON q.milestone_id = m.id
      GROUP BY m.chapter_id
    ), chapter_lists AS (
      SELECT c.subject_id, jsonb_agg(
        to_jsonb(c) || jsonb_build_object('milestones', COALESCE(m.milestones, '[]'::jsonb))
        ORDER BY c.sort_order, c.id
      ) AS chapters
      FROM chapters AS c
      LEFT JOIN milestone_lists AS m ON m.chapter_id = c.id
      GROUP BY c.subject_id
    )
    SELECT s.*, COALESCE(c.chapters, '[]'::jsonb) AS chapters
    FROM subjects AS s LEFT JOIN chapter_lists AS c ON c.subject_id = s.id
    ORDER BY s.sort_order, s.id
  `);
}

function createCourse(data) {
  const { slug, name, description = null, sort_order = 1, status = 'ACTIVE' } = readFields(data, subjectFields);
  return db.queryOne(`
    INSERT INTO subjects (slug, name, description, sort_order, status)
    VALUES ($1, $2, $3, $4, $5) RETURNING *
  `, [slug, name, description, sort_order, status]);
}

function updateCourse(id, data) {
  return updateById(db, 'subjects', id, readFields(data, subjectFields));
}

function deleteCourse(id) {
  return archive(db, 'subjects', id);
}

function createChapter(data) {
  const { subject_id, title, sort_order, status = 'ACTIVE' } = readFields(data, ['subject_id', ...chapterFields]);
  return db.transaction(async tx => {
    const parent = await tx.queryOne(
      "SELECT id FROM subjects WHERE id = $1 AND status = 'ACTIVE' FOR NO KEY UPDATE",
      [subject_id]
    );
    if (!parent) throw new Error('Môn học không tồn tại hoặc đã ngừng sử dụng.');
    const sortOrder = sort_order === undefined
      ? (await tx.queryOne('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM chapters WHERE subject_id = $1',
        [parent.id])).next
      : sort_order;
    return tx.queryOne(`
      INSERT INTO chapters (subject_id, title, sort_order, status) VALUES ($1, $2, $3, $4) RETURNING *
    `, [parent.id, title, sortOrder, status]);
  });
}

function updateChapter(id, data) {
  return updateById(db, 'chapters', id, readFields(data, chapterFields));
}

function deleteChapter(id) {
  return archive(db, 'chapters', id);
}

function createCheckpoint(data) {
  const {
    chapter_id, title, kind = 'QUIZ', theory_markdown = null, sort_order,
    reward_xp = 15, reward_coins = 10, step_count = kind === 'THEORY' ? 0 : 4,
    questions_per_step = kind === 'THEORY' ? 0 : 10, bloom_config = null, status = 'ACTIVE'
  } = readFields(data, ['chapter_id', ...checkpointFields]);
  return db.transaction(async tx => {
    const parent = await tx.queryOne(`
      SELECT c.id FROM subjects AS s
      JOIN chapters AS c ON c.subject_id = s.id
      WHERE c.id = $1 AND s.status = 'ACTIVE' AND c.status = 'ACTIVE'
      FOR SHARE OF s FOR NO KEY UPDATE OF c
    `, [chapter_id]);
    if (!parent) throw new Error('Chương hoặc môn học không tồn tại hoặc đã ngừng sử dụng.');
    const sortOrder = sort_order === undefined
      ? (await tx.queryOne('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM milestones WHERE chapter_id = $1',
        [parent.id])).next
      : sort_order;
    return tx.queryOne(`
      INSERT INTO milestones (chapter_id, title, kind, theory_markdown, sort_order, reward_xp,
        reward_coins, step_count, questions_per_step, bloom_config, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
    `, [parent.id, title, kind, theory_markdown, sortOrder, reward_xp, reward_coins,
      step_count, questions_per_step, bloom_config, status]);
  });
}

async function updateCheckpoint(id, data) {
  const updates = readFields(data, checkpointFields);
  if (!Object.hasOwn(updates, 'kind') && !Object.hasOwn(updates, 'step_count')) {
    return updateById(db, 'milestones', id, updates);
  }

  return db.transaction(async tx => {
    const current = await tx.queryOne('SELECT kind, step_count FROM milestones WHERE id = $1 FOR UPDATE', [id]);
    if (!current) throw new Error('Không tìm thấy mốc bài học.');
    const kind = Object.hasOwn(updates, 'kind') ? updates.kind : current.kind;
    if (kind !== current.kind && (kind === 'THEORY' || current.kind === 'THEORY')) {
      const theory = kind === 'THEORY';
      if (!Object.hasOwn(updates, 'step_count')) updates.step_count = theory ? 0 : 4;
      if (!Object.hasOwn(updates, 'questions_per_step')) updates.questions_per_step = theory ? 0 : 10;
      if (theory && !Object.hasOwn(updates, 'bloom_config')) updates.bloom_config = null;
    }

    const stepChanged = Object.hasOwn(updates, 'step_count') && updates.step_count !== current.step_count;
    if (kind !== current.kind || stepChanged) {
      const { has_history } = await tx.queryOne(`
        SELECT EXISTS (SELECT 1 FROM milestone_progress WHERE milestone_id = $1)
          OR EXISTS (SELECT 1 FROM study_sessions WHERE milestone_id = $1)
          OR EXISTS (
            SELECT 1 FROM questions AS q
            WHERE q.milestone_id = $1
              AND (EXISTS (SELECT 1 FROM study_session_questions WHERE question_id = q.id)
                OR EXISTS (SELECT 1 FROM match_rounds WHERE question_id = q.id))
          ) AS has_history
      `, [id]);
      if (has_history) throw new Error('Không thể đổi loại hoặc số chặng của mốc đã có lịch sử.');
    }
    return updateById(tx, 'milestones', id, updates);
  });
}

function deleteCheckpoint(id) {
  return archive(db, 'milestones', id);
}

const optionsProjection = `
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object('position', o.position, 'text', o.text, 'is_correct', o.is_correct)
      ORDER BY o.position)
    FROM question_options AS o WHERE o.question_id = q.id
  ), '[]'::jsonb) AS options
`;

function listQuestions({
  milestone_id = null, chapter_id = null, subject_id = null, status = 'ACTIVE', limit = 500, offset = 0
} = {}) {
  if (!['ACTIVE', 'ARCHIVED', 'ALL'].includes(status)) throw new Error('Trạng thái câu hỏi không hợp lệ.');
  const pageSize = Math.min(1000, Math.max(1, Number.parseInt(limit, 10) || 500));
  const start = Math.max(0, Number.parseInt(offset, 10) || 0);
  return db.query(`
    SELECT q.*, ${optionsProjection}, m.title AS milestone_title, c.id AS chapter_id,
      c.title AS chapter_title, s.id AS subject_id, s.name AS subject_name
    FROM questions AS q
    JOIN milestones AS m ON m.id = q.milestone_id
    JOIN chapters AS c ON c.id = m.chapter_id
    JOIN subjects AS s ON s.id = c.subject_id
    WHERE ($1::uuid IS NULL OR q.milestone_id = $1)
      AND ($2::uuid IS NULL OR c.id = $2)
      AND ($3::uuid IS NULL OR s.id = $3)
      AND ($4 = 'ALL' OR q.status = $4)
    ORDER BY q.id
    LIMIT $5 OFFSET $6
  `, [milestone_id, chapter_id, subject_id, status, pageSize, start]);
}

function validateOptions(type, options) {
  if (!Array.isArray(options)) throw new Error('Danh sách phương án không hợp lệ.');
  if (type !== 'MULTIPLE_CHOICE') {
    if (options.length > 0) throw new Error('Chỉ câu trắc nghiệm có danh sách phương án riêng.');
    return [];
  }

  const normalized = options.map(option => readFields(option, ['position', 'text', 'is_correct']));
  normalized.sort((left, right) => left.position - right.position);
  if (normalized.length !== 4
      || normalized.some((option, index) => option.position !== index
        || typeof option.text !== 'string' || !option.text.trim() || typeof option.is_correct !== 'boolean')
      || normalized.filter(option => option.is_correct).length !== 1) {
    throw new Error('Câu trắc nghiệm cần bốn phương án vị trí 0–3 và đúng một đáp án đúng.');
  }
  return normalized;
}

async function insertQuestion(tx, {
  milestone_id, type = 'MULTIPLE_CHOICE', bloom_level = 'REMEMBER', step_no = 1,
  difficulty = 1, stem, explanation = null, payload = null, options = []
}) {
  const normalized = validateOptions(type, options);
  const row = await tx.queryOne(`
    INSERT INTO questions (milestone_id, type, bloom_level, step_no, difficulty, stem, explanation, payload)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
  `, [milestone_id, type, bloom_level, step_no, difficulty, stem, explanation, payload]);
  if (normalized.length > 0) {
    await tx.execute(`
      INSERT INTO question_options (question_id, position, text, is_correct)
      SELECT $1, option.position, option.text, option.is_correct
      FROM jsonb_to_recordset($2::jsonb) AS option(position smallint, text text, is_correct boolean)
    `, [row.id, JSON.stringify(normalized)]);
  }
  return { ...row, options: normalized };
}

function createQuestion(data) {
  const values = readFields(data, questionFields);
  return db.transaction(tx => insertQuestion(tx, values));
}

function updateQuestion(id, data) {
  const updates = readFields(data, questionFields);
  return db.transaction(async tx => {
    const reference = await tx.queryOne('SELECT milestone_id FROM questions WHERE id = $1', [id]);
    if (!reference) throw new Error('Không tìm thấy câu hỏi.');

    // Match the curriculum-to-question lock order used to issue learner and arena questions.
    const relatedMilestones = [reference.milestone_id];
    if (updates.milestone_id && updates.milestone_id !== reference.milestone_id) relatedMilestones.push(updates.milestone_id);
    await tx.query(`
      SELECT m.id FROM subjects AS s
      JOIN chapters AS c ON c.subject_id = s.id
      JOIN milestones AS m ON m.chapter_id = c.id
      WHERE m.id = ANY($1::uuid[])
      ORDER BY s.id, c.id, m.id
      FOR SHARE OF s, c, m
    `, [relatedMilestones]);

    const current = await tx.queryOne(
      'SELECT q.*, ' + optionsProjection + ' FROM questions AS q WHERE q.id = $1 FOR UPDATE OF q',
      [id]
    );
    if (!current) throw new Error('Không tìm thấy câu hỏi.');
    if (current.status === 'ARCHIVED') throw new Error('Phiên bản câu hỏi này đã ngừng sử dụng.');

    const next = { ...current, ...updates };
    const selectedOptions = Object.hasOwn(updates, 'options') ? updates.options
      : next.type === current.type ? current.options : [];
    next.options = validateOptions(next.type, selectedOptions);
    if (next.type !== current.type && !Object.hasOwn(updates, 'payload')) next.payload = null;
    const contentChanged = immutableQuestionFields.some(field => !isDeepStrictEqual(current[field], next[field]));
    if (contentChanged) {
      const replacement = await insertQuestion(tx, next);
      await archive(tx, 'questions', id);
      return replacement;
    }

    const metadata = {};
    if (next.step_no !== current.step_no) metadata.step_no = next.step_no;
    if (next.difficulty !== current.difficulty) metadata.difficulty = next.difficulty;
    return { ...await updateById(tx, 'questions', id, metadata), options: current.options };
  });
}

function deleteQuestion(id) {
  return archive(db, 'questions', id);
}

function bulkImportQuestions(items, defaultMilestoneId = null) {
  if (!Array.isArray(items) || !items.length) {
    throw new Error('Dữ liệu nhập phải là một mảng câu hỏi không rỗng.');
  }
  const values = items.map(item => {
    const question = readFields(item, questionFields);
    return { ...question, milestone_id: question.milestone_id ?? defaultMilestoneId };
  });
  return db.transaction(async tx => {
    const question_ids = [];
    for (const question of values) {
      const created = await insertQuestion(tx, question);
      question_ids.push(created.id);
    }
    return { imported_count: question_ids.length, question_ids };
  });
}

function listPets() {
  return db.query('SELECT * FROM pets ORDER BY price_coins, id');
}

function createPet(data) {
  const {
    id = 'pet_' + randomUUID(), name, description = '', image_path, price_coins = 0,
    minimum_level = 1, required_role = null, status = 'ACTIVE'
  } = readFields(data, ['id', ...petFields]);
  return db.queryOne(`
    INSERT INTO pets (id, name, description, image_path, price_coins, minimum_level, required_role, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
  `, [id, name, description, image_path, price_coins, minimum_level, required_role, status]);
}

function updatePet(id, data) {
  return updateById(db, 'pets', id, readFields(data, petFields));
}

function deletePet(id) {
  return archive(db, 'pets', id);
}

module.exports = {
  listCourses, createCourse, updateCourse, deleteCourse,
  createChapter, updateChapter, deleteChapter,
  createCheckpoint, updateCheckpoint, deleteCheckpoint,
  listQuestions, createQuestion, updateQuestion, deleteQuestion, bulkImportQuestions,
  listPets, createPet, updatePet, deletePet
};

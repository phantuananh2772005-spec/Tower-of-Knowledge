const db = require('../database/db');
const arenaRules = require('../public/js/arena-rules');
const { acquireArenaSeasonLock, syncArenaSeason } = require('./arena-season.service');
const { awardRepeatXpInTransaction } = require('./economy.service');
const { formatPet } = require('./pet.service');
const { correctAnswer, gradeQuestion, pairMatches, presentQuestion } = require('./study-questions');
const { mutateCoinsInTransaction } = require('./wallet.service');

const MAX_ROUNDS = 10;
const MODES = ['RANKED', 'CASUAL', 'PRACTICE'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const answerFields = new Set([
  'match_id', 'user_id', 'round_no', 'selected_option_position', 'submitted_text', 'response'
]);
const matchColumns = 'id, subject_id, mode, status, started_at, finished_at, finish_reason, season_no';

function requireUuid(value, message) {
  if (typeof value !== 'string' || !UUID.test(value)) throw new Error(message);
}

function requireRound(roundNo) {
  if (!Number.isInteger(roundNo) || roundNo < 1 || roundNo > MAX_ROUNDS) {
    throw new Error('Thứ tự câu hỏi không hợp lệ.');
  }
}

async function selectActiveQuestions(tx, subjectId) {
  const questions = await tx.query(
    "SELECT q.id FROM questions q JOIN milestones m ON m.id = q.milestone_id"
      + " JOIN chapters c ON c.id = m.chapter_id JOIN subjects s ON s.id = c.subject_id"
      + " WHERE s.id = $1 AND s.status = 'ACTIVE' AND c.status = 'ACTIVE' AND m.status = 'ACTIVE'"
      + " AND q.status = 'ACTIVE' ORDER BY random() LIMIT $2",
    [subjectId, MAX_ROUNDS]
  );
  return questions.map(question => question.id);
}

async function openRound(tx, match, questionId, roundNo) {
  requireUuid(questionId, 'Câu hỏi không thuộc môn của trận hoặc đã ngừng sử dụng.');
  const selectedQuestion = await tx.queryOne(
    "SELECT q.id FROM subjects s JOIN chapters c ON c.subject_id = s.id"
      + " JOIN milestones m ON m.chapter_id = c.id JOIN questions q ON q.milestone_id = m.id"
      + " WHERE s.id = $1 AND q.id = $2 AND s.status = 'ACTIVE' AND c.status = 'ACTIVE'"
      + " AND m.status = 'ACTIVE' AND q.status = 'ACTIVE' FOR SHARE OF s, c, m, q",
    [match.subject_id, questionId]
  );
  if (!selectedQuestion) throw new Error('Câu hỏi không thuộc môn của trận hoặc đã ngừng sử dụng.');

  await tx.execute(
    'INSERT INTO match_rounds (match_id, round_no, question_id) VALUES ($1, $2, $3)',
    [match.id, roundNo, questionId]
  );
}

async function lockedUsers(tx, ids) {
  return tx.query(
    'SELECT id, role, disabled_at FROM users WHERE id = ANY($1::uuid[]) ORDER BY id FOR UPDATE',
    [ids]
  );
}

async function playerStats(connection, matchId) {
  const rows = await connection.query(
    'SELECT p.slot, p.user_id, p.result, p.coins_awarded, p.xp_awarded, p.rating_delta, p.hp, p.max_hp,'
      + ' p.correct_count, p.answer_count, p.total_damage, u.username, u.display_name, u.role,'
      + ' to_jsonb(pet) AS pet FROM v_match_player_stats p JOIN users u ON u.id = p.user_id'
      + ' LEFT JOIN pets pet ON pet.id = u.equipped_pet_id WHERE p.match_id = $1 ORDER BY p.slot',
    [matchId]
  );
  return rows.map(player => ({
    ...player,
    pet: formatPet(player.pet),
    correct_count: Number(player.correct_count),
    answer_count: Number(player.answer_count),
    total_damage: Number(player.total_damage)
  }));
}

async function issuedRounds(connection, matchId, roundNo = null) {
  return connection.query(
    "SELECT r.round_no, q.id, q.type, q.stem, q.bloom_level, q.difficulty, q.payload,"
      + " COALESCE((SELECT jsonb_agg(jsonb_build_object('position', o.position, 'text', o.text,"
      + " 'is_correct', o.is_correct) ORDER BY o.position) FROM question_options o WHERE o.question_id = q.id),"
      + " '[]'::jsonb) AS options FROM match_rounds r JOIN questions q ON q.id = r.question_id"
      + " WHERE r.match_id = $1 AND ($2::smallint IS NULL OR r.round_no = $2) ORDER BY r.round_no",
    [matchId, roundNo]
  );
}

async function requireRoundQuestion(tx, matchId, roundNo) {
  const [question] = await issuedRounds(tx, matchId, roundNo);
  if (!question) throw new Error('Không tìm thấy câu hỏi này trong trận.');
  return question;
}

function publicRound(question, matchId) {
  const { position, ...dto } = presentQuestion({ ...question, position: question.round_no }, matchId);
  return { round_no: position, ...dto };
}

async function matchState(connection, match, participantId) {
  const players = await playerStats(connection, match.id);
  if (participantId && !players.some(player => player.user_id === participantId)) {
    throw new Error('Bạn không thuộc trận đấu này.');
  }
  const rounds = (await issuedRounds(connection, match.id)).map(question => publicRound(question, match.id));
  const turns = (await connection.query(
    'SELECT a.round_no, p.user_id, a.is_correct, a.damage, a.response_seconds, a.answered_at'
      + ' FROM match_answers a JOIN match_players p ON p.match_id = a.match_id AND p.slot = a.slot'
      + ' WHERE a.match_id = $1 ORDER BY a.round_no, a.answered_at, a.slot',
    [match.id]
  )).map(turn => ({ ...turn, response_seconds: Number(turn.response_seconds) }));

  const countByRound = new Map();
  for (const turn of turns) countByRound.set(turn.round_no, (countByRound.get(turn.round_no) || 0) + 1);
  const pending = rounds.find(round => (countByRound.get(round.round_no) || 0) < 2);
  return {
    ...match,
    players,
    rounds,
    turns,
    winner_id: players.find(player => player.result === 'WIN')?.user_id ?? null,
    current_round_no: match.status === 'ACTIVE' ? pending?.round_no ?? null : null
  };
}

async function loadMatch(connection, matchId, lock = '') {
  requireUuid(matchId, 'Không tìm thấy trận đấu.');
  const match = await connection.queryOne(
    'SELECT ' + matchColumns + ' FROM matches WHERE id = $1' + lock,
    [matchId]
  );
  if (!match) throw new Error('Không tìm thấy trận đấu.');
  return match;
}

function getMatchState(matchId, participantId) {
  return db.transaction(async tx => {
    const match = await loadMatch(tx, matchId, ' FOR SHARE');
    return matchState(tx, match, participantId);
  });
}

function createArenaService({ selectRoundQuestions = selectActiveQuestions } = {}) {
  async function createMatch(player1Id, player2Id, subjectId, mode = 'PRACTICE') {
    requireUuid(player1Id, 'Không tìm thấy người chơi thứ nhất.');
    requireUuid(player2Id, 'Không tìm thấy người chơi thứ hai.');
    requireUuid(subjectId, 'Môn thi đấu không hợp lệ.');
    if (player1Id.toLowerCase() === player2Id.toLowerCase()) throw new Error('Trận đấu cần hai người chơi khác nhau.');
    if (!MODES.includes(mode)) throw new Error('Chế độ đấu không hợp lệ.');

    return db.transaction(async tx => {
      const subject = await tx.queryOne("SELECT id FROM subjects WHERE id = $1 AND status = 'ACTIVE' FOR SHARE", [subjectId]);
      if (!subject) throw new Error('Không tìm thấy môn thi đấu đang mở.');
      const match = await tx.queryOne(
        "INSERT INTO matches (subject_id, mode, status, started_at) VALUES ($1, $2, 'ACTIVE', clock_timestamp())"
          + ' RETURNING ' + matchColumns,
        [subject.id, mode]
      );
      const participants = await lockedUsers(tx, [player1Id, player2Id]);
      if (participants.length !== 2 || participants.some(player => player.disabled_at)) {
        throw new Error('Người chơi không tồn tại hoặc không còn hoạt động.');
      }
      if (mode !== 'PRACTICE' && participants.some(player => player.role === 'SYSTEM')) {
        throw new Error('Chế độ này chỉ dành cho hai người chơi thật.');
      }
      await tx.execute(
        'INSERT INTO match_players (match_id, slot, user_id) VALUES ($1, 1, $2), ($1, 2, $3)',
        [match.id, player1Id, player2Id]
      );

      // The selector supplies candidates only. Every issued question must clear the same scope check.
      const selected = await selectRoundQuestions(tx, subject.id);
      if (!Array.isArray(selected) || !selected.length) throw new Error('Môn học chưa có câu hỏi để thi đấu.');
      if (selected.length > MAX_ROUNDS || new Set(selected).size !== selected.length) {
        throw new Error('Danh sách câu hỏi của trận không hợp lệ.');
      }
      for (const [index, questionId] of selected.entries()) await openRound(tx, match, questionId, index + 1);
      return matchState(tx, match);
    });
  }
  return { createMatch };
}

async function withMatchLock(matchId, work) {
  requireUuid(matchId, 'Không tìm thấy trận đấu.');
  return db.transaction(async tx => {
    // Mode is fixed after match creation, so the unlocked read is safe before acquiring the season lock.
    const existing = await tx.queryOne('SELECT mode FROM matches WHERE id = $1', [matchId]);
    if (!existing) throw new Error('Không tìm thấy trận đấu.');
    if (existing.mode === 'RANKED') await acquireArenaSeasonLock(tx);
    const match = await loadMatch(tx, matchId, ' FOR UPDATE');
    return work(tx, match);
  });
}

async function requirePlayer(tx, matchId, userId) {
  requireUuid(userId, 'Bạn không thuộc trận đấu này.');
  const player = await tx.queryOne(
    'SELECT p.slot, p.user_id, u.role FROM match_players p JOIN users u ON u.id = p.user_id'
      + ' WHERE p.match_id = $1 AND p.user_id = $2',
    [matchId, userId]
  );
  if (!player) throw new Error('Bạn không thuộc trận đấu này.');
  return player;
}

async function precedingTurns(tx, matchId, roundNo) {
  const previous = await tx.queryOne(
    'SELECT count(*)::int AS attempts, max(answered_at) AS last_at'
      + ' FROM match_answers WHERE match_id = $1 AND round_no < $2',
    [matchId, roundNo]
  );
  if (previous.attempts !== (roundNo - 1) * 2) throw new Error('Câu hỏi này chưa tới lượt.');
  return previous.last_at;
}

async function existingTurn(tx, matchId, roundNo, slot) {
  return tx.queryOne(
    'SELECT is_correct, damage, response_seconds, answered_at FROM match_answers'
      + ' WHERE match_id = $1 AND round_no = $2 AND slot = $3',
    [matchId, roundNo, slot]
  );
}

function checkArenaPair(matchId, userId, roundNo, pair) {
  requireRound(roundNo);
  if (!pair || Object.keys(pair).some(name => name !== 'left' && name !== 'right')) {
    throw new Error('Cặp trả lời không hợp lệ.');
  }
  return db.transaction(async tx => {
    const match = await loadMatch(tx, matchId, ' FOR SHARE');
    if (match.status !== 'ACTIVE') throw new Error('Trận đấu đã kết thúc.');
    const player = await requirePlayer(tx, match.id, userId);
    await precedingTurns(tx, match.id, roundNo);
    if (await existingTurn(tx, match.id, roundNo, player.slot)) throw new Error('Lượt trả lời đã hoàn thành.');
    const question = await requireRoundQuestion(tx, match.id, roundNo);
    return { matches: pairMatches(question, pair.left, pair.right) };
  });
}

function concludedOutcome(players, roundCount) {
  const [first, second] = players;
  if (first.hp <= 0 && second.hp > 0) return { winnerId: second.user_id, reason: 'KNOCKOUT' };
  if (second.hp <= 0 && first.hp > 0) return { winnerId: first.user_id, reason: 'KNOCKOUT' };
  if (first.hp <= 0 && second.hp <= 0) return { winnerId: null, reason: 'DRAW' };
  if (!roundCount || players.some(player => player.answer_count < roundCount)) return null;

  const advantage = first.hp - second.hp || first.correct_count - second.correct_count
    || first.total_damage - second.total_damage;
  if (!advantage) return { winnerId: null, reason: 'DRAW' };
  return { winnerId: advantage > 0 ? first.user_id : second.user_id, reason: 'TIMEOUT' };
}

async function assignRating(tx, match, userId, seasonNo, result, hp) {
  const previous = await tx.queryOne(
    'SELECT points FROM rank_scores WHERE user_id = $1 AND subject_id = $2 AND season_no = $3',
    [userId, match.subject_id, seasonNo]
  );
  const before = previous?.points ?? 0;
  const after = Math.max(0, before + arenaRules.delta(result, hp));
  await tx.execute(
    'INSERT INTO rank_scores (user_id, subject_id, season_no, points) VALUES ($1, $2, $3, $4)'
      + ' ON CONFLICT (user_id, subject_id, season_no) DO UPDATE SET points = EXCLUDED.points',
    [userId, match.subject_id, seasonNo, after]
  );
  return after - before;
}

async function finishMatch(tx, match, players, outcome) {
  const { at } = await tx.queryOne('SELECT clock_timestamp() AS at');
  const ranked = match.mode === 'RANKED';
  const season = ranked ? await syncArenaSeason(tx, at) : null;
  const participants = await lockedUsers(tx, players.map(player => player.user_id));
  const provedParticipation = players.every(player => player.answer_count > 0);
  for (const participant of participants) {
    const player = players.find(entry => entry.user_id === participant.id);
    const result = !outcome.winnerId ? 'DRAW' : outcome.winnerId === player.user_id ? 'WIN' : 'LOSE';
    const earns = provedParticipation && participant.role !== 'SYSTEM';
    let rating = 0;
    let xpAwarded = 0;
    if (earns) {
      const reward = arenaRules.rewards(match.mode, result);
      if (ranked && participants.every(entry => entry.role !== 'SYSTEM')) {
        rating = await assignRating(tx, match, player.user_id, season.season_no, result, player.hp);
      }
      if (reward.exp > 0) {
        xpAwarded = (await awardRepeatXpInTransaction(tx, player.user_id, reward.exp, { occurred_at: at })).xp_awarded;
      }
      if (reward.coins > 0) {
        await mutateCoinsInTransaction(tx, player.user_id, reward.coins, 'MATCH_REWARD', {
          match_id: match.id, note: match.mode + ' · ' + result, occurred_at: at
        });
      }
    }
    await tx.execute(
      'UPDATE match_players SET result = $1, xp_awarded = $2, rating_delta = $3 WHERE match_id = $4 AND slot = $5',
      [result, xpAwarded, rating, match.id, player.slot]
    );
  }
  return tx.queryOne(
    "UPDATE matches SET status = 'FINISHED', finished_at = $1, finish_reason = $2, season_no = $3"
      + ' WHERE id = $4 RETURNING ' + matchColumns,
    [at, outcome.reason, season?.season_no ?? null, match.id]
  );
}

async function settleIfResolved(tx, match) {
  if (match.status !== 'ACTIVE') return match;
  const players = await playerStats(tx, match.id);
  const rounds = await tx.queryOne('SELECT count(*)::int AS total FROM match_rounds WHERE match_id = $1', [match.id]);
  const outcome = concludedOutcome(players, rounds.total);
  return outcome ? finishMatch(tx, match, players, outcome) : match;
}

function botSubmission(question, willAnswerCorrectly) {
  if (!willAnswerCorrectly) return { response: { kind: 'TIMEOUT' } };
  const expected = correctAnswer(question);
  switch (question.type) {
    case 'MULTIPLE_CHOICE': return { selected_option_position: expected };
    case 'FILL_BLANK': return { submitted_text: expected };
    case 'MATCHING': return { response: { kind: 'MATCHING', pairs: expected } };
    case 'ORDERING': return { response: { kind: 'ORDERING', tokens: expected } };
    default: throw new Error('Dạng câu hỏi không hợp lệ.');
  }
}

function turnResult(player, roundNo, saved, state, timing, replayed) {
  return {
    match_id: state.id,
    user_id: player.user_id,
    round_no: roundNo,
    is_correct: saved.is_correct,
    damage: saved.damage,
    is_critical: saved.is_correct && Number(saved.response_seconds) <= timing.fast_seconds,
    replayed,
    match_ended: state.status !== 'ACTIVE',
    match_state: state
  };
}

function submitTurn(input, botAccuracy) {
  if (!input || Object.keys(input).some(name => !answerFields.has(name))) {
    throw new Error('Yêu cầu trả lời có trường không hỗ trợ.');
  }
  const { match_id, user_id, round_no } = input;
  requireRound(round_no);
  return withMatchLock(match_id, async (tx, match) => {
    const player = await requirePlayer(tx, match.id, user_id);
    if ((botAccuracy === undefined) === (player.role === 'SYSTEM')) {
      throw new Error('Người chơi không được gửi lượt qua luồng này.');
    }
    const timing = await tx.queryOne(
      'SELECT v1_arena_base_damage() AS damage, v1_arena_fast_bonus() AS bonus, v1_arena_fast_answer_seconds() AS fast_seconds'
    );
    const prior = await existingTurn(tx, match.id, round_no, player.slot);
    if (prior) return turnResult(player, round_no, prior, await matchState(tx, match), timing, true);
    if (match.status !== 'ACTIVE') throw new Error('Trận đấu đã kết thúc.');

    const previousAt = await precedingTurns(tx, match.id, round_no);
    const question = await requireRoundQuestion(tx, match.id, round_no);
    const submission = botAccuracy === undefined ? input : botSubmission(question, botAccuracy);
    const graded = gradeQuestion(question, submission);
    const { at } = await tx.queryOne('SELECT clock_timestamp() AS at');
    const introSeconds = round_no === 1 ? 2.2 : 0.6;
    const reference = previousAt ?? match.started_at;
    const elapsed = Math.max(0, (new Date(at).getTime() - new Date(reference).getTime()) / 1000 - introSeconds);
    const responseSeconds = Math.round(elapsed * 1000) / 1000;
    const damage = graded.is_correct ? timing.damage + (responseSeconds <= timing.fast_seconds ? timing.bonus : 0) : 0;
    const saved = await tx.queryOne(
      'INSERT INTO match_answers (match_id, round_no, slot, is_correct, response_seconds, damage, answered_at)'
        + ' VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING is_correct, damage, response_seconds',
      [match.id, round_no, player.slot, graded.is_correct, responseSeconds, damage, at]
    );

    const updatedMatch = await settleIfResolved(tx, match);
    return turnResult(player, round_no, saved, await matchState(tx, updatedMatch), timing, false);
  });
}

function submitTurnAnswer(input) {
  return submitTurn(input);
}

function submitBotTurn(matchId, botId, roundNo, willAnswerCorrectly) {
  if (typeof willAnswerCorrectly !== 'boolean') throw new Error('Mô phỏng lượt của bot không hợp lệ.');
  return submitTurn({ match_id: matchId, user_id: botId, round_no: roundNo }, willAnswerCorrectly);
}

function surrenderMatch(matchId, userId) {
  return withMatchLock(matchId, async (tx, match) => {
    const loser = await requirePlayer(tx, match.id, userId);
    if (match.status !== 'ACTIVE') return matchState(tx, match);
    const players = await playerStats(tx, match.id);
    const other = players.find(player => player.slot !== loser.slot);
    const finished = await finishMatch(tx, match, players, { winnerId: other.user_id, reason: 'FORFEIT' });
    return matchState(tx, finished);
  });
}

function concludeIfResolved(matchId, userId) {
  return withMatchLock(matchId, async (tx, match) => {
    await requirePlayer(tx, match.id, userId);
    return matchState(tx, await settleIfResolved(tx, match));
  });
}

module.exports = {
  ...createArenaService(),
  createArenaService,
  getMatchState,
  checkArenaPair,
  submitTurnAnswer,
  submitBotTurn,
  surrenderMatch,
  concludeIfResolved
};

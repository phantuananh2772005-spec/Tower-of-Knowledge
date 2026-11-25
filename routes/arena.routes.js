const router = require('express').Router();
const qrCode = require('qrcode');
const db = require('../database/db');
const arena = require('../services/arena.service');
const { getArenaSeason } = require('../services/arena-season.service');
const { formatPet } = require('../services/pet.service');
const { deriveRankTitle } = require('../core/rules/economy.rules');
const { authenticate } = require('../middlewares/auth.middleware');
const { broadcastMatchEnded, broadcastTurn } = require('../sockets/arena.socket');

const uuidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const isUuid = value => typeof value === 'string' && uuidPattern.test(value);
const isText = value => typeof value === 'string' && value.trim().length > 0;
const isRoundNumber = value => Number.isInteger(value) && value >= 1 && value <= 10;

function expectKeys(body, required, optional = []) {
  if (!body || typeof body !== 'object' || Array.isArray(body)
      || required.some(key => !Object.hasOwn(body, key))
      || Object.keys(body).some(key => !required.includes(key) && !optional.includes(key))) {
    throw new Error('Dữ liệu đấu trường không hợp lệ hoặc có trường không được hỗ trợ.');
  }
}

function expectRound(roundNo) {
  if (!isRoundNumber(roundNo)) throw new Error('Số hiệp không hợp lệ.');
}

function validateTurnResponse(response) {
  switch (response?.kind) {
    case 'TIMEOUT':
      expectKeys(response, ['kind']);
      break;
    case 'MATCHING':
      expectKeys(response, ['kind', 'pairs']);
      if (!Array.isArray(response.pairs) || !response.pairs.length) throw new Error('Danh sách ghép cặp không hợp lệ.');
      for (const pair of response.pairs) {
        expectKeys(pair, ['left', 'right']);
        if (!isText(pair.left) || !isText(pair.right)) throw new Error('Nội dung ghép cặp không hợp lệ.');
      }
      break;
    case 'ORDERING':
      expectKeys(response, ['kind', 'tokens']);
      if (!Array.isArray(response.tokens) || !response.tokens.length || !response.tokens.every(isText)) {
        throw new Error('Danh sách thẻ không hợp lệ.');
      }
      break;
    default:
      throw new Error('Kiểu câu trả lời không hợp lệ.');
  }
}

function validateTurn(body) {
  const answerFields = ['selected_option_position', 'submitted_text', 'response'];
  expectKeys(body, ['round_no'], answerFields);
  expectRound(body.round_no);
  const provided = answerFields.filter(field => Object.hasOwn(body, field));
  if (provided.length !== 1) throw new Error('Mỗi lượt chỉ được gửi một dạng câu trả lời.');

  if (provided[0] === 'response') {
    validateTurnResponse(body.response);
  } else if (provided[0] === 'selected_option_position') {
    if (!Number.isInteger(body.selected_option_position) || body.selected_option_position < 0 || body.selected_option_position > 3) {
      throw new Error('Vị trí phương án không hợp lệ.');
    }
  } else if (!isText(body.submitted_text)) {
    throw new Error('Nội dung câu trả lời không hợp lệ.');
  }
}

async function listPracticeBots() {
  const rows = await db.query(`
    SELECT u.id, u.username, u.display_name,
      jsonb_build_object('id', p.id, 'name', p.name, 'image_path', p.image_path) AS pet
    FROM users AS u
    JOIN pets AS p ON p.id = u.equipped_pet_id
    WHERE u.role = 'SYSTEM' AND u.disabled_at IS NULL
    ORDER BY u.username, u.id
  `);
  return rows.map(bot => {
    const { id, name, image_path, icon } = formatPet(bot.pet);
    return { ...bot, pet: { id, name, image_path, icon } };
  });
}

router.get('/room-qr.png', async (req, res) => {
  const code = String(req.query.code || '').toUpperCase();
  if (!/^TOK-[A-Z0-9]{4,12}$/.test(code)) {
    return res.apiError('Mã phòng không hợp lệ.', 'INVALID_ROOM_CODE', 400);
  }
  try {
    const protocol = (req.get('x-forwarded-proto') || req.protocol).split(',')[0].trim();
    const origin = process.env.PUBLIC_APP_URL || protocol + '://' + req.get('host');
    const invitation = new URL('/', origin);
    invitation.searchParams.set('room', code);
    const png = await qrCode.toBuffer(invitation.toString(), {
      type: 'png', width: 384, margin: 2, errorCorrectionLevel: 'M'
    });
    res.setHeader('Cache-Control', 'private, max-age=60');
    return res.type('png').send(png);
  } catch {
    return res.apiError('Không tạo được mã QR phòng.', 'ROOM_QR_FAILED', 500);
  }
});

router.get('/bots', async (req, res) => {
  try {
    return res.apiSuccess(await listPracticeBots());
  } catch (error) {
    return res.apiError(error.message, 'FETCH_BOTS_FAILED', 500);
  }
});

router.post('/create-match', authenticate, async (req, res) => {
  try {
    const body = req.body;
    expectKeys(body, ['subject_id'], ['opponent_id']);
    if (!isUuid(body.subject_id) || (Object.hasOwn(body, 'opponent_id') && !isUuid(body.opponent_id))) {
      throw new Error('Mã môn học hoặc đối thủ không hợp lệ.');
    }
    const opponentId = body.opponent_id ?? (await listPracticeBots())[0]?.id;
    if (!opponentId) throw new Error('Chưa có đối thủ luyện tập.');
    const match = await arena.createMatch(req.user.id, opponentId, body.subject_id, 'PRACTICE');
    return res.apiSuccess(match, 201);
  } catch (error) {
    return res.apiError(error.message, 'CREATE_MATCH_FAILED', 400);
  }
});

router.get('/season', async (req, res) => {
  try {
    return res.apiSuccess(await getArenaSeason());
  } catch (error) {
    return res.apiError(error.message, 'FETCH_SEASON_FAILED', 500);
  }
});

async function readLeaderboard(season) {
  const rows = await db.query(`
    WITH ratings AS (
      SELECT r.user_id, jsonb_object_agg(r.subject_id, r.points) AS rank_scores
      FROM rank_scores AS r
      JOIN users AS u ON u.id = r.user_id AND u.role = 'LEARNER'
      WHERE r.season_no = $1
      GROUP BY r.user_id
    ), eligible_matches AS (
      SELECT s.user_id, s.subject_id, s.match_id, s.result, m.finished_at,
        s.answer_count, s.correct_count, s.total_response_seconds
      FROM v_match_player_stats AS s
      JOIN matches AS m ON m.id = s.match_id
      JOIN ratings AS r ON r.user_id = s.user_id
      WHERE s.season_no = $1 AND m.mode = 'RANKED' AND m.status = 'FINISHED'
        AND m.finished_at >= $2 AND m.finished_at < $3 AND s.coins_awarded > 0
    ), stats_by_subject AS (
      SELECT user_id, subject_id, sum(answer_count) AS answer_count,
        sum(correct_count) AS correct_count, sum(total_response_seconds) AS total_response_seconds
      FROM eligible_matches
      GROUP BY user_id, subject_id
    ), answer_stats AS (
      SELECT user_id, jsonb_agg(to_jsonb(s) - 'user_id' ORDER BY subject_id) AS answer_stats
      FROM stats_by_subject AS s
      GROUP BY user_id
    ), ordered_results AS (
      SELECT e.user_id, scope.key, e.result, count(*) FILTER (WHERE e.result IS DISTINCT FROM 'WIN') OVER (
        PARTITION BY e.user_id, scope.key
        ORDER BY e.finished_at DESC, e.match_id DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ) AS preceding_nonwins
      FROM eligible_matches AS e
      CROSS JOIN LATERAL (VALUES ('all'), (e.subject_id::text)) AS scope(key)
    ), streaks_by_scope AS (
      SELECT user_id, key, count(*) FILTER (WHERE result = 'WIN' AND preceding_nonwins = 0) AS wins
      FROM ordered_results
      GROUP BY user_id, key
    ), streaks AS (
      SELECT user_id, jsonb_object_agg(key, wins) AS win_streaks
      FROM streaks_by_scope
      GROUP BY user_id
    )
    SELECT u.id, u.username, u.display_name, u.xp, r.rank_scores,
      CASE WHEN p.id IS NOT NULL THEN
        jsonb_build_object('id', p.id, 'name', p.name, 'image_path', p.image_path)
      END AS pet,
      COALESCE(w.win_streaks, '{}'::jsonb) AS win_streaks,
      COALESCE(a.answer_stats, '[]'::jsonb) AS answer_stats
    FROM ratings AS r
    JOIN users AS u ON u.id = r.user_id
    LEFT JOIN pets AS p ON p.id = u.equipped_pet_id
    LEFT JOIN streaks AS w ON w.user_id = u.id
    LEFT JOIN answer_stats AS a ON a.user_id = u.id
    ORDER BY u.id
  `, [season.season_no, season.starts_at, season.ends_at]);
  return rows.map(row => ({
    ...row,
    pet: formatPet(row.pet),
    rank_title: deriveRankTitle(row.xp)
  }));
}

router.get('/leaderboard', async (req, res) => {
  try {
    return res.apiSuccess(await readLeaderboard(await getArenaSeason()));
  } catch (error) {
    return res.apiError(error.message, 'FETCH_LEADERBOARD_FAILED', 500);
  }
});

router.get('/:matchId', authenticate, async (req, res) => {
  try {
    const match = await arena.getMatchState(req.params.matchId);
    if (!match.players.some(player => player.user_id === req.user.id)) {
      return res.apiError('Bạn không tham gia trận này.', 'MATCH_FORBIDDEN', 403);
    }
    return res.apiSuccess(match);
  } catch (error) {
    return res.apiError(error.message, 'FETCH_MATCH_FAILED', 404);
  }
});

router.post('/:matchId/pair', authenticate, async (req, res) => {
  try {
    const body = req.body;
    expectKeys(body, ['round_no', 'left', 'right']);
    expectRound(body.round_no);
    if (!isText(body.left) || !isText(body.right)) throw new Error('Nội dung ghép cặp không hợp lệ.');
    return res.apiSuccess(await arena.checkArenaPair(
      req.params.matchId,
      req.user.id,
      body.round_no,
      { left: body.left, right: body.right }
    ));
  } catch (error) {
    return res.apiError(error.message, 'CHECK_PAIR_FAILED', 400);
  }
});

router.post('/:matchId/turn', authenticate, async (req, res) => {
  try {
    validateTurn(req.body);
    const result = await arena.submitTurnAnswer({
      ...req.body,
      match_id: req.params.matchId,
      user_id: req.user.id
    });
    broadcastTurn(req.app.get('io'), result);
    return res.apiSuccess({
      match: result.match_state,
      user_id: result.user_id,
      round_no: result.round_no,
      is_correct: result.is_correct,
      damage: result.damage,
      is_critical: result.is_critical
    });
  } catch (error) {
    return res.apiError(error.message, 'SUBMIT_TURN_FAILED', 400);
  }
});

router.post('/:matchId/surrender', authenticate, async (req, res) => {
  try {
    expectKeys(req.body ?? {}, []);
    const match = await arena.surrenderMatch(req.params.matchId, req.user.id);
    broadcastMatchEnded(req.app.get('io'), match);
    return res.apiSuccess(match);
  } catch (error) {
    return res.apiError(error.message, 'SURRENDER_FAILED', 400);
  }
});

router.post('/:matchId/conclude', authenticate, async (req, res) => {
  try {
    expectKeys(req.body ?? {}, []);
    const match = await arena.concludeIfResolved(req.params.matchId, req.user.id);
    if (match.status === 'FINISHED') broadcastMatchEnded(req.app.get('io'), match);
    return res.apiSuccess(match);
  } catch (error) {
    return res.apiError(error.message, 'CONCLUDE_MATCH_FAILED', 400);
  }
});

module.exports = router;

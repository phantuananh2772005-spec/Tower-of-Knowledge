const { randomUUID } = require('node:crypto');
const db = require('../database/db');
const { verifySessionToken } = require('../middlewares/auth.middleware');
const { assertCurrentSession } = require('../services/session-validity.service');
const arenaService = require('../services/arena.service');
const registerReactions = require('./match-reactions');

const arenaStates = new WeakMap();
const botUsernames = ['bot_tapsu', 'bot_luky', 'bot_caothu'];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const queueTimeout = 15_000;
const introSeconds = 2.2;
const allowedTurnFields = new Set(['match_id', 'round_no', 'selected_option_position', 'submitted_text', 'response']);

const matchRoom = id => 'room_' + id;
const casualRoom = code => 'casual_' + code;
const isUuid = value => typeof value === 'string' && uuidPattern.test(value);
const isRecord = value => value && typeof value === 'object' && !Array.isArray(value);

function calculateBotTurnParams({ questionContent, myHp, botHp, userCombo }) {
  const qLen = (questionContent || '').length;
  // Natural reading baseline: ~22ms per char clamped between 1.2s and 2.8s
  const baseReadingTimeSec = Math.min(2.8, Math.max(1.2, 0.8 + qLen * 0.022));

  const hpDiff = myHp - botHp; // Positive: player leads; Negative: bot leads
  let willAnswerCorrectly = true;
  let thinkDurationSec = 2.0;
  let isAggressive = false;

  // SITUATION 1: Player leads significantly (>=20) or player is on fire (combo >= 2)
  // Bot activates "Catch-up / Pressure" mode: faster reaction, ~85% accuracy
  if (hpDiff >= 20 || userCombo >= 2) {
    isAggressive = true;
    willAnswerCorrectly = Math.random() < 0.85;
    thinkDurationSec = 0.8 + Math.random() * 1.4; // Quick 0.8s - 2.2s reaction
  }
  // SITUATION 2: Player is in critical danger (<=35 HP) or Bot leads heavily
  // Bot activates "Hesitation / Opportunity" mode: slower reaction, ~52% accuracy (allows comeback!)
  else if (myHp <= 35 || hpDiff <= -25) {
    willAnswerCorrectly = Math.random() < 0.52;
    thinkDurationSec = 3.2 + Math.random() * 2.8; // Hesitant 3.2s - 6.0s reaction
  }
  // SITUATION 3: Balanced match
  // Realistic student opponent: ~72% accuracy, medium pacing
  else {
    willAnswerCorrectly = Math.random() < 0.72;
    thinkDurationSec = 1.8 + Math.random() * 2.2;
  }

  const totalDelaySec = Math.min(8.8, Math.max(2.0, baseReadingTimeSec + thinkDurationSec));
  const delayMs = Math.round(totalDelaySec * 1000);

  return {
    delayMs,
    totalDelaySec,
    willAnswerCorrectly,
    isAggressive
  };
}

function finishBroadcast(io, match) {
  if (!io || !match || match.status === 'ACTIVE') return;
  const state = arenaStates.get(io);
  if (state) {
    stopBotJob(state, match.id);
    for (const [socketId, matchId] of state.matchBySocket) {
      if (matchId === match.id) state.matchBySocket.delete(socketId);
    }
    if (state.finished.has(match.id)) return;
    state.finished.add(match.id);
    if (state.finished.size > 512) state.finished.delete(state.finished.values().next().value);
  }
  const channel = matchRoom(match.id);
  io.to(channel).emit('match_ended', { match });
  io.in(channel).socketsLeave(channel);
  if (match.mode === 'RANKED' && match.status === 'FINISHED') {
    io.emit('leaderboard_updated', { match_id: match.id });
  }
}

function broadcastTurn(io, result) {
  if (!io || !result || result.replayed) return;
  io.to(matchRoom(result.match_id)).emit('turn_resolved', {
    match: result.match_state,
    user_id: result.user_id,
    round_no: result.round_no,
    is_correct: result.is_correct,
    damage: result.damage,
    is_critical: result.is_critical
  });
  if (result.match_ended) finishBroadcast(io, result.match_state);
}

function removeQueuedPlayer(state, userId, socketId = null) {
  const entry = state.queue.get(userId);
  if (!entry || (socketId && socketId !== entry.socket.id)) return false;
  clearTimeout(entry.timer);
  state.queue.delete(userId);
  return true;
}

function removeCasualRoom(io, state, room, message) {
  if (state.rooms.get(room.roomCode) !== room) return;
  const channel = casualRoom(room.roomCode);
  if (message) io.to(channel).emit('casual_room_closed', { message });
  io.in(channel).socketsLeave(channel);
  state.rooms.delete(room.roomCode);
}

function announceCasualRoom(io, room) {
  const member = player => {
    if (!player) return null;
    const { socketId, ...display } = player;
    return display;
  };
  io.to(casualRoom(room.roomCode)).emit('casual_room_updated', {
    roomCode: room.roomCode,
    host: member(room.host),
    guest: member(room.guest),
    subject_id: room.subject_id,
    status: room.guest ? 'READY' : 'WAITING'
  });
}

function roomCodeOf(value) {
  const code = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (!/^TOK-[A-Z0-9]{4,12}$/.test(code)) throw new Error('Vui lòng nhập mã phòng hợp lệ.');
  return code;
}

function textOrDefault(value, fallback, length = 100) {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, length) || fallback;
}

function roomPlayer(socket, info, host) {
  const { name, petIcon, image, petName, tier } = isRecord(info) ? info : {};
  const permittedImage = typeof image === 'string' && !image.includes('..')
    && /^\/assets\/[a-z0-9_./-]+\.(?:gif|png|webp|avif)$/i.test(image);
  return {
    userId: socket.user.id,
    socketId: socket.id,
    name: textOrDefault(name, socket.user.username || (host ? 'Chủ phòng' : 'Bạn giao hữu')),
    petIcon: textOrDefault(petIcon, host ? '🦉' : '🦊', 16),
    image: permittedImage ? image : null,
    petName: textOrDefault(petName, 'Linh thú'),
    tier: textOrDefault(tier, '🌱 Khởi nguyên I', 80)
  };
}

async function verifySubject(subjectId) {
  if (!isUuid(subjectId)) throw new Error('Vui lòng chọn môn học hợp lệ.');
  const subject = await db.queryOne("SELECT id FROM subjects WHERE id = $1 AND status = 'ACTIVE'", [subjectId]);
  if (!subject) throw new Error('Môn học không còn khả dụng.');
  return subject.id;
}

async function pickPracticeBot() {
  const bot = await db.queryOne(
    "SELECT id FROM users WHERE role = 'SYSTEM' AND disabled_at IS NULL AND username = ANY($1::text[])"
      + ' ORDER BY random() LIMIT 1',
    [botUsernames]
  );
  if (!bot) throw new Error('Hiện chưa có bot luyện tập khả dụng.');
  return bot.id;
}

function stopBotJob(state, matchId) {
  const job = state.botJobs.get(matchId);
  if (!job) return;
  clearTimeout(job.timer);
  state.botJobs.delete(matchId);
}

function trailingCorrectTurns(match, userId) {
  const results = match.turns.filter(turn => turn.user_id === userId).sort((a, b) => b.round_no - a.round_no);
  const firstWrong = results.findIndex(turn => !turn.is_correct);
  return firstWrong < 0 ? results.length : firstWrong;
}

function startBotJob(io, state, match) {
  if (match.mode !== 'PRACTICE' || match.status !== 'ACTIVE' || state.botJobs.has(match.id)) return;
  const bot = match.players.find(player => player.role === 'SYSTEM');
  const human = match.players.find(player => player.role !== 'SYSTEM');
  if (!bot || !human) return;

  const job = {};
  state.botJobs.set(match.id, job);
  const isCurrent = () => state.botJobs.get(match.id) === job;

  function schedule(run, delay) {
    if (!isCurrent()) return;
    job.timer = setTimeout(async () => {
      try {
        await run();
      } catch (error) {
        if (!isCurrent()) return;
        stopBotJob(state, match.id);
        io.to(matchRoom(match.id)).emit('error_msg', 'Bot chưa thể xử lý lượt này: ' + error.message);
      }
    }, delay);
    job.timer.unref?.();
  }

  async function tick() {
    const current = await arenaService.getMatchState(match.id);
    if (!isCurrent()) return;
    if (current.status !== 'ACTIVE') {
      stopBotJob(state, match.id);
      return;
    }
    const round = current.rounds.find(question => question.round_no === current.current_round_no);
    if (!round || current.turns.some(turn => turn.round_no === round.round_no && turn.user_id === bot.user_id)) {
      schedule(tick, 400);
      return;
    }
    const params = calculateBotTurnParams({
      questionContent: round.stem,
      myHp: current.players.find(player => player.user_id === human.user_id)?.hp ?? human.hp,
      botHp: current.players.find(player => player.user_id === bot.user_id)?.hp ?? bot.hp,
      userCombo: trailingCorrectTurns(current, human.user_id)
    });
    io.to(matchRoom(match.id)).emit('bot_thinking', {
      round_no: round.round_no,
      is_aggressive: params.isAggressive,
      estimated_delay_seconds: params.totalDelaySec
    });
    schedule(async () => {
      const result = await arenaService.submitBotTurn(match.id, bot.user_id, round.round_no, params.willAnswerCorrectly);
      broadcastTurn(io, result);
      schedule(tick, 400);
    }, params.delayMs);
  }

  const introRemaining = Math.max(0, new Date(match.started_at).getTime() + 2_500 - Date.now());
  schedule(tick, Number.isFinite(introRemaining) ? introRemaining : 2_500);
}

async function joinMatchRoom(state, socket, match) {
  const previous = state.matchBySocket.get(socket.id);
  if (match.status !== 'ACTIVE') {
    if (previous === match.id) {
      await socket.leave(matchRoom(match.id));
      state.matchBySocket.delete(socket.id);
    }
    return;
  }
  if (previous && previous !== match.id) throw new Error('Bạn đang có một trận đấu.');
  await socket.join(matchRoom(match.id));
  if (socket.connected) state.matchBySocket.set(socket.id, match.id);
}

function busyInMatch(io, state, userId) {
  if (state.pairing.has(userId)) return true;
  return [...state.matchBySocket.keys()].some(socketId => io.sockets.sockets.get(socketId)?.user.id === userId);
}

function matchNotice(match, userId, isCasual) {
  return {
    match,
    user_id: userId,
    opponent_is_bot: match.players.some(player => player.user_id !== userId && player.role === 'SYSTEM'),
    starts_in_seconds: introSeconds,
    is_casual: isCasual
  };
}

async function pairMatch(io, state, player1, player2, subjectId, mode, isCasual = false) {
  const humans = [player1, player2].filter(player => player.socket);
  if (humans.some(player => !player.socket.connected || busyInMatch(io, state, player.userId))) {
    throw new Error('Một người chơi không còn sẵn sàng ghép trận.');
  }
  humans.forEach(player => state.pairing.add(player.userId));
  try {
    const match = await arenaService.createMatch(player1.userId, player2.userId, subjectId, mode);
    for (const player of humans) {
      if (player.socket.connected) await joinMatchRoom(state, player.socket, match);
    }
    const departed = humans.find(player => !player.socket.connected);
    if (departed) {
      const result = await arenaService.surrenderMatch(match.id, departed.userId);
      for (const player of humans) {
        if (player.socket.connected) player.socket.emit('error_msg', 'Đối thủ đã ngắt kết nối trước khi vào trận.');
      }
      finishBroadcast(io, result);
      return;
    }
    for (const player of humans) player.socket.emit('match_found', matchNotice(match, player.userId, isCasual));
    startBotJob(io, state, match);
  } finally {
    humans.forEach(player => state.pairing.delete(player.userId));
  }
}

function initArenaSocket(io) {
  const state = {
    queue: new Map(),
    rooms: new Map(),
    pairing: new Set(),
    matchBySocket: new Map(),
    finished: new Set(),
    botJobs: new Map()
  };
  const reactionCooldowns = new Map();
  arenaStates.set(io, state);

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        socket.user = await verifySessionToken(token);
        return next();
      } catch {
        // Anonymous users may connect, but cannot take part in an arena match.
      }
    }
    socket.user = { id: randomUUID(), username: 'Khách', isGuest: true };
    next();
  });

  io.on('connection', socket => {
    const userId = socket.user.id;
    socket.use(async (_packet, next) => {
      if (socket.user.isGuest) return next();
      try {
        socket.user = await assertCurrentSession(socket.user);
        next();
      } catch {
        socket.disconnect(true);
      }
    });
    registerReactions(io, socket, db, reactionCooldowns);

    function handle(event, action, errorEvent = 'error_msg') {
      socket.on(event, async (value, reply) => {
        const acknowledge = typeof value === 'function' ? value : reply;
        try {
          if (socket.user.isGuest) throw new Error('Vui lòng đăng nhập để vào đấu trường.');
          const payload = typeof value === 'function' || value === undefined ? {} : value;
          if (!isRecord(payload)) throw new Error('Dữ liệu yêu cầu không hợp lệ.');
          const data = await action(payload);
          if (typeof acknowledge === 'function') acknowledge({ ok: true, data });
        } catch (error) {
          socket.emit(errorEvent, error.message);
          if (typeof acknowledge === 'function') acknowledge({ ok: false, reason: 'arena_failed', message: error.message });
        }
      });
    }

    handle('join_queue', async ({ subject_id }) => {
      const subjectId = await verifySubject(subject_id);
      if (!socket.connected || busyInMatch(io, state, userId)) throw new Error('Bạn đang có một trận đấu.');
      removeQueuedPlayer(state, userId);

      const opponent = [...state.queue.values()].find(entry => entry.subjectId === subjectId && entry.socket.connected);
      const player = { userId, socket };
      if (opponent) {
        removeQueuedPlayer(state, opponent.userId);
        try {
          await pairMatch(io, state, player, opponent, subjectId, 'RANKED');
        } catch (error) {
          opponent.socket.emit('error_msg', error.message);
          throw error;
        }
        return;
      }

      const entry = { ...player, subjectId };
      entry.timer = setTimeout(async () => {
        if (state.queue.get(userId) !== entry) return;
        try {
          const botId = await pickPracticeBot();
          if (state.queue.get(userId) !== entry || !socket.connected) return;
          removeQueuedPlayer(state, userId, socket.id);
          await pairMatch(io, state, player, { userId: botId }, subjectId, 'PRACTICE');
        } catch (error) {
          if (state.queue.get(userId) === entry) removeQueuedPlayer(state, userId, socket.id);
          if (!state.queue.has(userId) && socket.connected && !busyInMatch(io, state, userId)) {
            socket.emit('error_msg', error.message);
          }
        }
      }, queueTimeout);
      entry.timer.unref?.();
      state.queue.set(userId, entry);
      socket.emit('queue_waiting', { position: state.queue.size, timeout_ms: queueTimeout });
    });

    handle('leave_queue', () => {
      if (removeQueuedPlayer(state, userId, socket.id)) socket.emit('queue_cancelled');
    });

    handle('join_match_room', async ({ match_id }) => {
      if (!isUuid(match_id)) throw new Error('Mã trận đấu không hợp lệ.');
      const match = await arenaService.getMatchState(match_id, userId);
      await joinMatchRoom(state, socket, match);
      startBotJob(io, state, match);
      return { match };
    });

    handle('surrender', async ({ match_id }) => {
      if (!isUuid(match_id)) throw new Error('Mã trận đấu không hợp lệ.');
      const match = await arenaService.surrenderMatch(match_id, userId);
      finishBroadcast(io, match);
    });

    handle('submit_answer', async payload => {
      if (!isUuid(payload.match_id) || Object.keys(payload).some(field => !allowedTurnFields.has(field))) {
        throw new Error('Dữ liệu lượt trả lời không hợp lệ.');
      }
      const result = await arenaService.submitTurnAnswer({ ...payload, match_id: payload.match_id.toLowerCase(), user_id: userId });
      broadcastTurn(io, result);
      return result;
    });

    handle('casual_create_or_update_room', async ({ roomCode, playerInfo, subject_id }) => {
      const code = roomCodeOf(roomCode);
      const subjectId = await verifySubject(subject_id);
      if (!socket.connected) return;
      const existing = state.rooms.get(code);
      if (existing && existing.host.userId !== userId) throw new Error('Mã phòng này đang được sử dụng.');
      if (existing?.starting) throw new Error('Phòng đang bắt đầu trận đấu.');

      const room = {
        roomCode: code,
        host: roomPlayer(socket, playerInfo, true),
        guest: existing?.guest ?? null,
        subject_id: subjectId,
        starting: false
      };
      state.rooms.set(code, room);
      if (existing && existing.host.socketId !== socket.id) {
        await io.sockets.sockets.get(existing.host.socketId)?.leave(casualRoom(code));
      }
      await socket.join(casualRoom(code));
      announceCasualRoom(io, room);
    }, 'casual_error');

    handle('casual_join_room', async ({ roomCode, playerInfo }) => {
      const code = roomCodeOf(roomCode);
      const room = state.rooms.get(code);
      if (!room) throw new Error('Không tìm thấy phòng ' + code + '.');
      if (room.starting) throw new Error('Phòng đang bắt đầu trận đấu.');
      if (room.host.userId === userId) throw new Error('Bạn đang là chủ phòng này.');
      if (room.guest && room.guest.userId !== userId) throw new Error('Phòng đã đủ hai người chơi.');
      if (room.guest && room.guest.socketId !== socket.id) {
        await io.sockets.sockets.get(room.guest.socketId)?.leave(casualRoom(code));
      }
      room.guest = roomPlayer(socket, playerInfo, false);
      await socket.join(casualRoom(code));
      announceCasualRoom(io, room);
    }, 'casual_error');

    handle('casual_leave_room', async ({ roomCode }) => {
      const code = roomCodeOf(roomCode);
      const room = state.rooms.get(code);
      if (!room) return;
      if (room.host.socketId === socket.id) {
        removeCasualRoom(io, state, room, 'Chủ phòng đã rời khỏi sảnh giao hữu.');
      } else if (room.guest?.socketId === socket.id) {
        room.guest = null;
        await socket.leave(casualRoom(code));
        announceCasualRoom(io, room);
      }
    }, 'casual_error');

    handle('casual_start_match', async ({ roomCode }) => {
      const code = roomCodeOf(roomCode);
      const room = state.rooms.get(code);
      if (!room) throw new Error('Phòng không tồn tại hoặc đã kết thúc.');
      if (room.host.socketId !== socket.id) throw new Error('Chỉ chủ phòng mới có thể bắt đầu trận đấu.');
      if (room.starting) throw new Error('Phòng đang bắt đầu trận đấu.');
      const guestSocket = io.sockets.sockets.get(room.guest?.socketId);
      if (!guestSocket) throw new Error('Chưa có bạn bè vào đội để bắt đầu trận đấu.');
      room.starting = true;
      removeQueuedPlayer(state, userId);
      removeQueuedPlayer(state, guestSocket.user.id);
      try {
        await pairMatch(io, state, { userId, socket }, { userId: guestSocket.user.id, socket: guestSocket },
          room.subject_id, 'CASUAL', true);
        removeCasualRoom(io, state, room);
      } finally {
        room.starting = false;
      }
    }, 'casual_error');

    socket.on('disconnect', async () => {
      removeQueuedPlayer(state, userId, socket.id);
      for (const room of state.rooms.values()) {
        if (room.host.socketId === socket.id) {
          removeCasualRoom(io, state, room, 'Chủ phòng đã mất kết nối.');
        } else if (room.guest?.socketId === socket.id) {
          room.guest = null;
          announceCasualRoom(io, room);
        }
      }
      const activeMatch = state.matchBySocket.get(socket.id);
      state.matchBySocket.delete(socket.id);
      if (!activeMatch || [...state.matchBySocket].some(([id, matchId]) =>
        matchId === activeMatch && io.sockets.sockets.get(id)?.user.id === userId)) return;
      try {
        const match = await arenaService.getMatchState(activeMatch, userId);
        if (match.status === 'ACTIVE') finishBroadcast(io, await arenaService.surrenderMatch(activeMatch, userId));
      } catch (error) {
        console.warn('[ARENA] Không thể xử lý ngắt kết nối:', error.message);
      }
    });
  });
}

module.exports = {
  initArenaSocket,
  calculateBotTurnParams,
  broadcastTurn,
  broadcastMatchEnded: finishBroadcast
};

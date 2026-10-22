/**
 * Arena 1v1 Socket.IO Handler
 * Decouples network transport from core combat logic.
 * Handles matchmaking queue, human-vs-human or human-vs-bot pairing,
 * safe fallback timeouts, and dynamic adaptive bot turn resolution.
 */

const jwt = require('jsonwebtoken');
const arenaService = require('../services/arena.service');
const JWT_SECRET = process.env.JWT_SECRET || 'tower_of_knowledge_ultra_secure_jwt_secret_2026';

// In-memory matchmaking queue
const matchmakingQueue = [];
// Active bot timers mapped by matchId
const botTimers = new Map();
// Active ongoing matches mapped by userId and socketId for disconnect protection
const userActiveMatchMap = new Map();
const socketActiveMatchMap = new Map();

/**
 * Dynamic Adaptive Bot Formula
 * Calculates bot reaction delay, accuracy percentage, and psychological pacing
 */
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

function initArenaSocket(io) {
  // Middleware to authenticate socket gracefully (supports registered users & guests)
  io.use((socket, next) => {
    const token = (socket.handshake.auth && socket.handshake.auth.token) || socket.handshake.query?.token;
    if (!token) {
      const guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
      socket.user = { ma_nguoi_dung: guestId, ten_dang_nhap: 'Khách', isGuest: true };
      return next();
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      const guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
      socket.user = { ma_nguoi_dung: guestId, ten_dang_nhap: 'Khách', isGuest: true };
      next();
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.ma_nguoi_dung;

    // Join Matchmaking Queue
    socket.on('join_queue', async (data = {}) => {
      const ma_mon = data.ma_mon || 'mon_csdl';

      // Check if already in queue & clean previous
      const existingIdx = matchmakingQueue.findIndex(q => q.userId === userId);
      if (existingIdx !== -1) {
        if (matchmakingQueue[existingIdx].timer) clearTimeout(matchmakingQueue[existingIdx].timer);
        matchmakingQueue.splice(existingIdx, 1);
      }

      // Check if there is another real player waiting for this course
      const matchCandidateIdx = matchmakingQueue.findIndex(q => q.userId !== userId && q.ma_mon === ma_mon);

      if (matchCandidateIdx !== -1) {
        // MATCH FOUND with real human player!
        const opponent = matchmakingQueue.splice(matchCandidateIdx, 1)[0];
        if (opponent.timer) clearTimeout(opponent.timer);

        try {
          const matchState = await arenaService.createMatch(userId, opponent.userId, ma_mon);
          const roomName = `room_${matchState.ma_tran}`;

          userActiveMatchMap.set(userId, matchState.ma_tran);
          socketActiveMatchMap.set(socket.id, matchState.ma_tran);
          userActiveMatchMap.set(opponent.userId, matchState.ma_tran);
          if (opponent.socket) socketActiveMatchMap.set(opponent.socket.id, matchState.ma_tran);

          socket.join(roomName);
          opponent.socket.join(roomName);

          socket.emit('match_found', {
            ma_tran: matchState.ma_tran,
            nguoi_choi: matchState.nguoi_choi,
            thoi_gian_bat_dau_sau_giay: 2.2,
            doi_thu_la_bot: false,
            my_user_id: userId,
            matchState
          });

          opponent.socket.emit('match_found', {
            ma_tran: matchState.ma_tran,
            nguoi_choi: matchState.nguoi_choi,
            thoi_gian_bat_dau_sau_giay: 2.2,
            doi_thu_la_bot: false,
            my_user_id: opponent.userId,
            matchState
          });
        } catch (err) {
          socket.emit('error_msg', 'Không thể khởi tạo trận đấu: ' + err.message);
        }
      } else {
        // Add to queue
        const queueEntry = { userId, socket, ma_mon, joinedAt: Date.now() };
        matchmakingQueue.push(queueEntry);
        socket.emit('queue_waiting', { vi_tri: matchmakingQueue.length, safeTimeoutMs: 15000 });

        // Auto-match with smart bot after 15.0 seconds if no human joins (Safe Fallback Protection)
        queueEntry.timer = setTimeout(async () => {
          const idx = matchmakingQueue.indexOf(queueEntry);
          if (idx !== -1) {
            matchmakingQueue.splice(idx, 1);
            try {
              // Select canonical bot opponent (usr_bot_001, usr_bot_002, usr_bot_003)
              const botPool = ['usr_bot_001', 'usr_bot_002', 'usr_bot_003'];
              const chosenBotId = botPool[Math.floor(Math.random() * botPool.length)];

              const matchState = await arenaService.createMatch(userId, chosenBotId, ma_mon);
              const roomName = `room_${matchState.ma_tran}`;
              userActiveMatchMap.set(userId, matchState.ma_tran);
              socketActiveMatchMap.set(socket.id, matchState.ma_tran);
              socket.join(roomName);

              socket.emit('match_found', {
                ma_tran: matchState.ma_tran,
                nguoi_choi: matchState.nguoi_choi,
                thoi_gian_bat_dau_sau_giay: 2.2,
                doi_thu_la_bot: true,
                my_user_id: userId,
                matchState
              });

              // Setup intelligent adaptive bot behavior
              setupSmartBotTurns(io, roomName, matchState.ma_tran, userId, chosenBotId);
            } catch (err) {
              socket.emit('error_msg', 'Lỗi ghép trận bot bảo vệ: ' + err.message);
            }
          }
        }, 15000);
      }
    });

    // Leave Queue
    socket.on('leave_queue', () => {
      const idx = matchmakingQueue.findIndex(q => q.userId === userId);
      if (idx !== -1) {
        if (matchmakingQueue[idx].timer) clearTimeout(matchmakingQueue[idx].timer);
        matchmakingQueue.splice(idx, 1);
        socket.emit('queue_cancelled');
      }
    });

    // Surrender Match
    socket.on('surrender', async ({ ma_tran } = {}) => {
      if (!ma_tran) return;
      try {
        const roomName = `room_${ma_tran}`;
        userActiveMatchMap.delete(userId);
        socketActiveMatchMap.delete(socket.id);
        const finalState = await arenaService.surrenderMatch(ma_tran, userId);
        clearBotTimer(ma_tran);
        io.to(roomName).emit('match_ended', {
          ma_tran,
          nguoi_thang_cuoc: finalState.nguoi_thang_cuoc,
          ly_do_ket_thuc: 'DAU_HANG',
          trang_thai_cuoi: finalState
        });
        io.emit('leaderboard_updated', { timestamp: Date.now(), ma_tran });
      } catch (err) {
        socket.emit('error_msg', err.message);
      }
    });

    // Join Match Room
    socket.on('join_match_room', ({ ma_tran }) => {
      if (ma_tran) {
        const roomName = `room_${ma_tran}`;
        userActiveMatchMap.set(userId, ma_tran);
        socketActiveMatchMap.set(socket.id, ma_tran);
        socket.join(roomName);
        console.log(`[SOCKET] User ${userId} (socket ${socket.id}) joined ${roomName}. Rooms of this socket:`, Array.from(socket.rooms));
      }
    });

    // Submit Turn Answer
    socket.on('submit_answer', async (payload) => {
      const { ma_tran, thu_tu_cau, vi_tri_dap_an_chon, cau_tra_loi, thoi_gian_giay } = payload;
      console.log(`[SOCKET] submit_answer from ${userId} (socket ${socket.id}) in match ${ma_tran}, round ${thu_tu_cau}`);
      console.log(`[SOCKET] Socket current rooms:`, Array.from(socket.rooms));
      try {
        const turnResult = await arenaService.submitTurnAnswer({
          ma_tran,
          ma_nguoi_dung: userId,
          thu_tu_cau,
          vi_tri_dap_an_chon,
          cau_tra_loi,
          thoi_gian_giay
        });

        const roomName = `room_${ma_tran}`;
        const roomClients = await io.in(roomName).allSockets();
        console.log(`[SOCKET] Turn success! Damage: ${turnResult.sat_thuong_gay_ra}. Broadcasting turn_resolved to ${roomName} (allSockets in room:`, Array.from(roomClients), `)`);

        // Broadcast turn outcome and HP updates to room
        io.to(roomName).emit('turn_resolved', {
          nguoi_tra_loi: userId,
          thu_tu_cau,
          la_dap_an_dung: turnResult.la_dap_an_dung,
          sat_thuong_gay_ra: turnResult.sat_thuong_gay_ra,
          la_chi_mang: turnResult.la_chi_mang,
          trang_thai_tran: turnResult.trang_thai_tran
        });

        // Send feedback to caller
        socket.emit('turn_feedback', {
          vi_tri_dap_an_dung: turnResult.vi_tri_dap_an_dung,
          giai_thich: turnResult.giai_thich
        });

        if (turnResult.tran_ket_thuc) {
          clearBotTimer(ma_tran);
          userActiveMatchMap.delete(userId);
          socketActiveMatchMap.delete(socket.id);
          io.to(roomName).emit('match_ended', {
            ma_tran,
            nguoi_thang_cuoc: turnResult.trang_thai_tran.nguoi_thang_cuoc,
            ly_do_ket_thuc: turnResult.trang_thai_tran.ly_do_ket_thuc,
            trang_thai_cuoi: turnResult.trang_thai_tran
          });
          io.emit('leaderboard_updated', { timestamp: Date.now(), ma_tran });
        }
      } catch (err) {
        socket.emit('error_msg', err.message);
      }
    });

    socket.on('disconnect', async (reason) => {
      console.log(`[SOCKET] Disconnect: socket ${socket.id}, user ${userId}, reason: ${reason}`);
      const idx = matchmakingQueue.findIndex(q => q.userId === userId);
      if (idx !== -1) {
        if (matchmakingQueue[idx].timer) clearTimeout(matchmakingQueue[idx].timer);
        matchmakingQueue.splice(idx, 1);
      }

      // Check if user was in an ongoing 1v1 match
      const activeMatchId = socketActiveMatchMap.get(socket.id) || userActiveMatchMap.get(userId);
      if (activeMatchId) {
        socketActiveMatchMap.delete(socket.id);
        userActiveMatchMap.delete(userId);
        try {
          const match = await arenaService.getMatchState(activeMatchId);
          if (match && match.trang_thai === 'DANG_THI_DAU') {
            console.log(`[SOCKET] User ${userId} disconnected mid-battle ${activeMatchId}. Auto-forfeiting match!`);
            const finalState = await arenaService.surrenderMatch(activeMatchId, userId);
            clearBotTimer(activeMatchId);
            const roomName = `room_${activeMatchId}`;
            io.to(roomName).emit('match_ended', {
              ma_tran: activeMatchId,
              nguoi_thang_cuoc: finalState.nguoi_thang_cuoc,
              ly_do_ket_thuc: 'DAU_HANG',
              mo_ta: 'Đối thủ đã ngắt kết nối hoặc rời trận đấu. Bạn được xử THẮNG!',
              trang_thai_cuoi: finalState
            });
            io.emit('leaderboard_updated', { timestamp: Date.now(), ma_tran: activeMatchId });
          }
        } catch (disErr) {
          console.warn('[SOCKET] Auto-surrender on disconnect error:', disErr.message);
        }
      }
    });
  });
}

function clearBotTimer(matchId) {
  if (botTimers.has(matchId)) {
    clearTimeout(botTimers.get(matchId));
    botTimers.delete(matchId);
  }
}

/**
 * Simulate dynamic adaptive bot turn with human-like pacing and psychology
 */
function setupSmartBotTurns(io, roomName, matchId, humanUserId, botUserId) {
  let currentQuestion = 1;
  let userCombo = 0;

  function scheduleNextBotTurn() {
    // Fetch match state to compute dynamic adaptive parameters
    arenaService.getMatchState(matchId).then((matchState) => {
      if (matchState.trang_thai === 'KET_THUC') return;
      const totalQuestions = matchState.cau_hoi?.length || 10;
      if (currentQuestion > totalQuestions) return;

      const qInMatch = matchState.cau_hoi[currentQuestion - 1];
      if (!qInMatch) return;

      const humanPlayer = matchState.nguoi_choi.find(p => p.ma_nguoi_dung === humanUserId);
      const botPlayer = matchState.nguoi_choi.find(p => p.ma_nguoi_dung === botUserId);

      const myHp = humanPlayer ? humanPlayer.mau_hien_tai : 100;
      const botHp = botPlayer ? botPlayer.mau_hien_tai : 100;

      const botConfig = calculateBotTurnParams({
        questionContent: qInMatch.noi_dung,
        myHp,
        botHp,
        userCombo,
        questionIndex: currentQuestion
      });

      // Emit typing / thinking state
      io.to(roomName).emit('bot_thinking', {
        thu_tu_cau: currentQuestion,
        isAggressive: botConfig.isAggressive,
        estimatedDelaySec: botConfig.totalDelaySec
      });

      const timer = setTimeout(async () => {
        try {
          const freshState = await arenaService.getMatchState(matchId);
          if (freshState.trang_thai === 'KET_THUC') return;

          // Resolve bot choice depending on question type
          const qType = qInMatch.loai_cau_hoi || 'TRAC_NGHIEM_4';
          let botChoice = 0;
          let botPayload = null;
          const db = require('../database/db');
          const qDetail = await db.queryOne('SELECT vi_tri_dap_an_dung, du_lieu_cau_hoi FROM cau_hoi WHERE ma_cau_hoi = $1', [qInMatch.ma_cau_hoi]);
          let parsedQ = null;
          if (qDetail && qDetail.du_lieu_cau_hoi) {
            try {
              parsedQ = typeof qDetail.du_lieu_cau_hoi === 'string' ? JSON.parse(qDetail.du_lieu_cau_hoi) : qDetail.du_lieu_cau_hoi;
            } catch (e) {}
          }

          if (qType === 'NOI_CAP') {
            botPayload = {
              matched_pairs: botConfig.willAnswerCorrectly ? (parsedQ?.pairs || []) : [],
              cap_ghep: botConfig.willAnswerCorrectly ? (parsedQ?.pairs || []) : []
            };
            botChoice = botConfig.willAnswerCorrectly ? 1 : 0;
          } else if (qType === 'SAP_XEP_CAU') {
            const correctOrder = parsedQ?.correct_order || parsedQ?.cac_tu_dung || [];
            botPayload = {
              ordered_words: botConfig.willAnswerCorrectly ? correctOrder : [],
              cau_ghep: botConfig.willAnswerCorrectly ? correctOrder.join(' ') : 'sai_thu_tu'
            };
            botChoice = botConfig.willAnswerCorrectly ? 1 : 0;
          } else if (qType === 'DIEN_TU') {
            const correctWord = parsedQ?.blank_answer || parsedQ?.tu_dung || '';
            botPayload = {
              tu_chon: botConfig.willAnswerCorrectly ? correctWord : 'tu_sai_ngau_nhien'
            };
            botChoice = botConfig.willAnswerCorrectly ? 1 : 0;
          } else {
            if (qDetail && qDetail.vi_tri_dap_an_dung !== null) {
              botChoice = botConfig.willAnswerCorrectly
                ? qDetail.vi_tri_dap_an_dung
                : (qDetail.vi_tri_dap_an_dung + 1) % 4;
            }
          }

          const turnResult = await arenaService.submitTurnAnswer({
            ma_tran: matchId,
            ma_nguoi_dung: botUserId,
            thu_tu_cau: currentQuestion,
            vi_tri_dap_an_chon: botChoice,
            cau_tra_loi: botPayload,
            thoi_gian_giay: botConfig.totalDelaySec
          });

          io.to(roomName).emit('turn_resolved', {
            nguoi_tra_loi: botUserId,
            thu_tu_cau: currentQuestion,
            la_dap_an_dung: turnResult.la_dap_an_dung,
            sat_thuong_gay_ra: turnResult.sat_thuong_gay_ra,
            la_chi_mang: turnResult.la_chi_mang,
            trang_thai_tran: turnResult.trang_thai_tran
          });

          if (turnResult.tran_ket_thuc) {
            clearBotTimer(matchId);
            io.to(roomName).emit('match_ended', {
              ma_tran: matchId,
              nguoi_thang_cuoc: turnResult.trang_thai_tran.nguoi_thang_cuoc,
              ly_do_ket_thuc: turnResult.trang_thai_tran.ly_do_ket_thuc,
              trang_thai_cuoi: turnResult.trang_thai_tran
            });
            io.emit('leaderboard_updated', { timestamp: Date.now(), ma_tran: matchId });
          } else {
            currentQuestion++;
            scheduleNextBotTurn();
          }
        } catch (err) {
          // Match might have concluded already
        }
      }, botConfig.delayMs);

      botTimers.set(matchId, timer);
    }).catch(() => {});
  }

  // Start round 1 after VS screen animation completes (~2.5 seconds)
  setTimeout(scheduleNextBotTurn, 2500);
}

module.exports = {
  initArenaSocket,
  calculateBotTurnParams
};

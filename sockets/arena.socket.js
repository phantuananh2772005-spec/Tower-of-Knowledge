/**
 * Arena 1v1 Socket.IO Handler
 * Decouples network transport from core combat logic.
 * Handles matchmaking queue, human-vs-human or human-vs-bot pairing,
 * and synchronized question rounds.
 */

const jwt = require('jsonwebtoken');
const arenaService = require('../services/arena.service');
const JWT_SECRET = process.env.JWT_SECRET || 'tower_of_knowledge_ultra_secure_jwt_secret_2026';

// In-memory matchmaking queue
const matchmakingQueue = [];
// Active bot timers mapped by matchId
const botTimers = new Map();

function initArenaSocket(io) {
  // Middleware to authenticate socket
  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Yêu cầu xác thực tài khoản.'));
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Phiên xác thực không hợp lệ.'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.ma_nguoi_dung;
    const username = socket.user.ten_dang_nhap;

    // Join Matchmaking Queue
    socket.on('join_queue', async (data = {}) => {
      const ma_mon = data.ma_mon || 'mon_csdl';

      // Check if already in queue
      const existingIdx = matchmakingQueue.findIndex(q => q.userId === userId);
      if (existingIdx !== -1) {
        matchmakingQueue.splice(existingIdx, 1);
      }

      // Check if there is another player waiting for this course
      const matchCandidateIdx = matchmakingQueue.findIndex(q => q.userId !== userId && q.ma_mon === ma_mon);

      if (matchCandidateIdx !== -1) {
        // MATCH FOUND with human!
        const opponent = matchmakingQueue.splice(matchCandidateIdx, 1)[0];
        try {
          const matchState = await arenaService.createMatch(userId, opponent.userId, ma_mon);
          const roomName = `room_${matchState.ma_tran}`;

          socket.join(roomName);
          opponent.socket.join(roomName);

          io.to(roomName).emit('match_found', {
            ma_tran: matchState.ma_tran,
            nguoi_choi: matchState.nguoi_choi,
            thoi_gian_bat_dau_sau_giay: 3
          });
        } catch (err) {
          socket.emit('error_msg', 'Không thể khởi tạo trận đấu: ' + err.message);
        }
      } else {
        // Add to queue
        const queueEntry = { userId, socket, ma_mon, joinedAt: Date.now() };
        matchmakingQueue.push(queueEntry);
        socket.emit('queue_waiting', { vi_tri: matchmakingQueue.length });

        // Auto-match with bot after 3.5 seconds if no human joins
        setTimeout(async () => {
          const idx = matchmakingQueue.indexOf(queueEntry);
          if (idx !== -1) {
            matchmakingQueue.splice(idx, 1);
            try {
              const matchState = await arenaService.createMatch(userId, 'usr_bot_003', ma_mon);
              const roomName = `room_${matchState.ma_tran}`;
              socket.join(roomName);

              socket.emit('match_found', {
                ma_tran: matchState.ma_tran,
                nguoi_choi: matchState.nguoi_choi,
                thoi_gian_bat_dau_sau_giay: 3,
                doi_thu_la_bot: true
              });

              // Setup bot behavior
              setupBotTurns(io, roomName, matchState.ma_tran, userId, 'usr_bot_003');
            } catch (err) {
              socket.emit('error_msg', 'Lỗi ghép trận: ' + err.message);
            }
          }
        }, 3500);
      }
    });

    // Leave Queue
    socket.on('leave_queue', () => {
      const idx = matchmakingQueue.findIndex(q => q.userId === userId);
      if (idx !== -1) {
        matchmakingQueue.splice(idx, 1);
        socket.emit('queue_cancelled');
      }
    });

    // Join Match Room
    socket.on('join_match_room', ({ ma_tran }) => {
      if (ma_tran) {
        socket.join(`room_${ma_tran}`);
      }
    });

    // Submit Turn Answer
    socket.on('submit_answer', async (payload) => {
      const { ma_tran, thu_tu_cau, vi_tri_dap_an_chon, thoi_gian_giay } = payload;
      try {
        const turnResult = await arenaService.submitTurnAnswer({
          ma_tran,
          ma_nguoi_dung: userId,
          thu_tu_cau,
          vi_tri_dap_an_chon,
          thoi_gian_giay
        });

        const roomName = `room_${ma_tran}`;
        // Broadcast turn outcome and HP updates to room
        io.to(roomName).emit('turn_resolved', {
          nguoi_tra_loi: userId,
          thu_tu_cau,
          la_dap_an_dung: turnResult.la_dap_an_dung,
          sat_thuong_gay_ra: turnResult.sat_thuong_gay_ra,
          la_chi_mang: turnResult.la_chi_mang,
          trang_thai_tran: turnResult.trang_thai_tran
        });

        // Send explanation only to caller
        socket.emit('turn_feedback', {
          vi_tri_dap_an_dung: turnResult.vi_tri_dap_an_dung,
          giai_thich: turnResult.giai_thich
        });

        if (turnResult.tran_ket_thuc) {
          clearBotTimer(ma_tran);
          io.to(roomName).emit('match_ended', {
            ma_tran,
            nguoi_thang_cuoc: turnResult.trang_thai_tran.nguoi_thang_cuoc,
            ly_do_ket_thuc: turnResult.trang_thai_tran.ly_do_ket_thuc,
            trang_thai_cuoi: turnResult.trang_thai_tran
          });
        }
      } catch (err) {
        socket.emit('error_msg', err.message);
      }
    });

    socket.on('disconnect', () => {
      const idx = matchmakingQueue.findIndex(q => q.userId === userId);
      if (idx !== -1) {
        matchmakingQueue.splice(idx, 1);
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
 * Simulate intelligent bot turn for single-player practice
 */
function setupBotTurns(io, roomName, matchId, humanUserId, botUserId) {
  let currentQuestion = 1;

  function scheduleNextBotTurn() {
    if (currentQuestion > 5) return;

    // Bot takes 2.2 to 3.8 seconds to answer
    const delay = Math.floor(Math.random() * 1600) + 2200;
    const timer = setTimeout(async () => {
      try {
        const matchState = await arenaService.getMatchState(matchId);
        if (matchState.trang_thai === 'KET_THUC') return;

        // Bot accuracy ~ 75%
        const qInMatch = matchState.cau_hoi[currentQuestion - 1];
        if (!qInMatch) return;

        // We query the question's correct answer
        const db = require('../database/db');
        const qDetail = await db.queryOne('SELECT vi_tri_dap_an_dung FROM cau_hoi WHERE noi_dung = $1', [qInMatch.noi_dung]);
        let botChoice = 0;
        if (qDetail) {
          const willAnswerCorrectly = Math.random() < 0.75;
          botChoice = willAnswerCorrectly ? qDetail.vi_tri_dap_an_dung : (qDetail.vi_tri_dap_an_dung + 1) % 4;
        }

        const turnResult = await arenaService.submitTurnAnswer({
          ma_tran: matchId,
          ma_nguoi_dung: botUserId,
          thu_tu_cau: currentQuestion,
          vi_tri_dap_an_chon: botChoice,
          thoi_gian_giay: delay / 1000
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
        } else {
          currentQuestion++;
          scheduleNextBotTurn();
        }
      } catch (err) {
        // Match might be concluded already
      }
    }, delay);

    botTimers.set(matchId, timer);
  }

  // Start round 1 after VS screen countdown
  setTimeout(scheduleNextBotTurn, 3500);
}

module.exports = {
  initArenaSocket
};

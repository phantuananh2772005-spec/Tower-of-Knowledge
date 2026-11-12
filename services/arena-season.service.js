const db = require('../database/db');
const { mutateCoinsInTransaction } = require('./economy.service');

// Monday, 9 November 2026 at 00:00 in Vietnam.
const firstStart = Date.parse('2026-11-09T00:00:00+07:00');
const seasonLength = 56 * 86400000;

function arenaSeasonAt(now = Date.now()) {
  const number = Math.max(1, Math.floor((now - firstStart) / seasonLength) + 1);
  const start = firstStart + (number - 1) * seasonLength;
  return { number, startsAt: new Date(start).toISOString(), endsAt: new Date(start + seasonLength).toISOString() };
}

async function syncArenaSeason(tx, now = Date.now()) {
  const current = arenaSeasonAt(now);
  const state = await tx.queryOne('SELECT mua FROM mua_dau_hang WHERE id=1' + (db.isPostgres ? ' FOR UPDATE' : ''));
  if (!state || state.mua >= current.number) return current;

  const previous = arenaSeasonAt(firstStart + (state.mua - 1) * seasonLength);
  const participants = await tx.query(`
    SELECT DISTINCT p.ma_nguoi_dung
    FROM nguoi_choi_trong_tran p JOIN tran_dau_1v1 t ON t.ma_tran=p.ma_tran
    WHERE p.xu_nhan_duoc>0 AND t.che_do='RANKED'
      AND t.thoi_gian_ket_thuc >= $1 AND t.thoi_gian_ket_thuc < $2
  `, [previous.startsAt, previous.endsAt]);
  const eligible = new Set(participants.map(player => player.ma_nguoi_dung));
  const rows = await tx.query(`
    SELECT r.ma_nguoi_dung, r.ma_mon, r.diem
    FROM diem_dau_hang r JOIN nguoi_dung u ON u.ma_nguoi_dung=r.ma_nguoi_dung
    WHERE u.vai_tro NOT IN ('QUAN_TRI_VIEN','HE_THONG')
      AND u.ma_nguoi_dung NOT LIKE 'usr_bot_%'
  `);
  const players = new Map();
  for (const row of rows) {
    if (!eligible.has(row.ma_nguoi_dung)) continue;
    if (!players.has(row.ma_nguoi_dung)) players.set(row.ma_nguoi_dung, { id: row.ma_nguoi_dung, points: 0, courses: {} });
    const player = players.get(row.ma_nguoi_dung);
    player.points += Number(row.diem);
    player.courses[row.ma_mon] = Number(row.diem);
  }
  const standings = [...players.values()].filter(player => player.points > 0)
    .sort((a, b) => b.points - a.points || a.id.localeCompare(b.id));
  let position = 0;
  for (const [index, player] of standings.entries()) {
    if (index === 0 || player.points !== standings[index - 1].points) position = index + 1;
    player.position = position;
    player.coins = position === 1 ? 150 : position <= 3 ? 100 : position <= 10 ? 50 : 0;
  }
  standings.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  for (const player of standings) {
    await tx.execute(
      'INSERT INTO lich_su_mua_dau_hang(mua,ma_nguoi_dung,diem,vi_tri,xu_thuong,diem_theo_mon) VALUES($1,$2,$3,$4,$5,$6)',
      [state.mua, player.id, player.points, player.position, player.coins, JSON.stringify(player.courses)]
    );
    if (player.coins) {
      await mutateCoinsInTransaction(tx, player.id, player.coins, 'THUONG_TRAN_DAU', `Top ${player.position} mùa ${state.mua}`);
    }
  }
  const divisor = Math.pow(2, Math.min(31, current.number - state.mua));
  await tx.execute('UPDATE diem_dau_hang SET diem=CAST(FLOOR(diem * 1.0 / $1) AS INT)', [divisor]);
  await tx.execute('UPDATE mua_dau_hang SET mua=$1 WHERE id=1', [current.number]);
  return current;
}

async function getArenaSeason() {
  const current = arenaSeasonAt();
  const state = await db.queryOne('SELECT mua FROM mua_dau_hang WHERE id=1');
  return state?.mua === current.number ? current : db.transaction(tx => syncArenaSeason(tx));
}

module.exports = { arenaSeasonAt, syncArenaSeason, getArenaSeason };

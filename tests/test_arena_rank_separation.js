const assert = require('node:assert/strict');
const dbPath = require.resolve('../database/db');
const postgresModule = process.env.TOK_TEST_PGLITE;
const pg = postgresModule ? new (require(postgresModule).PGlite)() : null;
const nativeUrl = process.env.TOK_TEST_NATIVE_PG;
if (nativeUrl) {
  const target = new URL(nativeUrl);
  assert.equal(target.hostname, '127.0.0.1');
  assert.equal(target.pathname, '/tok_isolated_test');
}
const native = nativeUrl ? new (require('pg').Pool)({ connectionString: nativeUrl }) : null;
const pool = native || pg || new (require('pg-mem').newDb().adapters.createPg().Pool)();

function makeAdapter(connection) {
  const query = async (sql, params) => {
    const top = sql.match(/^\s*SELECT\s+TOP\s+(\d+)\s+([\s\S]+)$/i);
    const normalized = (top ? `SELECT ${top[2]} LIMIT ${top[1]}` : sql).replace(/SYSDATETIME\(\)/gi, 'NOW()');
    if (pg && !params) return (await connection.exec(normalized)).at(-1)?.rows || [];
    const result = await connection.query(pg || native ? normalized : normalized.replace(/ FOR UPDATE$/i, ''), params);
    return Array.isArray(result) ? result.at(-1)?.rows || [] : result.rows;
  };
  return { isPostgres: true, query, queryOne: async (...args) => (await query(...args))[0] || null, execute: query };
}

const adapter = makeAdapter(pool);
const query = adapter.query;
adapter.transaction = async fn => {
  if (pg) return pg.transaction(tx => fn(makeAdapter(tx)));
  if (!native) return fn(adapter);
  const connection = await native.connect();
  try {
    await connection.query('BEGIN');
    const result = await fn(makeAdapter(connection));
    await connection.query('COMMIT');
    return result;
  } catch (error) {
    await connection.query('ROLLBACK');
    throw error;
  } finally {
    connection.release();
  }
};
require.cache[dbPath] = {exports:adapter};
const arena = require('../services/arena.service');
const { initArenaRanking } = require('../database/init_arena_ranking');

async function run() {
  await query(`
    CREATE TABLE nguoi_dung(ma_nguoi_dung VARCHAR(50) PRIMARY KEY, xu_tri_thuc INT DEFAULT 0, tong_diem_kinh_nghiem INT DEFAULT 0, cap_nhat_luc TIMESTAMPTZ);
    CREATE TABLE mon_hoc(ma_mon VARCHAR(50) PRIMARY KEY);
    CREATE TABLE tran_dau_1v1(ma_tran VARCHAR(50) PRIMARY KEY, ma_mon VARCHAR(50), trang_thai TEXT, thoi_gian_ket_thuc TIMESTAMPTZ, nguoi_thang_cuoc TEXT, ly_do_ket_thuc TEXT);
    CREATE TABLE nguoi_choi_trong_tran(ma_nguoi_choi_trong_tran TEXT PRIMARY KEY,ma_tran TEXT,ma_nguoi_dung TEXT,mau_hien_tai INT,ket_qua TEXT,xu_nhan_duoc INT,exp_nhan_duoc INT);
    CREATE TABLE luot_tra_loi(ma_nguoi_choi_trong_tran TEXT);
    CREATE TABLE giao_dich_xu(ma_giao_dich TEXT PRIMARY KEY,ma_nguoi_dung TEXT,so_luong INT,so_du_sau INT,nguon_giao_dich TEXT,mo_ta TEXT,thoi_gian TIMESTAMPTZ);
    INSERT INTO nguoi_dung(ma_nguoi_dung,tong_diem_kinh_nghiem) VALUES ('a',800),('b',200),('usr_bot_test',0);
    INSERT INTO mon_hoc VALUES ('mon_csdl'),('mon_ctdl');
  `);
  await initArenaRanking();
  await require('../database/init_repeat_experience').initRepeatExperience();
  async function match(id, mode, course, opponent='b', participated=true) {
    await query("INSERT INTO tran_dau_1v1(ma_tran,che_do,ma_mon,trang_thai) VALUES($1,$2,$3,'DANG_THI_DAU')",[id,mode,course]);
    await query("INSERT INTO nguoi_choi_trong_tran VALUES($1,$2,'a',65,'CHUA_KET_THUC',0,0,0),($3,$2,$4,45,'CHUA_KET_THUC',0,0,0)",[id+'a',id,id+'b',opponent]);
    if(participated)await query('INSERT INTO luot_tra_loi VALUES($1),($2)',[id+'a',id+'b']);
  }
  const points = () => query("SELECT ma_mon,diem FROM diem_dau_hang WHERE ma_nguoi_dung='a' ORDER BY ma_mon");
  await match('casual','CASUAL','mon_csdl');
  await arena.concludeMatch('casual','a');
  assert.deepEqual(await points(),[]);
  assert.equal((await adapter.queryOne("SELECT tong_diem_kinh_nghiem FROM nguoi_dung WHERE ma_nguoi_dung='a'")).tong_diem_kinh_nghiem,835);
  await match('bot','PRACTICE','mon_csdl','usr_bot_test');
  await arena.concludeMatch('bot','a');
  assert.deepEqual(await points(),[]);
  await match('early','RANKED','mon_csdl','b',false);
  await arena.concludeMatch('early','a','DAU_HANG');
  assert.deepEqual(await points(),[]);
  await match('rank','RANKED','mon_csdl');
  await arena.concludeMatch('rank','a');
  await arena.concludeMatch('rank','a');
  assert.deepEqual(await points(),[{ma_mon:'mon_csdl',diem:30}]);
  assert.equal((await adapter.queryOne("SELECT tong_diem_kinh_nghiem FROM nguoi_dung WHERE ma_nguoi_dung='a'")).tong_diem_kinh_nghiem,945);
  await match('loss','RANKED','mon_csdl');
  await arena.concludeMatch('loss','b');
  await match('draw','RANKED','mon_ctdl');
  await arena.concludeMatch('draw',null,'DRAW');
  assert.deepEqual(await points(),[{ma_mon:'mon_csdl',diem:15},{ma_mon:'mon_ctdl',diem:0}]);
  await assert.rejects(arena.surrenderMatch('loss','outsider'),/không thuộc/);
  await query(`
    CREATE TABLE moc_bai_hoc(ma_moc TEXT PRIMARY KEY, ma_chuong TEXT, tieu_de TEXT, thu_tu INT, tong_so_buoc INT, xu_thuong INT, diem_thuong INT);
    CREATE TABLE chuong_hoc(ma_chuong TEXT PRIMARY KEY,ma_mon TEXT,thu_tu INT);
    CREATE TABLE tien_do_moc_bai_hoc(ma_tien_do_moc TEXT PRIMARY KEY,ma_nguoi_dung TEXT,ma_moc TEXT,trang_thai TEXT,buoc_hien_tai INT,cac_buoc_hoan_thanh TEXT,thoi_diem_hoan_thanh TIMESTAMPTZ,diem_dat_duoc INT,xu_da_nhan INT);
    CREATE TABLE tien_do_mon_hoc(ma_tien_do_mon TEXT PRIMARY KEY,ma_nguoi_dung TEXT,ma_mon TEXT,phan_tram_hoan_thanh REAL,ngay_bat_dau TIMESTAMPTZ,ngay_hoan_thanh TIMESTAMPTZ);
    INSERT INTO chuong_hoc VALUES ('ch1','mon_csdl',1);
    INSERT INTO moc_bai_hoc VALUES ('moc1','ch1','Mốc lý thuyết',1,1,10,15);
    INSERT INTO tien_do_moc_bai_hoc(ma_tien_do_moc,ma_nguoi_dung,ma_moc,trang_thai) VALUES ('progress1','a','moc1','DA_MO');
  `);
  const { completeTheoreticalCheckpoint } = require('../services/course.service');
  const first = await completeTheoreticalCheckpoint('moc1','a');
  const repeat = await completeTheoreticalCheckpoint('moc1','a');
  assert.equal(first.exp_nhan_duoc,15);
  assert.equal(repeat.exp_nhan_duoc,0);
  assert.equal(repeat.xu_nhan_duoc,0);
  assert.deepEqual(await points(),[{ma_mon:'mon_csdl',diem:15},{ma_mon:'mon_ctdl',diem:0}]);
  await query(`
    ALTER TABLE tran_dau_1v1 ADD COLUMN thoi_gian_bat_dau TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE nguoi_dung ADD COLUMN ten_dang_nhap TEXT;
    ALTER TABLE nguoi_dung ADD COLUMN ten_hien_thi TEXT;
    ALTER TABLE nguoi_dung ADD COLUMN khung_avatar TEXT;
    ALTER TABLE nguoi_choi_trong_tran ADD COLUMN ma_thu_cung TEXT;
    ALTER TABLE nguoi_choi_trong_tran ADD COLUMN mau_toi_da INT DEFAULT 100;
    ALTER TABLE nguoi_choi_trong_tran ADD COLUMN tong_sat_thuong_gay_ra INT DEFAULT 0;
    CREATE TABLE thu_cung(ma_thu_cung TEXT PRIMARY KEY, ten_thu_cung TEXT, he_so_sat_thuong REAL);
    CREATE TABLE cau_hoi(ma_cau_hoi TEXT PRIMARY KEY, noi_dung TEXT, loai_cau_hoi TEXT,
      dap_an_a TEXT, dap_an_b TEXT, dap_an_c TEXT, dap_an_d TEXT, vi_tri_dap_an_dung INT,
      du_lieu_cau_hoi JSONB, muc_bloom TEXT, do_kho INT, giai_thich TEXT);
    CREATE TABLE cau_hoi_trong_tran(ma_cau_trong_tran TEXT PRIMARY KEY, ma_tran TEXT, ma_cau_hoi TEXT, thu_tu_cau INT);
    ALTER TABLE luot_tra_loi ADD COLUMN ma_luot_tra_loi TEXT;
    ALTER TABLE luot_tra_loi ADD COLUMN ma_cau_trong_tran TEXT;
    ALTER TABLE luot_tra_loi ADD COLUMN vi_tri_dap_an_chon INT;
    ALTER TABLE luot_tra_loi ADD COLUMN la_dap_an_dung BOOLEAN;
    ALTER TABLE luot_tra_loi ADD COLUMN thoi_gian_tra_loi_giay REAL;
    ALTER TABLE luot_tra_loi ADD COLUMN sat_thuong_gay_ra INT;
    ALTER TABLE luot_tra_loi ADD COLUMN thoi_diem_tra_loi TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE luot_tra_loi ADD UNIQUE(ma_cau_trong_tran, ma_nguoi_choi_trong_tran);
    INSERT INTO cau_hoi VALUES ('q1','MCQ','TRAC_NGHIEM_4','A','B',NULL,NULL,1,NULL,'NHO',1,'secret'),
      ('q2','Pair','NOI_CAP',NULL,NULL,NULL,NULL,NULL,'{"pairs":[{"left":"L","right":"R"}]}','NHO',1,'secret');
    INSERT INTO cau_hoi_trong_tran VALUES ('qm1','live','q1',1),('qm2','live','q2',2);
  `);
  await match('live', 'RANKED', 'mon_csdl', 'b', false);
  const submit = (user, round, choice, payload) => arena.submitTurnAnswer({
    ma_tran: 'live', ma_nguoi_dung: user, thu_tu_cau: round, vi_tri_dap_an_chon: choice,
    cau_tra_loi: payload, thoi_gian_giay: -10000
  });
  await assert.rejects(submit('a', 2, 1), /chưa tới lượt/);
  const firstTurn = await submit('a', 1, 1);
  assert.equal(firstTurn.la_dap_an_dung, true);
  assert.doesNotMatch(JSON.stringify(firstTurn), /secret|vi_tri_dap_an_dung|vi_tri_dap_an_chon/);
  const replay = await submit('a', 1, 0);
  assert.equal(replay.replayed, true);
  assert.equal(replay.la_dap_an_dung, firstTurn.la_dap_an_dung);
  assert.equal(replay.sat_thuong_gay_ra, firstTurn.sat_thuong_gay_ra);
  await submit('b', 1, 0);
  const secondTurn = await submit('a', 2, 1, { matched_pairs: [{ left: 'L', right: 'R' }] });
  assert.equal(secondTurn.la_dap_an_dung, true);
  assert.equal((await submit('b', 2, -1)).tran_ket_thuc, true);
  await query(`
    ALTER TABLE mon_hoc ADD COLUMN ten_mon TEXT;
    ALTER TABLE mon_hoc ADD COLUMN slug TEXT;
    ALTER TABLE cau_hoi ADD COLUMN ma_moc TEXT;
    UPDATE cau_hoi SET ma_moc='moc1' WHERE ma_cau_hoi='q1';
    CREATE TABLE lich_su_phien_hoc(ma_phien TEXT PRIMARY KEY, ma_nguoi_dung TEXT, ma_moc TEXT,
      loai_phien TEXT, buoc_so INT, thoi_gian_tong_giay INT, ti_le_dung INT,
      toc_do_trung_binh_giay REAL, tong_so_lan_tra_cuu INT, chi_tiet_cau_hoi JSONB);
  `);
  const extreme = require('../services/extreme.service');
  const session = await extreme.startSession('mon_csdl', 'a');
  await assert.rejects(extreme.finishSession('a', { tong_diem: 999999 }), /hết hạn/);
  await assert.rejects(extreme.finishSession('b', session), /hết hạn/);
  await assert.rejects(extreme.gradeSession('a', session.session_id, 1, 'q1', 1), /không hợp lệ/);
  await assert.rejects(extreme.gradeSession('a', session.session_id, 0, 'q2', 1), /không hợp lệ/);
  const answer = await extreme.gradeSession('a', session.session_id, 0, 'q1', 1);
  assert.equal(answer.is_correct, true);
  assert.deepEqual(await extreme.gradeSession('a', session.session_id, 0, 'q1', 0), answer);
  const reward = await extreme.finishSession('a', { ...session, tong_diem: 999999 });
  assert.equal(reward.summary.total_answered, 1);
  assert.equal(reward.summary.total_score, 10);
  assert.equal(reward.earnedCoins, 5);
  assert.deepEqual(await extreme.finishSession('a', session), reward);
  assert.equal((await query("SELECT * FROM lich_su_phien_hoc")).length, 1);

  const { addExperienceInTransaction } = require('../services/economy.service');
  const award = (repeat) => adapter.transaction(tx => addExperienceInTransaction(tx, 'b', 999, { repeat }));
  assert.equal((await award(true)).expAwarded, 999);
  assert.ok((await award(true)).expAwarded < 501);
  assert.equal((await award(true)).expAwarded, 0);
  assert.equal((await award(false)).expAwarded, 999);
  await query("DELETE FROM exp_lap_lai WHERE ma_nguoi_dung='usr_bot_test'");
  const realNow = Date.now;
  try {
    for (let day = 2; day <= 7; day++) {
      Date.now = () => Date.UTC(2026, 10, day, 12);
      const result = await adapter.transaction(tx => addExperienceInTransaction(tx, 'usr_bot_test', 300, { repeat: true }));
      assert.equal(result.expAwarded, day === 7 ? 0 : 300);
    }
    Date.now = () => Date.UTC(2026, 10, 8, 17);
    const monday = await adapter.transaction(tx => addExperienceInTransaction(tx, 'usr_bot_test', 300, { repeat: true }));
    assert.equal(monday.expAwarded, 300);
  } finally {
    Date.now = realNow;
  }
  if (native) {
    await query("UPDATE nguoi_dung SET xu_tri_thuc=0 WHERE ma_nguoi_dung='a'");
    await query(`INSERT INTO tran_dau_1v1(ma_tran,che_do,ma_mon,trang_thai)
      VALUES('concurrent','RANKED','mon_csdl','DANG_THI_DAU')`);
    await query(`INSERT INTO nguoi_choi_trong_tran
      (ma_nguoi_choi_trong_tran,ma_tran,ma_nguoi_dung,mau_hien_tai,ket_qua,xu_nhan_duoc,exp_nhan_duoc)
      VALUES('ca','concurrent','a',70,'CHUA_KET_THUC',0,0),('cb','concurrent','b',30,'CHUA_KET_THUC',0,0)`);
    await query("INSERT INTO luot_tra_loi(ma_nguoi_choi_trong_tran) VALUES('ca'),('cb')");
    await Promise.all([
      arena.concludeMatch('concurrent', 'a'),
      arena.concludeMatch('concurrent', 'a')
    ]);
    assert.equal((await adapter.queryOne("SELECT xu_tri_thuc FROM nguoi_dung WHERE ma_nguoi_dung='a'")).xu_tri_thuc, 50);
    console.log('PASS independent PostgreSQL connections settle the same match once');
  }
  if (native || pg) {
    const { arenaSeasonAt, syncArenaSeason } = require('../services/arena-season.service');
    const first = arenaSeasonAt(Date.parse('2026-11-09T00:00:00+07:00'));
    assert.equal(Date.parse(first.endsAt) - Date.parse(first.startsAt), 56 * 86400000);
    assert.equal(arenaSeasonAt(Date.parse(first.endsAt) - 1).number, 1);
    assert.equal(arenaSeasonAt(Date.parse(first.endsAt)).number, 2);
    await query("ALTER TABLE nguoi_dung ADD COLUMN vai_tro TEXT DEFAULT 'HOC_VIEN'");
    await query("UPDATE tran_dau_1v1 SET thoi_gian_ket_thuc=$1 WHERE ma_tran='rank'", ['2026-11-20T00:00:00Z']);
    const pointsBefore = await points();
    const coins = async () => (await adapter.queryOne("SELECT xu_tri_thuc FROM nguoi_dung WHERE ma_nguoi_dung='a'")).xu_tri_thuc;
    const before = await coins();
    const close = () => adapter.transaction(tx => syncArenaSeason(tx, Date.parse(first.endsAt)));
    await close();
    await close();
    const saved = await adapter.queryOne("SELECT diem,vi_tri,xu_thuong FROM lich_su_mua_dau_hang WHERE mua=1 AND ma_nguoi_dung='a'");
    assert.equal(saved.diem, pointsBefore.reduce((total, row) => total + row.diem, 0));
    assert.equal(saved.xu_thuong, 150);
    assert.equal(await coins(), before + 150);
    assert.deepEqual(await points(), pointsBefore.map(row => ({...row, diem: Math.floor(row.diem / 2)})));
    console.log('PASS 56-day season boundary, archive, top award once and 50% carryover');
  }
  console.log('PASS ranked/casual/practice, per-course points, replay settlement, draw, early surrender unauthorized surrender theory replay, live grading, turn order, Extreme and repeat XP caps');
}
run().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>pg ? pg.close() : pool.end());

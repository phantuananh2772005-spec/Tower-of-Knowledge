const assert=require('assert');
const db=require('../database/db');
const auth=require('../services/auth.service');
const arena=require('../services/arena.service');
const economy=require('../services/economy.service');
async function main(){
  assert(db.isPostgres&&new URL(process.env.DATABASE_URL).hostname==='127.0.0.1','Disposable local PostgreSQL only');
  const ids=[];let matchId;
  const originalTransaction=db.transaction;
  try{
    for(let i=0;i<2;i++){
      const r=await auth.register({ten_dang_nhap:'codex_atomic_'+Date.now()+'_'+i,mat_khau:'AtomicTest123!',ten_hien_thi:'Kiểm thử nguyên tử'});
      ids.push(r.nguoi_dung.ma_nguoi_dung);
    }
    const [first,second]=ids;
    const user=await db.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung=$1',[first]);
    await Promise.all(Array.from({length:8},()=>auth.issueSession(user,'2026-10-27T08:00:00Z')));
    const after=await db.queryOne('SELECT chuoi_streak_ngay,ngay_hoat_dong_cuoi,xu_tri_thuc FROM nguoi_dung WHERE ma_nguoi_dung=$1',[first]);
    assert.equal(after.chuoi_streak_ngay,1);assert.equal(after.ngay_hoat_dong_cuoi,'2026-10-27');assert.equal(after.xu_tri_thuc,5);
    const rewards=await db.queryOne("SELECT COUNT(*) AS n FROM giao_dich_xu WHERE ma_nguoi_dung=$1 AND nguon_giao_dich='THUONG_STREAK'",[first]);assert.equal(Number(rewards.n),1);
    await assert.rejects(db.transaction(async tx=>{await economy.mutateCoinsInTransaction(tx,first,20,'THUONG_STREAK','rollback fixture');throw Error('rollback fixture');}),/rollback fixture/);
    assert.equal((await db.queryOne('SELECT xu_tri_thuc FROM nguoi_dung WHERE ma_nguoi_dung=$1',[first])).xu_tri_thuc,5);
    const beforeCount=Number((await db.queryOne('SELECT COUNT(*) AS n FROM tran_dau_1v1')).n);
    const missing='codex_missing_'+Date.now();
    await assert.rejects(arena.createMatch(first,missing),/không tồn tại/);
    assert.equal(await db.queryOne('SELECT ma_nguoi_dung FROM nguoi_dung WHERE ma_nguoi_dung=$1',[missing]),null);
    await assert.rejects(arena.createMatch(first,first),/khác nhau/);
    db.transaction=fn=>originalTransaction(async tx=>fn({...tx,execute:async(sql,params)=>{
      if(sql.includes('INSERT INTO cau_hoi_trong_tran'))throw Error('simulated question insert failure');
      return tx.execute(sql,params);
    }}));
    await assert.rejects(arena.createMatch(first,second),/simulated question insert failure/);
    db.transaction=originalTransaction;
    assert.equal(Number((await db.queryOne('SELECT COUNT(*) AS n FROM tran_dau_1v1')).n),beforeCount);
    assert.equal(Number((await db.queryOne('SELECT COUNT(*) AS n FROM nguoi_choi_trong_tran WHERE ma_nguoi_dung=$1 OR ma_nguoi_dung=$2',ids)).n),0);
    const match=await arena.createMatch(first,second);matchId=match.ma_tran;
    assert(matchId);assert.equal(match.nguoi_choi.length,2);
    console.log('PASS: concurrent same-day login rewards once; economy rolls back; invalid players rejected; failed match creation leaves no partial rows; normal match still creates.');
  }finally{
    db.transaction=originalTransaction;
    if(matchId){await db.execute('DELETE FROM cau_hoi_trong_tran WHERE ma_tran=$1',[matchId]);await db.execute('DELETE FROM nguoi_choi_trong_tran WHERE ma_tran=$1',[matchId]);await db.execute('DELETE FROM tran_dau_1v1 WHERE ma_tran=$1',[matchId]);}
    for(const id of ids)await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung=$1',[id]);
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});

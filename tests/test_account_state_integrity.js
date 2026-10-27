const assert=require('assert');
const fs=require('fs');
const path=require('path');
const db=require('../database/db');

async function useMemoryPostgres(){
  const {newDb}=require('pg-mem');const memory=newDb();
  // pg-mem 2.x incorrectly uses a partial index for queries that do not match its predicate.
  // The real PostgreSQL schema keeps this constraint; emulate it with the assertions below.
  const schema=fs.readFileSync(path.join(__dirname,'../database/migrations/001_postgres_initial_schema.sql'),'utf8')
    .replace(/CREATE UNIQUE INDEX uq_nguoi_dung_pet_active[\s\S]*?;/,'');
  memory.public.none(schema);
  memory.public.none(`ALTER TABLE nguoi_dung ADD chuoi_thang_arena INT DEFAULT 0; ALTER TABLE nguoi_dung ADD chuoi_thang_cao_nhat_arena INT DEFAULT 0;
    ALTER TABLE nguoi_dung ADD cai_dat_am_thanh TEXT; ALTER TABLE nguoi_dung ADD tien_do_huong_dan TEXT;
    ALTER TABLE nguoi_dung ADD co_mat_khau BOOLEAN DEFAULT TRUE;
    ALTER TABLE nguoi_dung ADD google_sub VARCHAR(255);
    ALTER TABLE nguoi_dung ADD google_email VARCHAR(255);
    CREATE TABLE lich_su_phien_hoc (ma_phien VARCHAR(50) PRIMARY KEY,ma_nguoi_dung VARCHAR(50),tao_luc TIMESTAMPTZ DEFAULT NOW());`);
  const {Pool}=memory.adapters.createPg();const pool=new Pool();
  db.isPostgres=true;
  db.query=async(sql,params=[]) => (await pool.query(db.adaptForPostgres(sql),params)).rows;
  db.queryOne=async(sql,params=[]) => (await db.query(sql,params))[0]||null;
  db.execute=async(sql,params=[])=>pool.query(db.adaptForPostgres(sql),params);
  db.transaction=async(fn)=>{const backup=memory.backup();try{return await fn(db);}catch(error){backup.restore();throw error;}};
  return pool;
}
async function run(){
  let pool,id;
  if(process.argv.includes('--postgres-memory'))pool=await useMemoryPostgres();
  const auth=require('../services/auth.service'),pets=require('../services/pet.service'),quests=require('../services/quest.service');
  const levels=require('../core/rules/economy.rules');
  await require('../database/sync_pet_catalog').syncPetCatalog();
  if(!pool){await require('../database/init_user_preferences').initUserPreferences();await require('../database/init_identity').initIdentity();}
  try{
    for(const [exp,level] of [[0,1],[99,1],[100,2],[499,2],[500,3],[1500,4],[3500,5],[7000,6]])assert.strictEqual(levels.levelProgress(exp).level,level);
    assert.strictEqual(levels.levelProgress(100).percent,0);
    assert.strictEqual(quests.dayBounds(new Date('2026-10-27T18:00:00Z')).start.toISOString(),'2026-10-27T17:00:00.000Z');
    const username='codex_state_'+Date.now();const reg=await auth.register({ten_dang_nhap:username,mat_khau:'TestState123!',ten_hien_thi:'Kiểm thử trạng thái'});id=reg.nguoi_dung.ma_nguoi_dung;
    await db.execute('UPDATE nguoi_dung SET xu_tri_thuc = $1 WHERE ma_nguoi_dung = $2',[1000,id]);
    const catalog=await pets.listPets(id);assert.strictEqual(catalog.length,14);assert.strictEqual(catalog.filter(p=>p.da_so_huu).length,1);
    for(const pet of catalog)assert(fs.existsSync(path.join(__dirname,'../public',pet.anh_dai_dien)),pet.anh_dai_dien);
    await assert.rejects(pets.equipPet('admin_aurum',id),/Quản trị viên/);
    await assert.rejects(pets.buyPet('stone_golem',id),/Cấp 2/);
    await Promise.all([pets.buyPet('pyra_phoenix',id),pets.buyPet('pyra_phoenix',id)]);
    assert.strictEqual((await auth.getCurrentUser(id)).xu_tri_thuc,700,'Concurrent duplicate purchase charged twice');
    await pets.equipPet('pyra_phoenix',id);
    assert.strictEqual((await auth.getCurrentUser(id)).thu_cung_dang_dung.frontend_id,'pyra_phoenix');
    const active=await db.query('SELECT ma_thu_cung FROM thu_cung_so_huu WHERE ma_nguoi_dung = $1 AND dang_kich_hoat = $2',[id,true]);assert.strictEqual(active.length,1);
    await assert.rejects(quests.award(id,'hoc_tap'),/hoàn thành/);
    await quests.carePet(id,'pet');assert((await quests.getStatus(id)).progress.cham_pet);
    const rewards=await Promise.all([quests.award(id,'cham_pet'),quests.award(id,'cham_pet')]);assert.strictEqual(rewards.filter(r=>!r.alreadyClaimed).length,1);
    const gifts=await Promise.all([quests.award(id,'onboarding'),quests.award(id,'onboarding')]);assert.strictEqual(gifts.filter(r=>!r.alreadyClaimed).length,1);
    const rewarded=await auth.getCurrentUser(id);assert.strictEqual(rewarded.xu_tri_thuc,730);assert.strictEqual(rewarded.tong_diem_kinh_nghiem,45);
    await auth.updateSettings(id,{che_do_giao_dien:'SANG',cai_dat_am_thanh:{quiz:false,reward:true,battle:false,outcome:false,bgm:false},tien_do_huong_dan:{step:'pet-current',layout:'mobile',completed:false,context:{view:'pet'}}});
    const restored=await auth.getCurrentUser(id);assert.strictEqual(restored.che_do_giao_dien,'SANG');assert.strictEqual(restored.cai_dat_am_thanh.quiz,false);assert.strictEqual(restored.tien_do_huong_dan.step,'pet-current');
    const renamed=await auth.updateAccount(id,{ten_hien_thi:'Tên đã lưu',ten_dang_nhap:username+'_new'});assert.strictEqual(renamed.nguoi_dung.ten_hien_thi,'Tên đã lưu');
    await assert.rejects(auth.changePassword(id,{mat_khau_hien_tai:'wrong',mat_khau_moi:'NewState123!'}),/không chính xác/);
    await auth.changePassword(id,{mat_khau_hien_tai:'TestState123!',mat_khau_moi:'NewState123!'});
    await assert.rejects(auth.login({ten_dang_nhap:username+'_new',mat_khau:'TestState123!'}),/không chính xác/);
    assert((await auth.login({ten_dang_nhap:username+'_new',mat_khau:'NewState123!'})).token);
    console.log('PASS: levels, full pet catalog, purchase/equipment persistence, role checks, verified quests, concurrent reward idempotency, settings, profile and password ('+(pool?'PostgreSQL SQL via pg-mem':db.isPostgres?'real PostgreSQL':'local MSSQL')+').');
  }finally{
    if(id){await db.execute('DELETE FROM lich_su_phien_hoc WHERE ma_nguoi_dung = $1',[id]);await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung = $1',[id]);}
    if(pool)await pool.end();
  }
}
run().catch(error=>{console.error(error);process.exitCode=1;});

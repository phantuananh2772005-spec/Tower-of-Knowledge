const crypto = require('crypto');
const db = require('../database/db');
const { withUserLock } = require('./economy.service');
const { levelProgress } = require('../core/rules/economy.rules');
const QUESTS = {hoc_tap:{coins:15,exp:25},dau_truong:{coins:15,exp:25},cham_pet:{coins:10,exp:15}};

function dayBounds(now = new Date()) {
  const today = new Date(now.getTime()+7*3600000).toISOString().slice(0,10);
  const start = new Date(today+'T00:00:00+07:00');
  return {today,start,end:new Date(start.getTime()+86400000)};
}
async function getStatus(userId, tx=db, now=new Date()) {
  const {today,start,end}=dayBounds(now);
  const rows=await tx.query('SELECT nguon_giao_dich,mo_ta FROM giao_dich_xu WHERE ma_nguoi_dung = $1 AND thoi_gian >= $2 AND thoi_gian < $3',[userId,start,end]);
  const study=await tx.queryOne('SELECT TOP 1 ma_phien FROM lich_su_phien_hoc WHERE ma_nguoi_dung = $1 AND tao_luc >= $2 AND tao_luc < $3',[userId,start,end]);
  const battle=await tx.queryOne(`SELECT TOP 1 p.ma_tran FROM nguoi_choi_trong_tran p JOIN tran_dau_1v1 t ON t.ma_tran = p.ma_tran
    WHERE p.ma_nguoi_dung = $1 AND t.thoi_gian_ket_thuc >= $2 AND t.thoi_gian_ket_thuc < $3`,[userId,start,end]);
  const claimed={};
  for(const row of rows.filter(r=>r.nguon_giao_dich==='NHIEM_VU_NGAY')) for(const id of Object.keys(QUESTS)) if((row.mo_ta||'').includes('['+id+']')) claimed[id]=true;
  const onboarding=await tx.queryOne("SELECT TOP 1 ma_giao_dich FROM giao_dich_xu WHERE ma_nguoi_dung = $1 AND nguon_giao_dich = 'THUONG_TAN_THU'",[userId]);
  return {today,claimed,onboardingClaimed:Boolean(onboarding),progress:{
    hoc_tap:Boolean(study||claimed.hoc_tap),
    dau_truong:Boolean(battle||claimed.dau_truong||rows.some(r=>r.nguon_giao_dich==='THI_DAU_CUC_HAN')),
    cham_pet:Boolean(claimed.cham_pet||rows.some(r=>r.nguon_giao_dich==='CHAM_SOC_PET'))
  }};
}
async function award(userId,questId) {
  const onboarding=questId==='onboarding';
  const quest=onboarding?{coins:20,exp:30}:QUESTS[questId];
  if(!quest) throw new Error('Mã nhiệm vụ không hợp lệ.');
  return withUserLock(userId,()=>db.transaction(async tx=>{
    const user=await tx.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = $1'+(db.isPostgres?' FOR UPDATE':''),[userId]);
    if(!user)throw new Error('Người dùng không tồn tại.');
    const status=await getStatus(userId,tx);
    if(onboarding?status.onboardingClaimed:status.claimed[questId])return {alreadyClaimed:true};
    if(!onboarding&&!status.progress[questId])throw new Error('Bạn cần hoàn thành nhiệm vụ trước khi nhận thưởng.');
    await tx.execute('UPDATE nguoi_dung SET xu_tri_thuc = xu_tri_thuc + $1, tong_diem_kinh_nghiem = tong_diem_kinh_nghiem + $2, cap_nhat_luc = SYSDATETIME() WHERE ma_nguoi_dung = $3',[quest.coins,quest.exp,userId]);
    await tx.execute(`INSERT INTO giao_dich_xu (ma_giao_dich,ma_nguoi_dung,so_luong,so_du_sau,nguon_giao_dich,mo_ta,thoi_gian)
      VALUES ($1,$2,$3,$4,$5,$6,$7)`,[crypto.randomUUID(),userId,quest.coins,user.xu_tri_thuc+quest.coins,onboarding?'THUONG_TAN_THU':'NHIEM_VU_NGAY',onboarding?'Quà tân thủ':`Thưởng nhiệm vụ [${questId}]`,new Date()]);
    const progress=levelProgress(user.tong_diem_kinh_nghiem+quest.exp);
    return {alreadyClaimed:false,questId,coinsAwarded:quest.coins,expAwarded:quest.exp,newCoins:user.xu_tri_thuc+quest.coins,newExp:progress.totalExp,newLevel:progress.level,newRank:progress.title};
  }));
}
async function carePet(userId,action) {
  if(!['feed','pet'].includes(action))throw new Error('Thao tác chăm sóc không hợp lệ.');
  return withUserLock(userId,()=>db.transaction(async tx=>{
    const user=await tx.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = $1'+(db.isPostgres?' FOR UPDATE':''),[userId]);
    if(!user)throw new Error('Người dùng không tồn tại.');
    const cost=action==='feed'?10:0;
    if(user.xu_tri_thuc<cost)throw new Error('Bạn cần 10 Xu để cho Pet ăn.');
    if(cost)await tx.execute('UPDATE nguoi_dung SET xu_tri_thuc = xu_tri_thuc + $1 WHERE ma_nguoi_dung = $2',[-cost,userId]);
    await tx.execute(`INSERT INTO giao_dich_xu (ma_giao_dich,ma_nguoi_dung,so_luong,so_du_sau,nguon_giao_dich,mo_ta,thoi_gian)
      VALUES ($1,$2,$3,$4,$5,$6,$7)`,[crypto.randomUUID(),userId,-cost,user.xu_tri_thuc-cost,'CHAM_SOC_PET',action==='feed'?'Cho Pet ăn':'Vuốt ve Pet',new Date()]);
    return {newCoins:user.xu_tri_thuc-cost,action};
  }));
}
module.exports={getStatus,award,carePet,dayBounds};

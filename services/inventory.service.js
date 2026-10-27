const crypto=require('crypto');
const db=require('../database/db');
const catalog=require('../config/accessories.json');
const {withUserLock}=require('./economy.service');
const itemFor=id=>catalog.find(item=>item.id===id)||null;
async function listItems(userId){
  const user=await db.queryOne('SELECT phu_kien_dang_dung FROM nguoi_dung WHERE ma_nguoi_dung = $1',[userId]);
  const owned=await db.query('SELECT ma_vat_pham FROM vat_pham_so_huu WHERE ma_nguoi_dung = $1',[userId]);
  return catalog.map(item=>({...item,owned:owned.some(o=>o.ma_vat_pham===item.id),equipped:user?.phu_kien_dang_dung===item.id}));
}
async function purchaseItem(userId,itemId){
  const item=itemFor(itemId);if(!item)throw new Error('Không tìm thấy phụ kiện.');
  return withUserLock(userId,()=>db.transaction(async tx=>{
    const user=await tx.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = $1'+(db.isPostgres?' FOR UPDATE':''),[userId]);
    if(!user)throw new Error('Người dùng không tồn tại.');
    const existing=await tx.queryOne('SELECT ma_so_huu FROM vat_pham_so_huu WHERE ma_nguoi_dung = $1 AND ma_vat_pham = $2',[userId,itemId]);
    if(existing)return {alreadyOwned:true,newCoins:user.xu_tri_thuc};
    if(user.xu_tri_thuc<item.price)throw new Error(`Bạn cần thêm ${item.price-user.xu_tri_thuc} Xu để mở khóa phụ kiện này.`);
    await tx.execute('UPDATE nguoi_dung SET xu_tri_thuc = xu_tri_thuc + $1, cap_nhat_luc = SYSDATETIME() WHERE ma_nguoi_dung = $2',[-item.price,userId]);
    await tx.execute(`INSERT INTO giao_dich_xu (ma_giao_dich,ma_nguoi_dung,so_luong,so_du_sau,nguon_giao_dich,mo_ta)
      VALUES ($1,$2,$3,$4,$5,$6)`,[crypto.randomUUID(),userId,-item.price,user.xu_tri_thuc-item.price,'MUA_PHU_KIEN',`Mua phụ kiện: ${item.name}`]);
    await tx.execute('INSERT INTO vat_pham_so_huu (ma_so_huu,ma_nguoi_dung,ma_vat_pham) VALUES ($1,$2,$3)',[crypto.randomUUID(),userId,itemId]);
    return {alreadyOwned:false,newCoins:user.xu_tri_thuc-item.price};
  }));
}
async function equipItem(userId,itemId){
  if(itemId!==null&&!itemFor(itemId))throw new Error('Không tìm thấy phụ kiện.');
  return withUserLock(userId,()=>db.transaction(async tx=>{
    const user=await tx.queryOne('SELECT ma_nguoi_dung FROM nguoi_dung WHERE ma_nguoi_dung = $1'+(db.isPostgres?' FOR UPDATE':''),[userId]);
    if(!user)throw new Error('Người dùng không tồn tại.');
    if(itemId){const owned=await tx.queryOne('SELECT ma_so_huu FROM vat_pham_so_huu WHERE ma_nguoi_dung = $1 AND ma_vat_pham = $2',[userId,itemId]);
      if(!owned)throw new Error('Bạn chưa sở hữu phụ kiện này.');}
    await tx.execute('UPDATE nguoi_dung SET phu_kien_dang_dung = $1, cap_nhat_luc = SYSDATETIME() WHERE ma_nguoi_dung = $2',[itemId,userId]);
    return {equipped:itemFor(itemId)};
  }));
}
module.exports={itemFor,listItems,purchaseItem,equipItem};

const assert=require('assert');
const crypto=require('crypto');
const db=require('../database/db');
const auth=require('../services/auth.service');
const inventory=require('../services/inventory.service');
const googleModule=require('../services/google-identity.service');
async function main(){
  await require('../database/init_identity').initIdentity();
  await require('../database/init_password_recovery').initPasswordRecovery();
  await require('../database/init_inventory').initInventory();
  const ids=[],stamp=Date.now(),originalClientId=process.env.GOOGLE_CLIENT_ID;
  const payloads=new Map();
  const google=googleModule.createGoogleIdentity({verifyIdToken:async credential=>{if(!payloads.has(credential))throw Error('invalid signature');return payloads.get(credential);}});
  process.env.GOOGLE_CLIENT_ID='test.apps.googleusercontent.com';
  function proof(sub,email,mode='login',userId=null,extra={}){
    const challenge=google.challenge(mode,userId),credential=crypto.randomUUID();
    payloads.set(credential,{sub,email,email_verified:true,name:'Google test',nonce:challenge.nonce,...extra});
    return {body:{credential,csrf:challenge.csrf},cookie:challenge.cookie};
  }
  try{
    const reg=await auth.register({ten_dang_nhap:'codex_inventory_'+stamp,mat_khau:'TestItems123!',ten_hien_thi:'Inventory test'});const userId=reg.nguoi_dung.ma_nguoi_dung;ids.push(userId);
    await db.execute('UPDATE nguoi_dung SET xu_tri_thuc = $1 WHERE ma_nguoi_dung = $2',[300,userId]);
    await assert.rejects(inventory.equipItem(userId,'mini_crown'),/chưa sở hữu/);
    const bought=await Promise.all([inventory.purchaseItem(userId,'graduation_cap'),inventory.purchaseItem(userId,'graduation_cap')]);assert.strictEqual(bought.filter(x=>!x.alreadyOwned).length,1);
    assert.strictEqual((await auth.getCurrentUser(userId)).xu_tri_thuc,250);
    await inventory.equipItem(userId,'graduation_cap');assert.strictEqual((await auth.getCurrentUser(userId)).phu_kien_dang_dung.id,'graduation_cap');
    assert.strictEqual((await inventory.listItems(userId)).filter(item=>item.owned).length,1);
    await inventory.equipItem(userId,null);assert.strictEqual((await auth.getCurrentUser(userId)).phu_kien_dang_dung,null);
    const other=await auth.register({ten_dang_nhap:'codex_identity_'+stamp,mat_khau:'TestItems123!',ten_hien_thi:'Other user'});const otherId=other.nguoi_dung.ma_nguoi_dung;ids.push(otherId);
    assert(!(await inventory.listItems(otherId)).some(item=>item.owned));

    const badNonce=proof('sub_bad_'+stamp,`bad_${stamp}@gmail.com`,'login',null,{nonce:'wrong'});
    await assert.rejects(google.signIn(badNonce.body,badNonce.cookie),/không khớp/);
    const unverified=proof('sub_unverified_'+stamp,`unverified_${stamp}@gmail.com`,'login',null,{email_verified:false});
    await assert.rejects(google.signIn(unverified.body,unverified.cookie),/chưa được xác minh/);
    const first=proof('sub_first_'+stamp,`first_${stamp}@gmail.com`);await assert.rejects(google.signIn({...first.body,csrf:'wrong'},first.cookie),/không khớp/);
    const firstLogin=await google.signIn(first.body,first.cookie);const firstId=firstLogin.nguoi_dung.ma_nguoi_dung;ids.push(firstId);
    assert(firstLogin.nguoi_dung.google_lien_ket);assert.strictEqual(firstLogin.nguoi_dung.co_mat_khau,false);
    const second=proof('sub_second_'+stamp,`second_${stamp}@gmail.com`),secondLogin=await google.signIn(second.body,second.cookie);ids.push(secondLogin.nguoi_dung.ma_nguoi_dung);
    assert.notStrictEqual(firstId,secondLogin.nguoi_dung.ma_nguoi_dung,'Different Google users share an account');
    const again=proof('sub_first_'+stamp,`first_${stamp}@gmail.com`);assert.strictEqual((await google.signIn(again.body,again.cookie)).nguoi_dung.ma_nguoi_dung,firstId);
    await assert.rejects(google.unlink(firstId),/tạo mật khẩu/);
    await assert.rejects(auth.changePassword(firstId,{mat_khau_moi:'NewGoogle123!'},Math.floor(Date.now()/1000)-1000),/đăng nhập lại/);
    await auth.changePassword(firstId,{mat_khau_moi:'NewGoogle123!'},Math.floor(Date.now()/1000));
    await google.unlink(firstId);assert(!(await auth.getCurrentUser(firstId)).google_lien_ket);

    const collision=proof('sub_collision_'+stamp,reg.nguoi_dung.email);await assert.rejects(google.signIn(collision.body,collision.cookie),/đã có tài khoản/);
    const linked=proof('sub_linked_'+stamp,`linked_${stamp}@gmail.com`,'link',userId);assert((await google.link(userId,linked.body,linked.cookie)).google_lien_ket);
    await assert.rejects(google.link(otherId,linked.body,linked.cookie),/không khớp/);
    const duplicateLink=proof('sub_linked_'+stamp,`linked_${stamp}@gmail.com`,'link',otherId);await assert.rejects(google.link(otherId,duplicateLink.body,duplicateLink.cookie),/người dùng khác/);
    await google.unlink(userId);assert(!(await auth.getCurrentUser(userId)).google_lien_ket);
    const invalid=googleModule.challenge();await assert.rejects(googleModule.signIn({credential:'not-a-google-token',csrf:invalid.csrf},invalid.cookie),/Không xác minh/);
    delete process.env.GOOGLE_CLIENT_ID;assert.throws(()=>google.challenge(),/chưa được cấu hình/);
    console.log('PASS: inventory purchases/equipment persist and remain isolated; verified Google identities separate, CSRF/nonce/unverified/forged token rejected, collisions/linking/password/unlink constraints enforced.');
  }finally{
    if(originalClientId===undefined)delete process.env.GOOGLE_CLIENT_ID;else process.env.GOOGLE_CLIENT_ID=originalClientId;
    for(const id of ids)await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung = $1',[id]);
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});

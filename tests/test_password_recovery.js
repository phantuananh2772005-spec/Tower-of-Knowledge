const assert = require('node:assert/strict');
const db = require('../database/db');
const auth = require('../services/auth.service');
const jwt = require('jsonwebtoken');
const { assertCurrentSession } = require('../services/session-validity.service');
const { createRecoveryService } = require('../services/password-recovery.service');
async function main() {
  assert(db.isPostgres && /127\.0\.0\.1:55432\/tok_test/.test(process.env.DATABASE_URL), 'Disposable local PostgreSQL only');
  process.env.PASSWORD_RECOVERY_SECRET='test-recovery-secret-only';
  await require('../database/init_identity').initIdentity();
  await require('../database/init_password_recovery').initPasswordRecovery();
  await require('../database/init_password_recovery').initPasswordRecovery();
  let clock=Date.now(), fail=false;
  const sent=[], ids=[];
  const transport={configured:()=>true,sendCode:async(email,code)=>{if(fail)throw Error('MAIL_DELIVERY_FAILED');sent.push({email,code});}};
  const recovery=createRecoveryService({transport,now:()=>clock});
  const email=`recovery_${clock}@gmail.com`, password='NewPassword123!';
  const request=()=>recovery.request({email});
  const reset=code=>recovery.reset({email,code,password});
  try {
    const reg=await auth.register({ten_dang_nhap:'recovery_'+clock,email,mat_khau:'OldPassword123!'});
    const id=reg.nguoi_dung.ma_nguoi_dung;ids.push(id);
    await assert.rejects(require('../services/password-recovery.service').lookup({username:reg.nguoi_dung.ten_dang_nhap}),/không tồn tại hoặc chưa liên kết/);
    const generic=await request(); assert.equal(sent.length,0,'Unlinked registration email must not receive a code');
    assert.deepEqual(await recovery.request({email:'missing@gmail.com'}),generic);
    await db.execute('UPDATE nguoi_dung SET google_sub=$1,google_email=$2 WHERE ma_nguoi_dung=$3',['recovery_sub_'+clock,email,id]);
    await Promise.all([request(),request(),request()]);assert.equal(sent.length,1,'Concurrent sends respect persisted cooldown');
    assert.deepEqual(await request(),generic);
    const code1=sent.at(-1).code;
    assert.match(code1,/^\d{6}$/);
    const record=await db.queryOne('SELECT * FROM password_recovery WHERE user_id=$1',[id]);
    assert(!JSON.stringify(record).includes(code1),'Plain code is not persisted');
    const wrong=code1==='000000'?'999999':'000000';
    for(let i=0;i<5;i++)await assert.rejects(reset(wrong),/Mã không đúng/);
    await assert.rejects(reset(code1),/Mã không đúng/);
    clock+=61000;await request();const code2=sent.at(-1).code;
    clock+=600001;await assert.rejects(reset(code2),/Mã không đúng/);
    await request();const validBeforeFailure=sent.at(-1).code;
    clock+=61000;fail=true;await assert.rejects(request(),/MAIL_DELIVERY_FAILED/);fail=false;
    assert.equal((await db.queryOne('SELECT attempts FROM password_recovery WHERE user_id=$1',[id])).attempts,0);
    const outcomes=await Promise.allSettled([reset(validBeforeFailure),reset(validBeforeFailure)]);
    assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1,'Atomic single-use redemption');
    await assert.rejects(assertCurrentSession(jwt.decode(reg.token)),/SESSION_REVOKED/);
    await assert.rejects(auth.login({ten_dang_nhap:reg.nguoi_dung.ten_dang_nhap,mat_khau:'OldPassword123!'}));
    const login=await auth.login({ten_dang_nhap:reg.nguoi_dung.ten_dang_nhap,mat_khau:password});
    await assertCurrentSession(jwt.decode(login.token));
    clock+=61000;await request();const changedLinkCode=sent.at(-1).code;
    await db.execute('UPDATE nguoi_dung SET google_sub=$1 WHERE ma_nguoi_dung=$2',['changed_sub_'+clock,id]);
    await assert.rejects(reset(changedLinkCode),/Mã không đúng/);
    await assert.rejects(recovery.googleProof({sub:'unknown-sub',email}),/chưa.*liên kết/);
    await assert.rejects(recovery.googleProof({sub:'changed_sub_'+clock,email:'different@gmail.com'}),/chưa.*liên kết/);
    const verified=await recovery.googleProof({sub:'changed_sub_'+clock,email});
    assert.equal(verified.email,email);
    assert.match(verified.recoveryToken,/^[A-Za-z0-9_-]{43}$/);
    await recovery.reset({email,recovery_token:verified.recoveryToken,password:'GoogleRecovery123!'});
    await assert.rejects(recovery.reset({email,recovery_token:verified.recoveryToken,password}),/Mã không đúng/);
    await assert.rejects(assertCurrentSession(jwt.decode(login.token)),/SESSION_REVOKED/);
    process.env.GOOGLE_CLIENT_ID='recovery-test.apps.googleusercontent.com';
    const google=require('../services/google-identity.service').createGoogleIdentity({verifyIdToken:async credential=>JSON.parse(credential)});
    const challenge=google.challenge('recover');
    const lookup=await require('../services/password-recovery.service').lookup({username:reg.nguoi_dung.ten_dang_nhap});
    assert(!lookup.maskedEmail.includes(email.split('@')[0]));
    await assert.rejects(require('../services/password-recovery.service').lookup({username:'missing_account'}),/không tồn tại hoặc chưa liên kết/);
    await assert.rejects(recovery.googleProof({sub:'changed_sub_'+clock,email},{userId:'other-user',version:0}),/Google không khớp/);
    const body={lookupToken:lookup.lookupToken,csrf:challenge.csrf,credential:JSON.stringify({sub:'changed_sub_'+clock,email,email_verified:true,nonce:challenge.nonce})};
    const actualProof=await google.recover(body,challenge.cookie);
    assert.match(actualProof.recoveryToken,/^[A-Za-z0-9_-]{43}$/);
    await assert.rejects(google.signIn(body,challenge.cookie),/không khớp/);
    await assert.rejects(google.recover({...body,csrf:'wrong'},challenge.cookie),/không khớp/);
    await assert.rejects(google.recover({...body,lookupToken:'forged'},challenge.cookie),/Phiên tìm tài khoản/);
    await assert.rejects(google.recover({...body,credential:JSON.stringify({sub:'changed_sub_'+clock,email,email_verified:false,nonce:challenge.nonce})},challenge.cookie),/chưa được xác minh/);
    await require('../services/password-recovery.service').reset({email,recovery_token:actualProof.recoveryToken,password:'GoogleRecovery456!'});
    const staleProof=await recovery.googleProof({sub:'changed_sub_'+clock,email});
    await auth.changePassword(id,{mat_khau_hien_tai:'GoogleRecovery456!',mat_khau_moi:'ChangedNormally123!'});
    await assert.rejects(recovery.reset({email,recovery_token:staleProof.recoveryToken,password}),/Mã không đúng/);
    await assert.rejects(auth.changePassword(id,{mat_khau_hien_tai:'ChangedNormally123!',mat_khau_moi:'ậ'.repeat(25)}),/72 byte/);
    await assert.rejects(createRecoveryService({transport:{configured:()=>false}}).request({email}),/chưa được cấu hình/);
    console.log('PASS: registered + verified link gating, cooldown/concurrency, hashed codes, five-attempt lockout, expiration, mail failure rollback, single-use reset, old session revocation, new login, changed-link rejection, unavailable mail; free Google proof requires existing subject/email and is single-use');
  } finally {
    for(const id of ids){
      await db.execute('DELETE FROM giao_dich_xu WHERE ma_nguoi_dung=$1',[id]);
      await db.execute('DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung=$1',[id]);
      await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung=$1',[id]);
    }
  }
}
main().then(()=>process.exit(0)).catch(error=>{console.error(error);process.exit(1);});


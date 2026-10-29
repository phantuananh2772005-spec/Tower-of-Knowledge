const crypto=require('crypto');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const {OAuth2Client}=require('google-auth-library');
const db=require('../database/db');
const {withUserLock}=require('./economy.service');
const secret=process.env.JWT_SECRET||'tower_of_knowledge_ultra_secure_jwt_secret_2026';
const clientId=()=>String(process.env.GOOGLE_CLIENT_ID||'').trim();
const client=new OAuth2Client();

// Google signature, audience, issuer and expiry are verified by Google's official library.
function createGoogleIdentity({verifyIdToken=async(credential,audience)=>(await client.verifyIdToken({idToken:credential,audience})).getPayload()}={}){
  function challenge(mode='login',userId=null){
    if(!clientId())throw new Error('Đăng nhập Google chưa được cấu hình trên hệ thống. Hãy dùng tên đăng nhập và mật khẩu.');
    if(!['login','link','recover'].includes(mode)||mode==='link'&&!userId)throw new Error('Yêu cầu đăng nhập trước khi liên kết Google.');
    const nonce=crypto.randomBytes(24).toString('base64url'),csrf=crypto.randomBytes(24).toString('base64url');
    return {clientId:clientId(),nonce,csrf,cookie:jwt.sign({purpose:'google-challenge',mode,userId,nonce,csrf},secret,{expiresIn:'10m'})};
  }
  async function verify(body,cookie,mode,userId=null){
    if(!clientId())throw new Error('Đăng nhập Google chưa được cấu hình.');
    let challengeData;
    try{challengeData=jwt.verify(cookie||'',secret);}catch{throw new Error('Phiên xác thực Google đã hết hạn. Hãy mở lại nút Google.');}
    if(challengeData.purpose!=='google-challenge'||challengeData.mode!==mode||challengeData.userId!==userId||body.csrf!==challengeData.csrf)throw new Error('Phiên xác thực Google không khớp. Hãy thử lại.');
    if(typeof body.credential!=='string'||body.credential.length>10000)throw new Error('Thông tin xác thực Google không hợp lệ.');
    let payload;
    try{payload=await verifyIdToken(body.credential,clientId());}catch{throw new Error('Không xác minh được tài khoản Google. Hãy thử đăng nhập lại.');}
    if(!payload||payload.nonce!==challengeData.nonce||typeof payload.sub!=='string'||!payload.sub||payload.sub.length>255||payload.email_verified!==true||typeof payload.email!=='string'||payload.email.length>100)throw new Error('Tài khoản Google chưa được xác minh hoặc phiên đăng nhập không khớp.');
    return {sub:payload.sub,email:payload.email.trim().toLowerCase(),name:String(payload.name||payload.email).trim().slice(0,100)};
  }
  async function signIn(body,cookie){
    const identity=await verify(body,cookie,'login');
    return withUserLock('google:'+identity.sub,async()=>{
      let user=await db.queryOne('SELECT * FROM nguoi_dung WHERE google_sub = $1',[identity.sub]);
      const auth=require('./auth.service');
      if(user)return auth.issueSession(user);
      const collision=await db.queryOne('SELECT ma_nguoi_dung FROM nguoi_dung WHERE LOWER(email) = $1',[identity.email]);
      if(collision)throw new Error('Email này đã có tài khoản. Hãy đăng nhập bằng mật khẩu, rồi liên kết Google trong Cài đặt.');
      const id='usr_'+crypto.randomUUID(),username='gg_'+crypto.randomBytes(10).toString('hex');
      const passwordHash=await bcrypt.hash(crypto.randomBytes(40).toString('base64url'),10);
      await db.transaction(async tx=>{
        await tx.execute(`INSERT INTO nguoi_dung
          (ma_nguoi_dung,ten_dang_nhap,email,mat_khau_hash,ten_hien_thi,vai_tro,tong_diem_kinh_nghiem,xu_tri_thuc,chuoi_streak_ngay,che_do_giao_dien,bat_am_thanh,google_sub,google_email,co_mat_khau)
          VALUES ($1,$2,$3,$4,$5,$6,0,0,0,$7,$8,$9,$10,$11)`,[id,username,identity.email,passwordHash,identity.name,'NGUOI_HOC','TOI',true,identity.sub,identity.email,false]);
        await tx.execute('INSERT INTO thu_cung_so_huu (ma_so_huu,ma_nguoi_dung,ma_thu_cung,dang_kich_hoat) VALUES ($1,$2,$3,$4)',[crypto.randomUUID(),id,'pet_sparky',true]);
      });
      user=await db.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = $1',[id]);
      return {token:auth.generateToken(user),nguoi_dung:await auth.formatUserResponse(user)};
    });
  }
  async function link(userId,body,cookie){
    const identity=await verify(body,cookie,'link',userId);
    return withUserLock('google:'+identity.sub,()=>withUserLock(userId,async()=>{
      const existing=await db.queryOne('SELECT ma_nguoi_dung FROM nguoi_dung WHERE google_sub = $1',[identity.sub]);
      if(existing&&existing.ma_nguoi_dung!==userId)throw new Error('Tài khoản Google này đã liên kết với một người dùng khác.');
      await db.execute('UPDATE nguoi_dung SET google_sub = $1, google_email = $2, cap_nhat_luc = SYSDATETIME() WHERE ma_nguoi_dung = $3',[identity.sub,identity.email,userId]);
      if(db.isPostgres)await db.execute('DELETE FROM password_recovery WHERE user_id = $1',[userId]);
      return require('./auth.service').getCurrentUser(userId);
    }));
  }
  async function unlink(userId){
    return withUserLock(userId,async()=>{
      const user=await db.queryOne('SELECT co_mat_khau FROM nguoi_dung WHERE ma_nguoi_dung = $1',[userId]);
      if(!user||user.co_mat_khau===false||user.co_mat_khau===0)throw new Error('Hãy tạo mật khẩu cho tài khoản trước khi hủy liên kết Google.');
      await db.execute('UPDATE nguoi_dung SET google_sub = NULL, google_email = NULL, cap_nhat_luc = SYSDATETIME() WHERE ma_nguoi_dung = $1',[userId]);
      if(db.isPostgres)await db.execute('DELETE FROM password_recovery WHERE user_id = $1',[userId]);
      return require('./auth.service').getCurrentUser(userId);
    });
  }
  async function recover(body,cookie){
    const identity=await verify(body,cookie,'recover');
    return require('./password-recovery.service').googleProof(identity);
  }
  return {challenge,signIn,link,unlink,recover};
}
module.exports={...createGoogleIdentity(),createGoogleIdentity,clientId};

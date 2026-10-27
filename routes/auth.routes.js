const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth.middleware');
const googleIdentity=require('../services/google-identity.service');
const challengeCookie='tok_google_challenge';
const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/api/auth',maxAge:600000};
function readChallenge(req){
  const value=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(challengeCookie+'='));
  try{return value?decodeURIComponent(value.slice(challengeCookie.length+1)):'';}catch{return '';}
}
function assertSameOrigin(req){
  if(req.headers.origin && new URL(req.headers.origin).host!==req.get('host'))throw new Error('Nguồn yêu cầu xác thực không hợp lệ.');
}
router.get('/config',(req,res)=>res.apiSuccess({googleClientId:googleIdentity.clientId()||null}));
router.get('/google/challenge',optionalAuthenticate,(req,res)=>{
  try{
    const mode=req.query.mode==='link'?'link':'login';
    const challenge=googleIdentity.challenge(mode,mode==='link'?req.user?.ma_nguoi_dung||null:null);
    res.setHeader('Cache-Control','no-store');res.cookie(challengeCookie,challenge.cookie,cookieOptions);
    return res.apiSuccess({clientId:challenge.clientId,nonce:challenge.nonce,csrf:challenge.csrf});
  }catch(error){return res.apiError(error.message,'GOOGLE_UNAVAILABLE',400);}
});
router.post('/google',async(req,res)=>{
  try{assertSameOrigin(req);const result=await googleIdentity.signIn(req.body,readChallenge(req));res.clearCookie(challengeCookie,{...cookieOptions,maxAge:0});return res.apiSuccess(result);}
  catch(error){return res.apiError(error.message,'GOOGLE_LOGIN_FAILED',401);}
});
router.post('/google/link',authenticate,async(req,res)=>{
  try{assertSameOrigin(req);const result=await googleIdentity.link(req.user.ma_nguoi_dung,req.body,readChallenge(req));res.clearCookie(challengeCookie,{...cookieOptions,maxAge:0});return res.apiSuccess(result);}
  catch(error){return res.apiError(error.message,'GOOGLE_LINK_FAILED',400);}
});
router.delete('/google/link',authenticate,async(req,res)=>{
  try{return res.apiSuccess(await googleIdentity.unlink(req.user.ma_nguoi_dung));}
  catch(error){return res.apiError(error.message,'GOOGLE_UNLINK_FAILED',400);}
});

router.post('/register', async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return res.apiSuccess(result, 201);
  } catch (err) {
    return res.apiError(err.message, 'REGISTRATION_FAILED', 400);
  }
});

router.post('/login', async (req, res) => {
  try {
    const result = await authService.login({ten_dang_nhap:req.body.ten_dang_nhap,mat_khau:req.body.mat_khau});
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'LOGIN_FAILED', 401);
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.ma_nguoi_dung);
    return res.apiSuccess(user);
  } catch (err) {
    return res.apiError(err.message, 'USER_NOT_FOUND', 404);
  }
});

router.put('/settings', authenticate, async (req, res) => {
  try {
    const updated = await authService.updateSettings(req.user.ma_nguoi_dung, req.body);
    return res.apiSuccess(updated);
  } catch (err) {
    return res.apiError(err.message, 'UPDATE_FAILED', 400);
  }
});

router.put('/account', authenticate, async(req,res)=>{
  try { return res.apiSuccess(await authService.updateAccount(req.user.ma_nguoi_dung,req.body)); }
  catch(err) { return res.apiError(err.message,'UPDATE_ACCOUNT_FAILED',400); }
});
router.put('/password', authenticate, async(req,res)=>{
  try { return res.apiSuccess(await authService.changePassword(req.user.ma_nguoi_dung,req.body,req.user.iat)); }
  catch(err) { return res.apiError(err.message,'CHANGE_PASSWORD_FAILED',400); }
});
module.exports = router;

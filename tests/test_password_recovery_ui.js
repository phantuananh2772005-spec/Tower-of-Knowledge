const assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const db=require('../database/db');
const auth=require('../services/auth.service');
const recovery=require('../services/password-recovery.service');
const base='http://localhost:3002';
async function main(){
  assert(/127\.0\.0\.1:55432\/tok_test/.test(process.env.DATABASE_URL),'Disposable local DB only');
  let browser,id;
  try{
    const stamp=Date.now(),email=`ui_recovery_${stamp}@gmail.com`;
    const reg=await auth.register({ten_dang_nhap:'ui_recovery_'+stamp,email,mat_khau:'OldPassword123!'});id=reg.nguoi_dung.ma_nguoi_dung;
    await db.execute('UPDATE nguoi_dung SET google_sub=$1,google_email=$2 WHERE ma_nguoi_dung=$3',['ui_recovery_'+stamp,email,id]);
    browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
    for(const width of [375,768,1280,1920]){
      const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
      await page.setViewport({width,height:700});await page.goto(base,{waitUntil:'networkidle2'});
      await page.evaluate(()=>openPasswordRecovery());
      await page.waitForSelector('#recovery-google');
      assert(await page.$eval('#recovery-email-flow',element=>element.hidden),'Unconfigured email option must be hidden');
      assert(await page.$eval('#recovery-password-flow',element=>element.hidden),'Cannot enter password before Google verification');
      const proof=await recovery.googleProof({sub:'ui_recovery_'+stamp,email});
      // Only the Google popup is substituted; proof storage and redemption use real PostgreSQL + HTTP.
      await page.evaluate(proof=>window.dispatchEvent(new CustomEvent('tok-google-recovery',{detail:proof})),proof);
      const fits=await page.$eval('#modal-password-recovery section',element=>{const r=element.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;});
      assert(fits,`Dialog overflows at ${width}`);
      await page.type('#recovery-password','RecoveryUi123!');await page.type('#recovery-confirm','Mismatch123!');
      await page.click('#recovery-submit');assert.match(await page.$eval('#recovery-status',el=>el.textContent),/chưa trùng/);
      await page.$eval('#recovery-confirm',el=>el.value='RecoveryUi123!');
      await page.click('#recovery-submit');
      await page.waitForFunction(()=>document.getElementById('recovery-status').textContent.includes('Đã đặt lại mật khẩu'));
      assert(await page.$eval('#recovery-password',el=>el.value===''));
      assert.deepEqual(errors,[]);
      if(process.env.TEST_SCREENSHOTS)await page.screenshot({path:process.env.TEST_SCREENSHOTS+`/password-recovery-${width}.png`});
      await page.close();console.log(`PASS recovery UI ${width}: real reset, mismatch, clear secrets, viewport fit`);
    }
    const oldResponse=await fetch(base+'/api/auth/me',{headers:{Authorization:'Bearer '+reg.token}});assert.equal(oldResponse.status,401);
    const newLogin=await auth.login({ten_dang_nhap:reg.nguoi_dung.ten_dang_nhap,mat_khau:'RecoveryUi123!'});
    const me=await fetch(base+'/api/auth/me',{headers:{Authorization:'Bearer '+newLogin.token}});assert.equal(me.status,200);
    const crossOrigin=await fetch(base+'/api/auth/password-recovery/reset',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://other.example'},body:JSON.stringify({})});assert.equal(crossOrigin.status,400);
    for(let i=0;i<21;i++){
      const limited=await fetch(base+'/api/auth/password-recovery/request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
      if(i===20)assert.equal(limited.status,429);
    }
    console.log('PASS HTTP: revoked session denied, new session accepted, cross-origin denied, recovery rate limit enforced');
  }finally{
    if(browser)await browser.close();
    if(id){await db.execute('DELETE FROM giao_dich_xu WHERE ma_nguoi_dung=$1',[id]);await db.execute('DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung=$1',[id]);await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung=$1',[id]);}
  }
}
main().then(()=>process.exit(0)).catch(error=>{console.error(error);process.exit(1);});

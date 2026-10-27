const assert=require('assert');
const puppeteer=require('puppeteer-core');
const db=require('../database/db');
const base=process.env.TEST_BASE_URL||'http://localhost:3002';
async function main(){
  assert.equal(new URL(base).hostname,'localhost','Disposable local test only');
  let id,browser;
  try{
    const result=await(await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ten_dang_nhap:'codex_tour_compat_'+Date.now(),mat_khau:'TourCompat123!',ten_hien_thi:'Kiểm thử hướng dẫn'})})).json();
    assert(result.success);id=result.data.nguoi_dung.ma_nguoi_dung;
    browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
    for(const width of [1280,375]){
      const page=await browser.newPage();await page.setViewport({width,height:width===375?700:850});
      await page.evaluateOnNewDocument(token=>localStorage.setItem('tok_token',token),result.data.token);
      await page.goto(base,{waitUntil:'networkidle2'});await page.waitForFunction(()=>currentUserAccount?.userId&&allPets.length===14);
      for(const previousStep of ['audio-quiz','audio-reward','audio-battle','audio-outcome','shop-admin']){
        const isAudio=previousStep!=='shop-admin';
        await page.evaluate(async({width,previousStep,isAudio})=>{
          const context=isAudio?{view:'hub',modal:'modal-settings',settings:'audio'}:{view:'shop'};
          queuePreferenceSave({tien_do_huong_dan:{version:2,step:previousStep,layout:width<768?'mobile':'desktop',completed:false,context}});
          await flushPreferences();
        },{width,previousStep,isAudio});
        await page.reload({waitUntil:'networkidle2'});await page.waitForFunction(()=>currentUserAccount?.userId);
        const soundBefore=await page.evaluate(()=>JSON.stringify(audioSettings));
        await page.evaluate(()=>startPetOnboardingTour());
        await new Promise(resolve=>setTimeout(resolve,300));
        assert.equal(await page.evaluate(()=>GuidedTour.step),isAudio?'audio-overview':'shop-items');
        assert.equal(await page.evaluate(()=>JSON.stringify(audioSettings)),soundBefore,'Opening overview changed sound settings');
        const geometry=await page.evaluate(()=>{
          const a=GuidedTour.target.getBoundingClientRect(),b=document.getElementById('pet-tour-dialog').getBoundingClientRect();
          return {overlap:Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)),bottom:b.bottom};
        });
        assert(geometry.overlap<=1,'Resumed guide obscures target at '+width+' '+previousStep);
        assert(geometry.bottom<= (width===375?700:850)+1);
        assert.equal(await page.$$eval('#shop-pets-grid [data-pet-role="admin"]',els=>els.length),0);
        if(process.env.TEST_SCREENSHOTS&&previousStep==='audio-quiz')await page.screenshot({path:process.env.TEST_SCREENSHOTS+`/tour-${width}-audio-overview.png`});
        await page.evaluate(async()=>{skipPetTour();await flushPreferences();});
      }
      console.log('PASS old audio/Admin-shop steps resume safely at '+width+'px; audio unchanged; Admin pets absent from shop');
      await page.close();
    }
  }finally{
    if(browser)await browser.close();
    if(id)await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung=$1',[id]);
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});

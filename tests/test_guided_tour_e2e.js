const assert=require('assert');
const puppeteer=require('puppeteer-core');
const db=require('../database/db');
const fs=require('fs');
const base=process.env.TEST_BASE_URL||'http://localhost:3001';
const screenshots=process.env.TEST_SCREENSHOTS;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
  assert(new URL(base).hostname==='localhost','Use a disposable local test account, never the production database.');
  const username='codex_tour_'+Date.now();let id;let browser;
  try{
    const response=await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ten_dang_nhap:username,mat_khau:'TestTour123!',ten_hien_thi:'Kiểm thử hướng dẫn'})});
    const result=await response.json();assert(result.success,JSON.stringify(result.error));id=result.data.nguoi_dung.ma_nguoi_dung;
    await db.execute('UPDATE nguoi_dung SET xu_tri_thuc = $1 WHERE ma_nguoi_dung = $2',[1000,id]);
    await require('../services/pet.service').buyPet('pyra_phoenix',id);
    browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
    for(const width of (process.env.TEST_WIDTHS||'1280,375').split(',').map(Number)){
      const page=await browser.newPage();const errors=[];page.on('pageerror',err=>errors.push(err.message));
      await page.setViewport({width,height:850});
      await page.evaluateOnNewDocument(token=>{localStorage.setItem('tok_token',token);localStorage.setItem('tok_admin_token','stale-admin-token');},result.data.token);
      await page.evaluateOnNewDocument(()=>{window.tourClickLog=[];document.addEventListener('click',e=>window.tourClickLog.push({id:e.target.closest('button')?.id||e.target.id||e.target.className,step:window.GuidedTour?.step}),true);});
      await page.goto(base,{waitUntil:'networkidle2'});await page.waitForFunction(()=>typeof GuidedTour!=='undefined'&&currentUserAccount?.userId);
      assert(await page.$eval('#btn-topbar-admin-portal',el=>getComputedStyle(el).display==='none'),'Learner sees desktop Admin link');
      assert(await page.$eval('#btn_m_more_admin',el=>getComputedStyle(el).display==='none'),'Learner sees mobile Admin link');
      assert(await page.evaluate(()=>!ownedPets.admin_aurum&&!ownedPets.admin_nguyet),'Learner owns Admin pets');
      if(width===(process.env.TEST_WIDTHS||'1280,375').split(',').map(Number)[0]){
        assert(await page.$eval('#btn_auth_google_login',el=>el.disabled),'Unconfigured Google must not sign in with a shared account');
        await page.evaluate(()=>navTo('shop'));page.once('dialog',dialog=>dialog.accept());
        await page.click('#btn_item_graduation_cap');
        await page.waitForFunction(()=>currentUserAccount.accessory?.id==='graduation_cap');
        await page.evaluate(()=>navTo('pet'));
        await page.click('#owned-pets-list [data-pet-id="pyra_phoenix"]');
        await page.waitForFunction(()=>currentEquippedPet.id==='pyra_phoenix');
        await page.evaluate(async()=>{queuePreferenceSave({che_do_giao_dien:'SANG',cai_dat_am_thanh:{quiz:false,reward:true,battle:false,outcome:false,bgm:false}});await flushPreferences();});
        await page.reload({waitUntil:'networkidle2'});
        await page.waitForFunction(()=>currentUserAccount?.userId&&allPets.length===14);
        assert.strictEqual(await page.evaluate(()=>currentEquippedPet.id),'pyra_phoenix','Equipped Pet lost after reload');
        assert.strictEqual(await page.evaluate(()=>currentUserAccount.accessory?.id),'graduation_cap','Accessory lost after reload');
        assert(await page.$('#hub-pet-avatar .pet-accessory-badge'),'Equipped accessory missing from Pet display');
        assert(await page.evaluate(()=>!document.documentElement.classList.contains('dark')&&!audioSettings.quiz),'Settings lost after reload');
        await page.evaluate(()=>{currentUserAccount.tourProgress=null;localStorage.removeItem('tok_tour_v2_'+currentUserAccount.userId);startPetOnboardingTour();});
        await delay(250);await page.click('#btn_pet_tour_next');await delay(250);
        await page.evaluate(async()=>{skipPetTour();await flushPreferences();});
        await page.reload({waitUntil:'networkidle2'});await page.waitForFunction(()=>currentUserAccount?.userId);
        await page.evaluate(()=>startPetOnboardingTour());await delay(250);
        assert.strictEqual(await page.evaluate(()=>GuidedTour.step),'level','Tour did not resume saved step');
        await page.evaluate(()=>skipPetTour());
      }
      await page.evaluate(()=>{document.getElementById('modal-unboxing-pet').classList.add('hidden');currentUserAccount.tourProgress=null;localStorage.removeItem('tok_tour_v2_'+currentUserAccount.userId);startPetOnboardingTour();});
      await delay(300);
      const missing=[],overlap=[];
      for(let n=0;n<130;n++){
        await page.waitForFunction(()=>GuidedTour.target||!document.getElementById('btn_pet_tour_next').disabled,{timeout:6000});
        await delay(180);
        const before=await page.evaluate(()=>{
          const t=GuidedTour.target,d=document.getElementById('pet-tour-dialog'),r=t?.getBoundingClientRect(),q=d.getBoundingClientRect();
          return {step:GuidedTour.step,target:!!t,action:GuidedTour.steps.find(s=>s.id===GuidedTour.step)?.action,repeat:GuidedTour.steps.find(s=>s.id===GuidedTour.step)?.repeat,
            rect:r?{x:r.x,y:r.y,w:r.width,h:r.height}:null,dialog:{x:q.x,y:q.y,w:q.width,h:q.height},
            overlap:r?Math.max(0,Math.min(r.right,q.right)-Math.max(r.left,q.left))*Math.max(0,Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top)):0};
        });
        if(before.step==='finish')break;
        if(!before.target){missing.push(before.step);console.log('MISSING',width,before.step);}
        if(before.overlap>80){overlap.push(before.step);console.log('OVERLAP',width,before.step,JSON.stringify({target:before.rect,dialog:before.dialog}));if(screenshots)await page.screenshot({path:screenshots+`/tour-overlap-${width}-${before.step}.png`});}
        assert(before.dialog.x>=0&&before.dialog.y>=0&&before.dialog.x+before.dialog.w<=width+1&&before.dialog.y+before.dialog.h<=851,`Dialog leaves viewport: ${before.step}`);
        if(screenshots&&['level','nav-catalog','pet-current','settings-audio'].includes(before.step)){fs.mkdirSync(screenshots,{recursive:true});await page.screenshot({path:screenshots+`/tour-${width}-${before.step}.png`});}
        if(before.action&&before.target){
          const target=before.step==='lesson-answer'?await page.evaluateHandle(()=>{
            const ms=currentQuizSession?.matchingState;
            if(ms){
              if(ms.isEvaluating)return null;
              if(ms.selectedLeft)return [...document.querySelectorAll('#q-options-container button[data-side="right"]')].find(b=>b.dataset.item===ms.pairsMap[ms.selectedLeft]);
              return document.querySelector('#q-options-container button[data-side="left"]:not([data-matched="true"])');
            }
            return document.querySelector('#q-options-container button:not([disabled])');
          }):await page.evaluateHandle(()=>GuidedTour.target);
          if(!target.asElement()){await target.dispose();await delay(300);continue;}
          await target.asElement().click();await target.dispose();
        }else await page.click('#btn_pet_tour_next');
        if(before.repeat){await delay(450);continue;}
        try{await page.waitForFunction(step=>GuidedTour.step!==step,{timeout:25000},before.step);}catch(err){
          if(screenshots)await page.screenshot({path:screenshots+`/tour-failure-${width}.png`});
          throw Error(`Tour stuck at ${width}px ${before.step}: ${JSON.stringify(await page.evaluate(()=>{const btn=document.getElementById('btn_pet_tour_next'),r=btn.getBoundingClientRect();return {view:currentAppView,active:GuidedTour.active,hint:document.getElementById('tour-action-hint').textContent,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.id,log:tourClickLog.slice(-5)};}))}; errors=${JSON.stringify(errors)}`);
        }
      }
      console.log(JSON.stringify({width,steps:await page.evaluate(()=>GuidedTour.steps.length),last:await page.evaluate(()=>GuidedTour.step),missing,overlap,errors}));
      assert.deepStrictEqual(errors,[],'Browser JavaScript errors');
      assert.strictEqual(await page.evaluate(()=>GuidedTour.step),'finish','Tour did not reach completion');
      assert.deepStrictEqual(missing,[],'Tour targets missing');
      assert.deepStrictEqual(overlap,[],'Tour dialog obscures targets');
      await page.close();
    }
  }finally{
    if(browser)await browser.close();
    if(id){await db.execute('DELETE FROM lich_su_phien_hoc WHERE ma_nguoi_dung = $1',[id]);await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung = $1',[id]);}
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});

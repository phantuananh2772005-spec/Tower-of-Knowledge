const assert=require('assert');
const puppeteer=require('puppeteer-core');
const db=require('../database/db');
const base=process.env.TEST_BASE_URL||'http://localhost:3001';
async function main(){
  assert(new URL(base).hostname==='localhost','Use a disposable local test account, never the production database.');
  const username='codex_tour_'+Date.now();let id;let browser;
  try{
    const response=await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ten_dang_nhap:username,mat_khau:'TestTour123!Fixture',ten_hien_thi:'Kiểm thử hướng dẫn'})});
    const result=await response.json();assert(result.success,JSON.stringify(result.error));id=result.data.nguoi_dung.ma_nguoi_dung;
    await db.execute('UPDATE nguoi_dung SET xu_tri_thuc = $1 WHERE ma_nguoi_dung = $2',[1000,id]);
    await require('../services/pet.service').buyPet('pyra_phoenix',id);
    browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
    for(const width of (process.env.TEST_WIDTHS||'1280,375').split(',').map(Number)){
      const page=await browser.newPage();const errors=[];page.on('pageerror',err=>errors.push(err.message));
      await page.setViewport({width,height:850});
      await page.evaluateOnNewDocument(token=>{localStorage.setItem('tok_token',token);localStorage.setItem('tok_admin_token','stale-admin-token');},result.data.token);
      await page.goto(base,{waitUntil:'networkidle2'});await page.waitForFunction(()=>typeof GuidedTour!=='undefined'&&currentUserAccount?.userId);
      assert.strictEqual(await page.$eval('#topbar-title',el=>el.textContent),'Tổng quan','Initial home header incorrectly shows course chapter');
      assert(await page.$eval('#btn-topbar-admin-portal',el=>getComputedStyle(el).display==='none'),'Learner sees desktop Admin link');
      assert(await page.$eval('#btn_m_more_admin',el=>getComputedStyle(el).display==='none'),'Learner sees mobile Admin link');
      assert(await page.evaluate(()=>!ownedPets.admin_aurum&&!ownedPets.admin_nguyet),'Learner owns Admin pets');
      assert.strictEqual(await page.$$eval('#shop-pets-grid [data-pet-role="admin"]',els=>els.length),0,'Shop exposes Admin pets');
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
      }
      await page.evaluate(()=>{
        document.getElementById('modal-unboxing-pet').classList.add('hidden');
        currentUserAccount.tourProgress=null;
        localStorage.removeItem('tok_feature_tips_v1_'+currentUserAccount.userId);
        navTo('catalog');
      });
      const tip='#view-catalog aside[aria-label="Gợi ý sử dụng"]';
      await page.waitForSelector(tip,{visible:true});
      assert(await page.$eval(tip,el=>{
        const rect=el.getBoundingClientRect();
        return rect.left>=0&&rect.right<=innerWidth+1;
      }),'Gợi ý nằm ngoài chiều rộng màn hình');
      await page.click(tip+' button');
      await page.evaluate(()=>{navTo('hub');navTo('catalog');});
      assert.strictEqual(await page.$(tip),null,'Gợi ý hiện lại sau khi đã đọc');
      await page.evaluate(()=>{openSettingsModal();openSettingsAudioView();});
      await page.waitForSelector('#settings-view-audio aside',{visible:true});
      assert.strictEqual((await page.$$('#settings-view-audio aside')).length,1);
      assert.deepStrictEqual(errors,[],'Browser JavaScript errors');
      console.log('PASS contextual guide viewport',width);
      await page.close();
    }
  }finally{
    if(browser)await browser.close();
    if(id){await db.execute('DELETE FROM lich_su_phien_hoc WHERE ma_nguoi_dung = $1',[id]);await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung = $1',[id]);}
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});

const assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const db=require('../database/db');
const base='http://localhost:3002';
async function main(){
 assert(/127\.0\.0\.1:55432\/tok_test/.test(process.env.DATABASE_URL),'Disposable PostgreSQL only');
 let browser,id;
 try{
  const reg=await(await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ten_dang_nhap:'garden_'+Date.now(),mat_khau:'GardenTest123!'})})).json();assert(reg.success);id=reg.data.nguoi_dung.ma_nguoi_dung;
  const headers={Authorization:'Bearer '+reg.data.token};
  for(const slug of ['co-so-du-lieu','chuyen-doi-so']){const response=await fetch(base+'/api/courses/'+slug+'/enroll',{method:'POST',headers});assert(response.ok);}
  browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  for(const width of [375,768,1280,1920]){
   const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width,height:850});await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
   await page.evaluateOnNewDocument(token=>localStorage.setItem('tok_token',token),reg.data.token);await page.goto(base,{waitUntil:'networkidle2'});await page.waitForFunction(()=>currentUserAccount?.userId);
   for(const slug of ['co-so-du-lieu','chuyen-doi-so']){
    await page.evaluate(async slug=>{await openCourseRoadmap(slug);},slug);await page.waitForSelector('.garden-node');
    const stats=await page.evaluate(()=>({nodes:document.querySelectorAll('.garden-node').length,expected:liveCourseData.cac_chuong.reduce((n,c)=>n+c.cac_moc.length,0),chapters:document.querySelectorAll('.garden-chapter').length,expectedChapters:liveCourseData.cac_chuong.length,overflow:document.documentElement.scrollWidth>innerWidth||document.getElementById('view-saga').scrollWidth>document.getElementById('view-saga').clientWidth,scrollable:document.getElementById('app-main-scroll').scrollHeight>document.getElementById('app-main-scroll').clientHeight}));
    assert.equal(stats.nodes,stats.expected);assert.equal(stats.chapters,stats.expectedChapters);assert(stats.scrollable);assert(!stats.overflow);
    await page.evaluate(()=>{const s=document.getElementById('app-main-scroll');s.scrollTop=s.scrollHeight;});
    await new Promise(r=>setTimeout(r,650));
    assert(await page.$eval('.garden-finish',e=>{const r=e.getBoundingClientRect(),s=document.getElementById('app-main-scroll').getBoundingClientRect();return r.top<s.bottom&&r.bottom>s.top;}),'End of path cannot be reached');
    await page.click('#btn_garden_current');await new Promise(r=>setTimeout(r,650));
    assert(await page.$eval('[aria-current="step"]',e=>{const r=e.getBoundingClientRect(),s=document.getElementById('app-main-scroll').getBoundingClientRect();return r.top>=s.top&&r.bottom<=s.bottom;}),'Return to active node failed');
    if(process.env.TEST_SCREENSHOTS){
      await page.screenshot({path:process.env.TEST_SCREENSHOTS+`/garden-${width}-${slug}.png`});
      if(width===1280){await page.evaluate(()=>document.documentElement.classList.remove('dark'));await page.screenshot({path:process.env.TEST_SCREENSHOTS+`/garden-light-${width}-${slug}.png`});await page.evaluate(()=>document.documentElement.classList.add('dark'));}
    }
    const locked=await page.$('.garden-node[aria-disabled="true"]');assert(locked);await locked.evaluate(e=>e.click());
    assert.equal(await page.evaluate(()=>currentAppView),'saga','Locked node opened lesson');
    console.log(JSON.stringify({width,slug,...stats}));
   }
   await page.focus('[aria-current="step"]');await page.keyboard.press('Enter');
   await page.waitForFunction(()=>currentAppView==='play'||Boolean(document.getElementById('modal-checkpoint')&&!document.getElementById('modal-checkpoint').classList.contains('hidden')));
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS: every chapter/milestone rendered, both courses, all widths, locked nodes, natural scrolling to end, return to current, no JS errors');
 }finally{if(browser)await browser.close();if(id)await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung=$1',[id]);}
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});

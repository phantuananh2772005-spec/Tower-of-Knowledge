const assert=require('node:assert/strict'),puppeteer=require('puppeteer-core'),db=require('../database/db');
const base='http://localhost:3002';
async function main(){
 assert(/127\.0\.0\.1:55432\/tok_test/.test(process.env.DATABASE_URL),'Disposable local database only');let browser,id;
 try{
 const reg=await(await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ten_dang_nhap:'lesson_layout_'+Date.now(),mat_khau:'LessonLayout123!'})})).json();assert(reg.success);id=reg.data.nguoi_dung.ma_nguoi_dung;
 const questionIds={};for(const q of await db.query('SELECT ma_cau_hoi,loai_cau_hoi FROM cau_hoi WHERE ma_moc=$1 ORDER BY ma_cau_hoi',['moc_csdl_01_01']))questionIds[q.loai_cau_hoi]??=q.ma_cau_hoi;
 browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 for(const [width,height] of [[1280,600],[1280,720],[1920,1080],[768,800],[375,667]]){
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width,height});await page.evaluateOnNewDocument(token=>localStorage.setItem('tok_token',token),reg.data.token);await page.goto(base,{waitUntil:'networkidle2'});await page.waitForFunction(()=>currentUserAccount?.userId);
  await page.evaluate(()=>startMocLearning('moc_csdl_01_01'));
  const theory=await page.$eval('#btn-next-card',e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;});assert(theory,'Theory action outside viewport');assert.equal(await page.$('#play-hearts-badge'),null);
  let baseline;
  for(const type of ['TRAC_NGHIEM_4','NOI_CAP','DIEN_TU','SAP_XEP_CAU']){
   await page.evaluate(async({type,questionIds})=>{await startMocLearning('moc_csdl_01_01',{queue:[questionIds[type]]});const s=currentMocSession,q=s.questions.find(q=>q.loai_cau_hoi===type);if(!q)throw Error('Missing type '+type);s.questionsQueue=[q];s.phase='PRACTICE_QUEUE';renderMocLearningScreen();},{type,questionIds});
   const geometry=await page.evaluate(()=>{const button=document.getElementById('btn-next-step').getBoundingClientRect(),hint=document.getElementById('btn-quiz-theory-hint').getBoundingClientRect(),main=document.getElementById('app-main-scroll');return{top:button.top,bottom:button.bottom,width:button.width,frameWidth:document.getElementById('play-practice-container').clientWidth,hintBottom:hint.bottom,viewport:innerHeight,mainOverflow:main.scrollHeight-main.clientHeight,bodyOverflow:document.documentElement.scrollHeight-innerHeight};});
   assert(Math.abs(geometry.width-geometry.frameWidth)<2,'Actions do not fill lesson width');assert(geometry.top>=0&&geometry.hintBottom<=height+1,JSON.stringify({type,width,height,geometry}));assert(geometry.mainOverflow<=1&&geometry.bodyOverflow<=1,JSON.stringify(geometry));if(baseline!==undefined)assert(Math.abs(geometry.top-baseline)<1,'Action jumps between question types');baseline=geometry.top;
   if(type==='NOI_CAP'){
    await page.evaluate(()=>{const s=currentMocSession;for(const[left,right]of Object.entries(s.matchingState.pairsMap)){const buttons=[...document.querySelectorAll('#q-options-container button[data-side]')];selectNoiCapToken('left',left,buttons.find(b=>b.dataset.side==='left'&&b.dataset.item===left));selectNoiCapToken('right',right,buttons.find(b=>b.dataset.side==='right'&&b.dataset.item===right));}});
    await new Promise(r=>setTimeout(r,400));
    assert(await page.$$eval('#q-options-container button[data-matched="true"]',buttons=>buttons.length>0&&buttons.every(e=>getComputedStyle(e).visibility==='visible'&&Number(getComputedStyle(e).opacity)>.5)),'Matched pairs vanished');
    assert(await page.evaluate(()=>{const left=[...document.querySelectorAll('button[data-side="left"]')],right=[...document.querySelectorAll('button[data-side="right"]')];return left.every((button,i)=>currentMocSession.matchingState.pairsMap[button.dataset.item]===right[i].dataset.item&&Math.abs(button.getBoundingClientRect().top-right[i].getBoundingClientRect().top)<1);}),'Completed definitions not aligned with terms');
    assert(await page.$eval('#btn-next-step',e=>{const r=e.getBoundingClientRect();return !e.disabled&&r.bottom<=innerHeight;}),'Continue inaccessible after matching');
    assert(await page.$eval('#noi-cap-status-box',e=>getComputedStyle(e).display==='none'),'Duplicate success message');
    if(process.env.TEST_SCREENSHOTS)await page.screenshot({path:process.env.TEST_SCREENSHOTS+`/lesson-matching-${width}-${height}.png`});
   }
  }
  assert.deepEqual(errors,[]);console.log(`PASS ${width}x${height}: theory + four question types, stable visible actions, no outer scroll/hearts, visible matched pairs`);await page.close();
 }
 }finally{if(browser)await browser.close();if(id)await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung=$1',[id]);}
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});

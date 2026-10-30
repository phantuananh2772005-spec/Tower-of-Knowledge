const assert=require('assert');
const puppeteer=require('puppeteer-core');
const {PNG}=require('pngjs');
const jsQR=require('jsqr');
const db=require('../database/db');
const base=process.env.TEST_BASE_URL||'http://localhost:3002';
async function main(){
  assert.equal(new URL(base).hostname,'localhost');
  let browser,id;
  try{
    const qrResponse=await fetch(base+'/api/arena/room-qr.png?code=TOK-ABCD');
    assert.equal(qrResponse.status,200);
    const png=PNG.sync.read(Buffer.from(await qrResponse.arrayBuffer()));
    assert.equal(jsQR(new Uint8ClampedArray(png.data),png.width,png.height).data,base+'/?room=TOK-ABCD');
    assert.equal((await fetch(base+'/api/arena/room-qr.png?code=invalid')).status,400);
    const result=await (await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ten_dang_nhap:'codex_resume_'+Date.now(),mat_khau:'TestResume123!',ten_hien_thi:'Kiểm thử khôi phục'})})).json();
    assert(result.success);id=result.data.nguoi_dung.ma_nguoi_dung;
    browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
    const page=await browser.newPage();
    page.on('dialog',dialog=>dialog.accept());
    await page.evaluateOnNewDocument(token=>localStorage.setItem('tok_token',token),result.data.token);
    await page.goto(base+'/?room=TOK-ABCD',{waitUntil:'networkidle2'});
    await page.waitForFunction(()=>currentUserAccount?.userId&&document.getElementById('input_casual_room_code').value==='TOK-ABCD');
    assert.equal(await page.evaluate(()=>currentAppView),'minigame');
    assert.equal(new URL(page.url()).searchParams.has('room'),false);
    for(const type of ['TRAC_NGHIEM_4','NOI_CAP','DIEN_TU','SAP_XEP_CAU']){
      const snapshot=await page.evaluate(async type=>{
        await startMocLearning('moc_csdl_01_01');
        const s=currentMocSession,q=s.questions.find(q=>q.loai_cau_hoi===type);
        if(!q)throw Error('Missing question type '+type);
        s.questionsQueue=[q,...s.questions.filter(other=>other!==q)];s.phase='PRACTICE_QUEUE';renderMocLearningScreen();
        if(type==='TRAC_NGHIEM_4')selectTracNghiem(0);
        if(type==='NOI_CAP'){
          for(const [left,right] of Object.entries(s.matchingState.pairsMap)){
            const buttons=[...document.querySelectorAll('#q-options-container button[data-side]')];
            selectNoiCapToken('left',left,buttons.find(b=>b.dataset.side==='left'&&b.dataset.item===left));
            selectNoiCapToken('right',right,buttons.find(b=>b.dataset.side==='right'&&b.dataset.item===right));
          }
        }
        if(type==='DIEN_TU'){
          document.querySelector('#q-options-container button').click();await handleMocPracticeAction();
        }
        if(type==='SAP_XEP_CAU'){
          for(const button of document.querySelectorAll('#sentence-token-bank button'))button.click();
          await handleMocPracticeAction();
        }
        const snapshot=LessonProgress.capture();
        queuePreferenceSave({tien_do_huong_dan:{version:2,step:'lesson-explanation',layout:'desktop',completed:false,context:{view:'play',mocId:s.mocId,lesson:snapshot}}});
        await flushPreferences();
        return snapshot;
      },type);
      assert(snapshot.checked,'Answer not checked: '+type);
      await page.reload({waitUntil:'networkidle2'});
      await page.waitForFunction(()=>currentUserAccount?.userId);
      const restored=await page.evaluate(async snapshot=>{
        await startPetOnboardingTour();
        const ok=GuidedTour.step==='lesson-explanation';
        return {ok,state:LessonProgress.capture(),feedback:!document.getElementById('q-feedback-box').classList.contains('hidden')};
      },snapshot);
      assert(restored.ok&&(type==='NOI_CAP'?!restored.feedback:restored.feedback),'Answer feedback state not restored: '+type);
      for(const key of ['queue','submissions','answer','checked','word','words','pairs','failed','firstCorrect'])assert.deepStrictEqual(restored.state[key],snapshot[key],type+': '+key);
      await page.evaluate(()=>skipPetTour());
      console.log('PASS restore '+type+' after reload without duplicate submissions');
    }
    console.log('PASS scannable QR and invitation prefill without automatic room join');
    const invalidResume=await fetch(base+'/api/checkpoints/moc_csdl_01_01?resume=not_in_this_checkpoint',{headers:{Authorization:'Bearer '+result.data.token}});
    assert.equal(invalidResume.status,403,'Resume must reject unrelated question IDs');
  }finally{
    if(browser)await browser.close();
    if(id)await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung=$1',[id]);
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});

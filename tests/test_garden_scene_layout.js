const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const puppeteer=require('puppeteer-core');
const {PNG}=require('pngjs');

test('long chapters add scenery without scaling images or changing learning nodes',async()=>{
  const publicDir=path.resolve('public');
  const server=http.createServer((req,res)=>{
    const filename=path.resolve(publicDir,'.'+decodeURIComponent(req.url.split('?')[0]));
    if(!filename.startsWith(publicDir+path.sep)){res.writeHead(404).end();return;}
    fs.readFile(filename,(error,data)=>{if(error)res.writeHead(404).end();else res.end(data)});
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try{
    const page=await browser.newPage(),errors=[],failedAssets=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',r=>{if(/\/assets\/garden-v[23]\//.test(r.url())&&!r.ok())failedAssets.push(r.url())});
    await page.goto(`http://127.0.0.1:${server.address().port}/css/learning-garden.css`);
    await page.setContent('<style>*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif}button{font:inherit}#app-main-scroll{height:100vh;overflow:auto}</style><main id="app-main-scroll"><span id="sidebar-saga-course-tag"></span><div id="saga-roadmap-track"></div></main>');
    await page.addStyleTag({path:'public/css/learning-garden.css'});
    await page.addScriptTag({content:`
      let currentAppView='saga',currentSagaChapterId;
      function escapeHtml(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')}
      function setSagaFocusMoc(){} function syncAllPetDisplays(){document.querySelector('#roadmap-pet-avatar').innerHTML='<img src="/assets/sparky_idle.gif" alt="Sparky">'} function navTo(){}
      function scrollToActiveNode(){} function onSagaLockedClick(){}
      function openTheoryModal(id){window.openedTheory=id}
      function openCheckpointModal(id,step){window.openedCheckpoint=[id,step]}
      function fixture(count){return {name:'Cơ sở dữ liệu',slug:'co-so-du-lieu',chapters:[{id:'chapter',sort_order:1,title:'Chương 1 · Tổng quan hệ cơ sở dữ liệu',milestones:Array.from({length:count},(_,i)=>({id:'topic-'+i,sort_order:i+1,title:'Kiến thức cơ sở dữ liệu',kind:'LESSON',has_theory:true,step_count:4,status:i?'LOCKED':'OPEN',current_step:1,completed_steps:0,record:{steps:{1:{stars:2}}}}))}]}}
    `});
    await page.addScriptTag({path:'public/js/learning-garden.js'});
    fs.mkdirSync('outputs',{recursive:true});
    for(const width of [375,768,1280,1920]){
      await page.setViewport({width,height:900});
      let shortHeight;
      for(const topics of [1,24]){
        await page.evaluate(n=>renderLearningGarden(fixture(n)),topics);
        await page.waitForFunction(()=>document.querySelector('.garden-scene')?.offsetHeight>0);
        const state=await page.evaluate(()=>({
          count:document.querySelectorAll('.garden-stop').length,
          scenes:document.querySelectorAll('.garden-scene').length,
          height:document.querySelector('.garden-scene').offsetHeight,
          width:document.querySelector('.garden-scene').offsetWidth,
          overflow:document.documentElement.scrollWidth>innerWidth,
          trail:document.querySelectorAll('.garden-trail').length,
          oldBackground:getComputedStyle(document.querySelector('.garden-chapter'),'::before').content,
          masks:[...document.querySelectorAll('.garden-scenery,.garden-scene')].map(el=>getComputedStyle(el).maskImage),
          joins:[...document.querySelectorAll('.garden-scene')].slice(1).map((el,i)=>el.offsetTop-document.querySelectorAll('.garden-scene')[i].offsetTop-document.querySelector('.garden-scene').offsetHeight)
        }));
        assert.equal(state.count,topics*5);assert.equal(state.trail,1);assert(!state.overflow);
        assert.equal(state.oldBackground,'none');
        assert(Math.abs(state.height/state.width-1.5)<.004);
        assert(state.masks.every(mask=>mask==='none'),'no faded joins');
        assert(state.joins.every(delta=>Math.abs(delta)<=1),'tiles touch without overlap');
        if(topics===1)shortHeight=state.height;
        else{assert.equal(state.height,shortHeight);assert(state.scenes>1)}
      }
      await page.click('#garden-stop-topic-0-theory');
      assert.equal(await page.evaluate(()=>openedTheory),'topic-0');
      await page.click('#garden-stop-topic-0-1');
      assert.deepEqual(await page.evaluate(()=>openedCheckpoint),['topic-0',1]);
      await page.evaluate(()=>document.getElementById('app-main-scroll').scrollTop=0);
      await page.waitForFunction(()=>!!document.querySelector('.garden-scene').style.getPropertyValue('--garden-scene-art'));
      await new Promise(resolve=>setTimeout(resolve,300));
      await page.screenshot({path:`outputs/garden-scenes-${width}.png`});
      await page.evaluate(()=>{
        const scene=document.querySelectorAll('.garden-scene')[1];
        document.getElementById('app-main-scroll').scrollTop=scene.offsetTop-180;
      });
      await new Promise(resolve=>setTimeout(resolve,200));
      await page.screenshot({path:`outputs/garden-scenes-seam-${width}.png`});
      // Check the rendered connector itself, excluding gameplay objects. Every
      // pixel on both sides of adjacent scene connectors must be identical ground.
      const hidden=await page.addStyleTag({content:'.garden-lane,.garden-chapter-heading,.garden-jump-wrap{visibility:hidden}'});
      for(const index of [1,2,3,4,5,6,7]){
        await page.evaluate(index=>{
          const scene=document.querySelectorAll('.garden-scene')[index];
          const root=document.getElementById('app-main-scroll');
          root.scrollTop+=scene.getBoundingClientRect().top-450;
        },index);
        const join=await page.$$eval('.garden-scene',(els,index)=>({x:els[index].getBoundingClientRect().left,y:els[index].getBoundingClientRect().top,width:els[index].getBoundingClientRect().width}),index);
        const pixels=PNG.sync.read(await page.screenshot({clip:{x:Math.ceil(join.x)+2,y:Math.round(join.y)-4,width:Math.floor(join.width)-4,height:8}}));
        const expected=[...pixels.data.subarray(0,4)];
        for(let i=0;i<pixels.data.length;i+=4)assert.deepEqual([...pixels.data.subarray(i,i+4)],expected,'visible seam detected');
      }
      await hidden.evaluate(el=>el.remove());await hidden.dispose();
      assert(await page.$eval('.garden-node',el=>getComputedStyle(el).visibility==='visible'));
      const previousHeight=await page.$eval('.garden-scene',el=>el.offsetHeight);
      await page.setViewport({width:width+40,height:900});
      await page.waitForFunction(h=>document.querySelector('.garden-scene').offsetHeight!==h,{},previousHeight);
      assert.equal(await page.$$eval('.garden-stop',els=>els.length),120);
      console.log('PASS scene ratio, long chapter, resizing, theory/practice navigation',width);
    }
    for(const theme of ['sky','halloween','teachers','christmas','new-year','tet','valentine','womens-day','youth-spring']){
      await page.evaluate(theme=>document.documentElement.dataset.scenicTheme=theme,theme);
      await page.waitForFunction(()=>[...document.querySelectorAll('.garden-scene')].some(el=>el.style.getPropertyValue('--garden-scene-art').includes('/garden-v3/')));
      await page.evaluate(()=>document.documentElement.classList.toggle('dark'));
    }
    await new Promise(resolve=>setTimeout(resolve,300));
    assert.deepEqual(await page.$$eval('.garden-scene',els=>[...new Set(els.map(el=>el.dataset.scene))]),['canopy','bench','branch','ferns','fallen-log','planter','trunk']);
    assert(await page.$$eval('.garden-scene',els=>els.every(el=>getComputedStyle(el).pointerEvents==='none')));
    assert(await page.evaluate(()=>Number(getComputedStyle(document.querySelector('.garden-stop')).zIndex)>Number(getComputedStyle(document.querySelector('.is-overhang')).zIndex)));
    assert.deepEqual(failedAssets,[]);
    assert.deepEqual(errors,[]);
    const preview=await browser.newPage();
    await preview.setViewport({width:1440,height:1200,deviceScaleFactor:1});
    const origin=`http://127.0.0.1:${server.address().port}`;
    await preview.setContent(`<style>body{margin:0;background:#f8f7ef;font:16px Arial;color:#234632}h1{margin:24px 24px 8px;font-size:24px}p{margin:0 24px 18px}.scenes{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin:0 24px}.scene{background:#edf0dc;border-radius:16px;overflow:hidden}.scene img{width:100%;display:block}.label{padding:14px;text-align:center;background:#fffdf1}</style><h1>Vườn học tập · góc nhìn mở ra ngoài khung hình</h1><p>Tán cây, nhánh lá, thân cây và gỗ đổ nối tiếp các góc vườn yên tĩnh</p><div class="scenes">${[['canopy','Tán cây ngoài khung'],['branch','Nhánh lá vươn ngang'],['trunk','Nửa thân cây'],['fallen-log','Khúc gỗ đổ'],['bench','Ghế đọc sách'],['ferns','Đá và dương xỉ'],['planter','Chậu cây']].map(([file,label])=>`<div class="scene"><div class="label">${label}</div><img src="${origin}/assets/garden-v3/${file}-1024.webp"></div>`).join('')}</div>`);
    await preview.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth));
    await preview.screenshot({path:'outputs/garden-v3-scenes-preview.png'});
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
});

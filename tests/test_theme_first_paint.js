const assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
(async()=>{
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const saved of ['light','dark',null,'blocked']){
   const page=await browser.newPage();
   await page.evaluateOnNewDocument(value=>{
    if(value==='blocked')Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage unavailable')}});
    else if(value)localStorage.setItem('app-theme',value);
    else localStorage.removeItem('app-theme');
   },saved);
   await page.setRequestInterception(true);
   let stalled;
   page.on('request',request=>{if(request.url().includes('tailwindcss.min.js'))stalled=request;else request.continue()});
   const navigation=page.goto('http://localhost:3002',{waitUntil:'domcontentloaded',timeout:15000}).catch(()=>{});
   await page.waitForFunction(()=>document.head.querySelector('style')&&getComputedStyle(document.documentElement).backgroundColor!=='rgba(0, 0, 0, 0)');
   const result=await page.evaluate(()=>({dark:document.documentElement.classList.contains('dark'),bg:getComputedStyle(document.documentElement).backgroundColor,body:!!document.body}));
   assert.equal(result.dark,saved!=='light');
   assert.equal(result.bg,saved==='light'?'rgb(248, 250, 252)':'rgb(9, 10, 15)');
   assert.equal(result.body,false,'Theme must be applied before external scripts finish and body is parsed');
   if(stalled)await stalled.abort();
   console.log('PASS early theme:',saved,result.bg);
   await page.close();
  }
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});


(() => {
 'use strict';
 const seasons=['spring','summer','autumn','winter'];
 const names={spring:'Mùa xuân',summer:'Mùa hạ',autumn:'Mùa thu',winter:'Mùa đông',halloween:'Halloween',teachers:'Tri ân 20/11',christmas:'Giáng sinh'};
 const themes={cycle:{name:'Bốn mùa nối tiếp',kicker:'XUÂN · HẠ · THU · ĐÔNG',description:'Mỗi chương một mùa; chương 5 trở về mùa xuân. Nền chuyển nhẹ giữa các chương, đường đi vẫn tách riêng.',material:'Bộ tranh riêng cho từng mùa. Trang này dùng 6 chương minh họa để xem cả vòng lặp.'}};
 for(const [key,name] of Object.entries(names)) themes[key]={name,kicker:'VƯỜN TRANH VẼ',description:key==='teachers'?'Hoa và sách nhỏ bên lề, dành cho dịp tri ân thầy cô.':key==='halloween'?'Bí ngô và ánh đèn dịu, giữ không khí vui và dễ đọc.':key==='christmas'?'Tuyết, cây thông và quà nhỏ ở hai bên lộ trình.':'Xem riêng sắc cây và hoa của '+name.toLowerCase()+'.',material:'Bản xem thử thủ công; chưa tự thay đổi giao diện theo ngày lễ.'};
 const chapters=Array.from({length:6},(_,i)=>({title:'Chương '+(i+1),subtitle:names[seasons[i%4]]}));
 const total=chapters.length*5;
 const labels=['Khởi động','Khám phá','Kết nối','Luyện tập','Thử thách'];
 const state={theme:'cycle',progress:20,motion:!matchMedia('(prefers-reduced-motion: reduce)').matches,compare:false,mobile:false};
 const map=document.getElementById('sample-map'),viewport=document.getElementById('map-viewport');
 const cloud='       .:+:::::.\n    .:++++++++++:.\n  .:++++++++++++++:.\n .+++++++++++++++++:\n:+++++++++++++++++++:\n :::::::::::::::::::';
 function planet(){let text='';for(let y=-16;y<=16;y++){for(let x=-22;x<=22;x++){const distance=x*x/(22*22)+y*y/(16*16);text+=distance<=1?((Math.sin(x*.38+y*.42)>0.25)?'+':(distance>.86?':':'.')):' ';}text+='\n';}return text;}
 function makeScene(theme,chapter,mini=false){
  const done=Math.round(total*state.progress/100),growth=Math.max(0,Math.min(1,(done-chapter*5)/5));
  const world=document.createElement('div');world.className='sample-world painted seasonal '+theme+' '+(!state.motion?'motion-off':'');world.style.setProperty('--growth',String(growth));
  const scene=theme==='cycle'?seasons[chapter%4]:theme;world.dataset.season=scene;world.style.setProperty('--scene-image',`url('/design/map-assets/season-${scene}.webp')`);world.setAttribute('aria-label',`Chương ${chapter+1} · ${names[scene]}`);
  const section=document.createElement('section');section.className='sample-chapter chapter-'+chapter;
  const heading=document.createElement('div');heading.className='chapter-heading';heading.innerHTML=`<span>0${chapter+1}</span><div><h3>${chapters[chapter].title}</h3><p>${chapters[chapter].subtitle}</p></div><span class="chapter-complete">${growth>=1?'✿ Đã nở hoa':Math.round(growth*5)+'/5 mốc'}</span>`;
  section.appendChild(heading);
  const landscape=document.createElement('div');landscape.className='landscape';landscape.innerHTML='<div class="art-layer" aria-hidden="true"></div>';
  const art=landscape.firstElementChild;
  if(theme==='clay')for(const name of ['a','b','c','extra']){const image=document.createElement('img');image.className='tree-sprite tree-'+name;image.src='/design/map-assets/clay-tree.webp';image.width=640;image.height=640;image.alt='';image.setAttribute('aria-hidden','true');image.loading='lazy';art.appendChild(image);}
  if(theme==='ascii'){
   const sky=document.createElement('div');sky.className='ascii-scenery';sky.setAttribute('aria-hidden','true');
   for(const type of ['a','b']){const pre=document.createElement('pre');pre.className='ascii-cloud cloud-'+type;pre.textContent=cloud;sky.appendChild(pre);}
   const sphere=document.createElement('pre');sphere.className='ascii-planet';sphere.textContent=planet();sky.appendChild(sphere);art.appendChild(sky);
  }
  if(theme!=='ascii'){
   for(const [suffix,symbol]of [['a','🌼'],['b','🌷'],['c','🌸']]){const flower=document.createElement('span');flower.className='blossom bloom-'+suffix;flower.textContent=symbol;flower.setAttribute('aria-hidden','true');landscape.appendChild(flower);}
  }
  const lane=document.createElement('div');lane.className='path-lane';
  const xs=[50,64,53,36,48],ys=mini?[60,190,320,450,580]:[85,245,405,565,725],height=mini?720:850;
  function line(points){return points.map((p,i)=>{if(!i)return `M ${p.x} ${p.y}`;const prev=points[i-1],mid=(prev.y+p.y)/2;return `C ${prev.x} ${mid} ${p.x} ${mid} ${p.x} ${p.y}`;}).join(' ');}
  const points=xs.map((x,i)=>({x:x*6,y:ys[i]})),d=line(points),reached=Math.max(0,Math.min(5,done-chapter*5+1));
  lane.innerHTML=`<svg class="trail" aria-hidden="true" viewBox="0 0 600 ${height}" preserveAspectRatio="none"><path class="trail-edge" d="${d}"/><path class="trail-surface" d="${d}"/><path class="trail-reached" d="${line(points.slice(0,reached))}"/></svg>`;
  for(let i=0;i<5;i++){
   const index=chapter*5+i,status=index<done?'done':index===done?'current':'locked';
   const stop=document.createElement('div');stop.className='stop';stop.style.left=xs[i]+'%';stop.style.top=(ys[i]-(mini?21:29))+'px';
   if(status==='current'&&!mini)stop.id='demo-current';
   if(done===total&&index===total-1&&!mini)stop.id='demo-current';
   if(status==='current'){const callout=document.createElement('span');callout.className='current-callout';callout.textContent='Bạn đang ở đây';stop.appendChild(callout);}
   const node=document.createElement(mini?'span':'button');node.className='node '+status+(i===4?' boss':'');node.textContent=status==='done'?'✓':status==='locked'?'🔒':i===4?'♛':'▶';
   if(!mini){node.type='button';node.setAttribute('aria-label',`Mốc ${chapter+1}.${i+1}: ${labels[i]}, ${status==='done'?'đã hoàn thành':status==='current'?'đang học':'chưa mở'}`);node.onclick=()=>{
    map.querySelectorAll('.node.is-selected').forEach(e=>e.classList.remove('is-selected'));node.classList.add('is-selected');document.getElementById('node-note').textContent=`Mốc ${chapter+1}.${i+1} · ${labels[i]} — ${status==='done'?'đã hoàn thành':status==='current'?'đang học':'chưa mở'}`;
   };}
   stop.appendChild(node);const label=document.createElement('span');label.className='stop-label';label.innerHTML=`Mốc ${chapter+1}.${i+1}<small>${labels[i]}</small>`;stop.appendChild(label);lane.appendChild(stop);
  }
  landscape.appendChild(lane);section.appendChild(landscape);world.appendChild(section);return world;
 }
 function renderMap(){
  const oldTop=viewport.scrollTop;map.replaceChildren();chapters.forEach((_,index)=>map.appendChild(makeScene(state.theme,index)));
  viewport.scrollTop=oldTop;
  const theme=themes[state.theme];document.getElementById('map-style-label').textContent=theme.name;
  const done=Math.round(total*state.progress/100);document.getElementById('current-state').textContent=done===total?'Hoàn thành hành trình':`Mốc đang học · ${Math.floor(done/5)+1}.${done%5+1}`;
  document.getElementById('progress-value').textContent=state.progress+'%';document.getElementById('progress-range').value=state.progress;
  document.getElementById('back-current').textContent=done===total?'Về mốc cuối ↑':'Về mốc đang học ↑';
 }
 function renderComparison(){const grid=document.getElementById('comparison-grid');grid.replaceChildren();for(const key of seasons){const theme=themes[key];const card=document.createElement('button');card.className='mini-card';card.type='button';card.setAttribute('aria-label','Mở mẫu '+theme.name);const mini=document.createElement('div');mini.className='mini-scene';mini.setAttribute('aria-hidden','true');mini.appendChild(makeScene(key,0,true));card.appendChild(mini);const caption=document.createElement('div');caption.className='mini-caption';caption.innerHTML=`<div><strong>${theme.name}</strong><small>${theme.kicker}</small></div><span>Mở mẫu ↗</span>`;card.appendChild(caption);card.onclick=()=>{selectTheme(key);setCompare(false);};grid.appendChild(card);}}
 function selectTheme(theme){state.theme=theme;const selected=themes[theme];document.getElementById('style-kicker').textContent=selected.kicker;document.getElementById('style-name').textContent=selected.name;document.getElementById('style-description').textContent=selected.description;document.getElementById('material-note').textContent=selected.material;document.querySelectorAll('.style-option').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.style===theme)));renderMap();}
 function setCompare(compare){state.compare=compare;document.getElementById('single-panel').hidden=compare;document.getElementById('comparison-panel').hidden=!compare;document.getElementById('single-view').setAttribute('aria-pressed',String(!compare));document.getElementById('compare-view').setAttribute('aria-pressed',String(compare));document.querySelector('.device-mode').hidden=compare;if(compare)renderComparison();}
 document.querySelectorAll('.style-option').forEach(button=>button.onclick=()=>{selectTheme(button.dataset.style);if(state.compare)renderComparison();});
 document.getElementById('progress-range').oninput=event=>{state.progress=Number(event.target.value);renderMap();if(state.compare)renderComparison();};
 document.getElementById('motion-toggle').checked=state.motion;
 document.getElementById('motion-toggle').onchange=event=>{state.motion=event.target.checked;document.querySelectorAll('.sample-world').forEach(el=>el.classList.toggle('motion-off',!state.motion));};
 document.getElementById('single-view').onclick=()=>setCompare(false);document.getElementById('compare-view').onclick=()=>setCompare(true);
 for(const mode of ['desktop','mobile'])document.getElementById(mode+'-view').onclick=()=>{state.mobile=mode==='mobile';document.getElementById('map-frame').classList.toggle('mobile',state.mobile);document.getElementById('desktop-view').setAttribute('aria-pressed',String(!state.mobile));document.getElementById('mobile-view').setAttribute('aria-pressed',String(state.mobile));};
 document.getElementById('back-current').onclick=()=>{const current=document.getElementById('demo-current');if(!current)return;viewport.scrollTo({top:Math.max(0,current.getBoundingClientRect().top-viewport.getBoundingClientRect().top+viewport.scrollTop-viewport.clientHeight/2),behavior:state.motion?'smooth':'auto'});};
 selectTheme('cycle');renderComparison();
})();

const assert=require('node:assert/strict');
const http=require('node:http');
const {Server}=require('socket.io');
const {io:client}=require('socket.io-client');
const register=require('../sockets/match-reactions');
(async()=>{
 const server=http.createServer(),io=new Server(server),cooldowns=new Map();let active=true;const sockets=[];
 const db={queryOne:async()=>({trang_thai:active?'DANG_THI_DAU':'KET_THUC'}),query:async()=>[{ma_nguoi_dung:'alice'},{ma_nguoi_dung:'bob'}]};
 io.on('connection',s=>{s.user={ma_nguoi_dung:s.handshake.auth.testUser};register(io,s,db,cooldowns);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{
  for(const id of ['alice','bob','outsider']){const s=client('http://127.0.0.1:'+server.address().port,{auth:{testUser:id},reconnection:false});await new Promise(r=>s.once('connect',r));sockets.push(s);}
  const [alice,bob,outsider]=sockets,received=[[],[],[]];sockets.forEach((s,i)=>s.on('match_reaction',e=>received[i].push(e)));
  const send=(s,p)=>new Promise((r,j)=>s.timeout(1000).emit('match_reaction',p,(e,v)=>e?j(e):r(v)));
  assert.equal((await send(alice,{ma_tran:'m1',reaction:'hello',sender:'bob',text:'untrusted'})).ok,true);
  await new Promise(r=>setTimeout(r,30));assert.equal(received[0].length,1);assert.equal(received[1].length,1);assert.equal(received[2].length,0);
  assert.deepEqual(received[1][0],{ma_tran:'m1',sender:'alice',reaction:'hello'});
  assert.equal((await send(alice,{ma_tran:'m1',reaction:'nice'})).reason,'cooldown');
  assert.equal((await send(bob,{ma_tran:'m1',reaction:'<script>'})).reason,'invalid');
  assert.equal((await send(outsider,{ma_tran:'m1',reaction:'hello'})).reason,'forbidden');
  active=false;assert.equal((await send(bob,{ma_tran:'m1',reaction:'wow'})).reason,'ended');
  active=true;cooldowns.delete('alice');const results=await Promise.all([send(alice,{ma_tran:'m1',reaction:'nice'}),send(alice,{ma_tran:'m1',reaction:'cheer'})]);assert.equal(results.filter(r=>r.ok).length,1);
  console.log('PASS: participant-only delivery, fixed IDs, authenticated sender, cooldown incl concurrent packets, ended-match rejection');
 }finally{sockets.forEach(s=>s.disconnect());await new Promise(r=>io.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});

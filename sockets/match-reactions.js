const ALLOWED = new Set(['hello','cheer','nice','thanks','wow','respect']);

module.exports = function registerReactions(io, socket, db, cooldowns) {
  const userId = socket.user.ma_nguoi_dung;
  if (socket.user.isGuest) return;
  socket.join('reaction-user:'+userId);
  socket.on('match_reaction', async (payload, reply) => {
    const ack = typeof reply === 'function' ? reply : () => {};
    if (!payload || typeof payload.ma_tran !== 'string' || payload.ma_tran.length>100 || !ALLOWED.has(payload.reaction)) return ack({ok:false,reason:'invalid'});
    const key=userId, now=Date.now();
    if(now-(cooldowns.get(key)||0)<3000)return ack({ok:false,reason:'cooldown'});
    // Reserve before awaiting the database so parallel packets cannot bypass the limit.
    cooldowns.set(key,now);
    if(cooldowns.size>1000)for(const [id,at] of cooldowns)if(now-at>60000)cooldowns.delete(id);
    try {
      const match=await db.queryOne('SELECT trang_thai FROM tran_dau_1v1 WHERE ma_tran=$1',[payload.ma_tran]);
      if(match?.trang_thai!=='DANG_THI_DAU')return ack({ok:false,reason:'ended'});
      const players=await db.query('SELECT ma_nguoi_dung FROM nguoi_choi_trong_tran WHERE ma_tran=$1',[payload.ma_tran]);
      if(!players.some(p=>p.ma_nguoi_dung===userId))return ack({ok:false,reason:'forbidden'});
      const event={ma_tran:payload.ma_tran,sender:userId,reaction:payload.reaction};
      // Private authenticated user rooms, independent of the legacy match-room join API.
      io.to(players.map(p=>'reaction-user:'+p.ma_nguoi_dung)).emit('match_reaction',event);
      ack({ok:true,cooldownMs:3000});
    } catch {ack({ok:false,reason:'unavailable'});}
  });
};

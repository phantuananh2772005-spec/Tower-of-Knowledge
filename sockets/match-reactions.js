const allowedReactions = new Set(['hello', 'cheer', 'nice', 'thanks', 'wow', 'respect']);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cooldownMs = 3_000;

module.exports = function registerReactions(io, socket, db, cooldowns) {
  const userId = socket.user.id;
  if (socket.user.isGuest) return;
  socket.join('reaction-user:' + userId);
  socket.on('match_reaction', async (payload, reply) => {
    const ack = typeof reply === 'function' ? reply : () => {};
    if (!payload || typeof payload.match_id !== 'string' || !uuidPattern.test(payload.match_id)
        || !allowedReactions.has(payload.reaction)) {
      return ack({ ok: false, reason: 'invalid' });
    }

    const matchId = payload.match_id.toLowerCase();
    const now = Date.now();
    if (now - (cooldowns.get(userId) || 0) < cooldownMs) return ack({ ok: false, reason: 'cooldown' });
    // Reserve before awaiting the DB to prevent concurrent packets bypassing this limit.
    cooldowns.set(userId, now);
    if (cooldowns.size > 1_000) {
      for (const [id, at] of cooldowns) {
        if (now - at > 60_000) cooldowns.delete(id);
      }
    }

    try {
      const players = await db.query(
        'SELECT m.status, p.user_id FROM matches m JOIN match_players p ON p.match_id = m.id WHERE m.id = $1',
        [matchId]
      );
      if (players[0]?.status !== 'ACTIVE') return ack({ ok: false, reason: 'ended' });
      if (!players.some(player => player.user_id === userId)) return ack({ ok: false, reason: 'forbidden' });

      io.to(players.map(player => 'reaction-user:' + player.user_id)).emit('match_reaction', {
        match_id: matchId,
        sender: userId,
        reaction: payload.reaction
      });
      ack({ ok: true, cooldownMs });
    } catch {
      ack({ ok: false, reason: 'unavailable' });
    }
  });
};

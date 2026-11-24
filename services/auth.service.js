const jwt = require('jsonwebtoken');
const db = require('../database/db');
const petCatalog = require('../config/pets.json');
const { validatePassword, hashPassword, verifyPassword } = require('./password-policy');
const { evaluateStreak, toVietnamDateString } = require('../core/rules/streak.rules');
const { deriveRankTitle, deriveUserLevel, levelProgress } = require('../core/rules/economy.rules');
const { mutateCoinsInTransaction } = require('./wallet.service');

const allowedAudioChannels = new Set(['quiz', 'reward', 'battle', 'outcome', 'bgm']);

function generateToken(user, { auth_method } = {}) {
  return jwt.sign({
    username: user.username,
    role: user.role,
    session_version: user.session_version,
    ...(auth_method ? { auth_method } : {})
  }, process.env.JWT_SECRET, {
    subject: user.id,
    algorithm: 'HS256',
    expiresIn: '7d'
  });
}

function assertInteractiveUser(user) {
  if (!user || user.disabled_at || user.role === 'SYSTEM') {
    throw new Error('Tài khoản không khả dụng.');
  }
}

async function formatUserResponse(user, connection = db) {
  const details = await connection.queryOne(`
    WITH current_season AS (
      SELECT season_no FROM v_season_calendar
      WHERE CURRENT_TIMESTAMP >= starts_at AND CURRENT_TIMESTAMP < ends_at
    )
    SELECT s.theme, s.sound_enabled, s.sound_config, s.tutorial_progress,
      to_jsonb(p) AS equipped_pet, to_jsonb(a) AS equipped_accessory,
      COALESCE((
        SELECT jsonb_object_agg(r.subject_id, r.points)
        FROM rank_scores AS r JOIN current_season AS season USING (season_no)
        WHERE r.user_id = u.id
      ), '{}'::jsonb) AS rank_scores,
      COALESCE((
        SELECT jsonb_agg(mp.result ORDER BY m.finished_at, m.id)
        FROM match_players AS mp JOIN matches AS m ON m.id = mp.match_id
        JOIN current_season AS season ON season.season_no = m.season_no
        JOIN coin_ledger AS c ON c.match_id = m.id AND c.user_id = mp.user_id AND c.kind = 'MATCH_REWARD'
        WHERE mp.user_id = u.id AND m.mode = 'RANKED' AND m.status = 'FINISHED' AND mp.result IS NOT NULL
      ), '[]'::jsonb) AS ranked_results
    FROM users AS u LEFT JOIN user_settings AS s ON s.user_id = u.id
    LEFT JOIN pets AS p ON p.id = u.equipped_pet_id
    LEFT JOIN accessories AS a ON a.id = u.equipped_accessory_id
    WHERE u.id = $1
  `, [user.id]);

  let winStreak = 0;
  let bestWinStreak = 0;
  for (const result of details.ranked_results) {
    winStreak = result === 'WIN' ? winStreak + 1 : 0;
    bestWinStreak = Math.max(bestWinStreak, winStreak);
  }

  const equippedPet = details?.equipped_pet ?? null;
  const petDisplay = equippedPet && petCatalog.find(pet => pet.serverId === equippedPet.id);
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    display_name: user.display_name,
    role: user.role,
    created_at: user.created_at,
    xp: user.xp,
    coin_balance: user.coin_balance,
    streak_days: user.streak_days,
    last_active_date: user.last_active_date,
    equipped_pet_id: user.equipped_pet_id,
    equipped_accessory_id: user.equipped_accessory_id,
    google_linked: Boolean(user.google_sub),
    google_verified_email: user.google_verified_email,
    has_password: user.password_hash !== null,
    level: deriveUserLevel(user.xp),
    level_progress: levelProgress(user.xp),
    rank_title: deriveRankTitle(user.xp),
    rank_scores: details.rank_scores,
    rank_win_streak: winStreak,
    rank_best_win_streak: bestWinStreak,
    equipped_pet: equippedPet && { ...equippedPet, frontend_id: petDisplay?.id ?? equippedPet.id, icon: petDisplay?.icon ?? '🐾' },
    equipped_accessory: details?.equipped_accessory ?? null,
    theme: details?.theme ?? 'DARK',
    sound_enabled: details?.sound_enabled ?? true,
    sound_config: details?.sound_config ?? null,
    tutorial_progress: details?.tutorial_progress ?? null
  };
}

function normalizeIdentifier(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function validateDisplayName(value) {
  const name = typeof value === 'string' ? value.trim() : '';
  if (!name || name.length > 100) throw new Error('Tên hiển thị cần có từ 1 đến 100 ký tự.');
  return name;
}

async function createAccount(tx, { username, email, display_name, password_hash = null,
  google_sub = null, google_verified_email = null }) {
  const user = await tx.queryOne(
    'INSERT INTO users (username, email, display_name, password_hash, google_sub, google_verified_email)'
      + ' VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [username, email, display_name, password_hash, google_sub, google_verified_email]
  );
  await tx.execute('INSERT INTO user_settings (user_id) VALUES ($1)', [user.id]);
  await tx.execute("INSERT INTO user_pets (user_id, pet_id) VALUES ($1, 'pet_sparky')", [user.id]);
  return tx.queryOne("UPDATE users SET equipped_pet_id = 'pet_sparky' WHERE id = $1 RETURNING *", [user.id]);
}

async function register({ username, email, password, display_name }) {
  let accountName = normalizeIdentifier(username);
  let accountEmail = normalizeIdentifier(email);
  if (accountName.includes('@')) {
    accountEmail ||= accountName;
    accountName = accountName.split('@', 1)[0];
  }
  if (!accountName || accountName.length > 100) {
    throw new Error('Vui lòng nhập tên đăng nhập hợp lệ.');
  }
  accountEmail ||= accountName + '@hocvien.tok.vn';
  if (accountEmail.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail)) {
    throw new Error('Vui lòng nhập email hợp lệ.');
  }
  const displayName = validateDisplayName(display_name || username);
  validatePassword(password, [accountName, accountEmail]);
  const passwordHash = await hashPassword(password);

  try {
    const user = await db.transaction(tx => createAccount(tx, {
      username: accountName, email: accountEmail, display_name: displayName, password_hash: passwordHash
    }));
    return { token: generateToken(user, { auth_method: 'PASSWORD' }), user: await formatUserResponse(user) };
  } catch (error) {
    if (error.code === '23505' && ['users_username_key', 'users_email_key'].includes(error.constraint)) {
      throw new Error('Tên đăng nhập hoặc email đã được sử dụng.');
    }
    throw error;
  }
}

async function login({ username, password }) {
  const identifier = normalizeIdentifier(username);
  if (!identifier || typeof password !== 'string' || !password) {
    throw new Error('Vui lòng nhập tên đăng nhập hoặc email và mật khẩu.');
  }
  const user = await db.queryOne(
    'SELECT * FROM users WHERE username = $1 OR email = $1 ORDER BY xp DESC, created_at, id LIMIT 1',
    [identifier]
  );
  if (!user || user.disabled_at || user.role === 'SYSTEM' || !await verifyPassword(password, user.password_hash)) {
    throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
  }
  return issueSession(user, { auth_method: 'PASSWORD' });
}

async function issueSession(user, options = {}) {
  const result = await db.transaction(async tx => {
    const current = await tx.queryOne('SELECT * FROM users WHERE id = $1 FOR UPDATE', [user.id]);
    assertInteractiveUser(current);
    if (current.session_version !== user.session_version || current.password_hash !== user.password_hash
        || current.google_sub !== user.google_sub || current.google_verified_email !== user.google_verified_email) {
      throw new Error('Thông tin đăng nhập đã thay đổi. Vui lòng đăng nhập lại.');
    }

    const { now } = await tx.queryOne('SELECT clock_timestamp() AS now');
    const streak = evaluateStreak(current.last_active_date, toVietnamDateString(now), current.streak_days);
    if (streak.shouldUpdateDate) {
      await tx.execute('UPDATE users SET streak_days = $1, last_active_date = $2 WHERE id = $3',
        [streak.newStreak, streak.todayStr, current.id]);
      current.streak_days = streak.newStreak;
      current.last_active_date = streak.todayStr;
      if (streak.streakIncremented) {
        const reward = await mutateCoinsInTransaction(tx, current.id, 5 * streak.newStreak, 'STREAK_REWARD', {
          note: 'Thưởng chuỗi học ' + streak.newStreak + ' ngày liên tiếp',
          occurred_at: now
        });
        current.coin_balance = reward.coin_balance;
      }
    }
    return { user: current, streak };
  });

  return {
    token: generateToken(result.user, options),
    user: await formatUserResponse(result.user),
    streak_info: result.streak
  };
}

async function getCurrentUser(userId) {
  const user = await db.queryOne('SELECT * FROM users WHERE id = $1', [userId]);
  assertInteractiveUser(user);
  return formatUserResponse(user);
}

function validateSoundConfig(config) {
  if (config === null) return null;
  if (typeof config !== 'object' || Array.isArray(config) ||
      Object.entries(config).some(([key, value]) => !allowedAudioChannels.has(key) || typeof value !== 'boolean')) {
    throw new Error('Cài đặt âm thanh không hợp lệ.');
  }
  return config;
}

function validateTutorialProgress(progress) {
  if (progress === null) return null;
  if (!progress || typeof progress.step !== 'string' || !progress.step.trim() || progress.step.length > 100
      || !['desktop', 'mobile'].includes(progress.layout)) {
    throw new Error('Tiến độ hướng dẫn không hợp lệ.');
  }
  const context = progress.context ?? null;
  if (context !== null && (typeof context !== 'object' || Array.isArray(context)
      || Buffer.byteLength(JSON.stringify(context), 'utf8') > 65536)) {
    throw new Error('Tiến độ hướng dẫn quá lớn hoặc không hợp lệ.');
  }
  return { version: 2, step: progress.step, layout: progress.layout, completed: Boolean(progress.completed), context };
}

async function updateSettings(userId, { theme, sound_enabled, display_name, sound_config, tutorial_progress }) {
  if (theme !== undefined && !['LIGHT', 'DARK'].includes(theme)) {
    throw new Error('Chế độ giao diện không hợp lệ.');
  }
  if (sound_enabled !== undefined && typeof sound_enabled !== 'boolean') {
    throw new Error('Trạng thái âm thanh không hợp lệ.');
  }
  const settings = {
    theme,
    sound_enabled,
    sound_config: sound_config === undefined ? undefined : validateSoundConfig(sound_config),
    tutorial_progress: tutorial_progress === undefined ? undefined : validateTutorialProgress(tutorial_progress)
  };
  const displayName = display_name === undefined ? undefined : validateDisplayName(display_name);

  return db.transaction(async tx => {
    const user = await tx.queryOne('SELECT * FROM users WHERE id = $1 FOR UPDATE', [userId]);
    assertInteractiveUser(user);
    const current = await tx.queryOne(
      'SELECT theme, sound_enabled, sound_config, tutorial_progress FROM user_settings WHERE user_id = $1',
      [userId]
    );
    const next = {
      theme: current?.theme ?? 'DARK',
      sound_enabled: current?.sound_enabled ?? true,
      sound_config: current?.sound_config ?? null,
      tutorial_progress: current?.tutorial_progress ?? null
    };
    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined) next[key] = value;
    }
    await tx.execute(
      'INSERT INTO user_settings (user_id, theme, sound_enabled, sound_config, tutorial_progress)'
        + ' VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id) DO UPDATE'
        + ' SET theme = EXCLUDED.theme, sound_enabled = EXCLUDED.sound_enabled,'
        + ' sound_config = EXCLUDED.sound_config, tutorial_progress = EXCLUDED.tutorial_progress',
      [userId, next.theme, next.sound_enabled, next.sound_config, next.tutorial_progress]
    );
    if (displayName !== undefined) {
      await tx.execute('UPDATE users SET display_name = $1 WHERE id = $2', [displayName, userId]);
      user.display_name = displayName;
    }
    return formatUserResponse(user, tx);
  });
}

async function updateAccount(userId, { display_name, username }) {
  const name = display_name === undefined ? undefined : validateDisplayName(display_name);
  const accountName = username === undefined ? undefined : normalizeIdentifier(username);
  if (accountName !== undefined && !/^[a-z0-9_.-]{3,50}$/.test(accountName)) {
    throw new Error('Tên đăng nhập gồm 3–50 chữ thường, số, dấu chấm, gạch dưới hoặc gạch ngang.');
  }
  try {
    const user = await db.transaction(async tx => {
      const current = await tx.queryOne('SELECT * FROM users WHERE id = $1 FOR UPDATE', [userId]);
      assertInteractiveUser(current);
      return tx.queryOne('UPDATE users SET display_name = $1, username = $2 WHERE id = $3 RETURNING *',
        [name ?? current.display_name, accountName ?? current.username, userId]);
    });
    return { user: await formatUserResponse(user), token: generateToken(user) };
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'users_username_key') {
      throw new Error('Tên đăng nhập đã được sử dụng.');
    }
    throw error;
  }
}

async function changePassword(userId, { current_password, new_password }, sessionIssuedAt, authMethod) {
  const updated = await db.transaction(async tx => {
    const user = await tx.queryOne('SELECT * FROM users WHERE id = $1 FOR UPDATE', [userId]);
    assertInteractiveUser(user);
    if (user.password_hash) {
      if (!await verifyPassword(current_password, user.password_hash)) {
        throw new Error('Mật khẩu hiện tại không chính xác.');
      }
    } else {
      const elapsed = Date.now() / 1000 - sessionIssuedAt;
      if (!user.google_sub || authMethod !== 'GOOGLE' || !Number.isFinite(elapsed) || elapsed < 0 || elapsed > 600) {
        throw new Error('Hãy đăng nhập lại bằng Google trước khi tạo mật khẩu.');
      }
    }
    validatePassword(new_password, [user.username, user.email, user.google_verified_email]);
    if (user.password_hash && await verifyPassword(new_password, user.password_hash)) {
      throw new Error('Hãy chọn mật khẩu khác mật khẩu hiện tại.');
    }
    const passwordHash = await hashPassword(new_password);
    const changedUser = await tx.queryOne(
      'UPDATE users SET password_hash = $1, session_version = session_version + 1 WHERE id = $2 RETURNING *',
      [passwordHash, userId]
    );
    await tx.execute('DELETE FROM password_resets WHERE user_id = $1', [userId]);
    return changedUser;
  });
  return { updated: true, token: generateToken(updated, { auth_method: 'PASSWORD' }) };
}

module.exports = {
  changePassword,
  createAccount,
  formatUserResponse,
  generateToken,
  getCurrentUser,
  issueSession,
  login,
  register,
  updateAccount,
  updateSettings
};

const MAX_LIVES = 5;

function replayExtreme(attempts, poolSize) {
  const stats = { answer_count: 0, correct_count: 0, best_combo: 0, combo: 0, score: 0, round: 1, lives: MAX_LIVES };
  for (const attempt of attempts) {
    stats.round = Math.floor(stats.answer_count / poolSize) + 1;
    stats.answer_count++;
    if (!attempt.is_correct) {
      stats.combo = 0;
      stats.lives--;
      continue;
    }
    stats.correct_count++;
    stats.combo++;
    stats.best_combo = Math.max(stats.best_combo, stats.combo);
    const multiplier = stats.combo >= 10 ? 3 : stats.combo >= 6 ? 2 : stats.combo >= 3 ? 1.5 : 1;
    stats.score += Math.round(10 * multiplier * (1 + (stats.round - 1) * 0.5));
    if (stats.combo % 10 === 0) stats.lives = Math.min(MAX_LIVES, stats.lives + 1);
  }
  return stats;
}

function extremeSummary(stats, elapsedMilliseconds) {
  return {
    answer_count: stats.answer_count,
    correct_count: stats.correct_count,
    best_combo: stats.best_combo,
    score: stats.score,
    round: stats.round,
    duration_seconds: Math.max(0, Math.round(elapsedMilliseconds / 1000))
  };
}

function extremeRewards({ correct_count: correct, best_combo: combo, score, round }) {
  return {
    coins: Math.min(250, Math.floor(score / 40) + correct * 2 + combo * 3),
    xp: Math.min(600, correct * 6 + combo * 10 + (round - 1) * 60)
  };
}

function extremeBadge(correct) {
  if (correct >= 50) return 'Huyền Thoại Bất Tử';
  if (correct >= 30) return 'Bậc Thầy Bền Bỉ';
  if (correct >= 15) return 'Dũng Giả Bất Khuất';
  if (correct >= 5) return 'Chiến Binh Sinh Tồn';
  return 'Tập Sự Cực Hạn';
}

function extremePrompt({ type, stem, payload }) {
  if (type === 'FILL_BLANK') return payload.sentence_template.replace('{blank}', '______');
  if (type === 'MATCHING') return 'Nội dung nào tương ứng với “' + payload.pairs[0].left + '”?';
  if (type === 'ORDERING') return stem + ' (Đâu là trình tự đúng?)';
  return stem;
}

module.exports = { MAX_LIVES, replayExtreme, extremeSummary, extremeRewards, extremeBadge, extremePrompt };

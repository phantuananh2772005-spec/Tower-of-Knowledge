const express = require('express');
const extremeService = require('../services/extreme.service');
const { optionalAuthenticate } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(optionalAuthenticate);

function extremeOperation(errorCode, required, optional, operation) {
  return async (req, res) => {
    try {
      const body = req.body === undefined ? {} : req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body)
        || required.some(key => !Object.hasOwn(body, key))
        || Object.keys(body).some(key => !required.includes(key) && !optional.includes(key))) {
        return res.apiError('Dữ liệu Cực Hạn không hợp lệ hoặc có trường không được hỗ trợ.', errorCode, 400);
      }
      return res.apiSuccess(await operation(req.user?.id ?? null, body));
    } catch (error) {
      const message = error.severity ? 'Không thể xử lý dữ liệu phiên Cực Hạn.' : error.message;
      return res.apiError(message, errorCode, error.status ?? 400);
    }
  };
}

router.post('/start', extremeOperation('START_EXTREME_FAILED', [], ['subject_id'],
  (userId, body) => extremeService.startSession(body.subject_id, userId)
));

router.post('/next-batch', extremeOperation('NEXT_BATCH_FAILED', ['session_id'], ['exclude_positions'],
  (userId, body) => extremeService.getNextBatch(userId, body)
));

router.post('/check-answer', extremeOperation('CHECK_ANSWER_FAILED', ['session_id', 'attempt_no', 'position'],
  ['selected_option_position', 'submitted_text', 'response'], (userId, body) => extremeService.gradeSession(userId, body)
));

router.post('/finish', extremeOperation('FINISH_EXTREME_FAILED', ['session_id'], [],
  (userId, body) => extremeService.finishSession(userId, body)
));

module.exports = router;

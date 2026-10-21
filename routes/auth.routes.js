const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/register', async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return res.apiSuccess(result, 201);
  } catch (err) {
    return res.apiError(err.message, 'REGISTRATION_FAILED', 400);
  }
});

router.post('/login', async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'LOGIN_FAILED', 401);
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.ma_nguoi_dung);
    return res.apiSuccess(user);
  } catch (err) {
    return res.apiError(err.message, 'USER_NOT_FOUND', 404);
  }
});

router.put('/settings', authenticate, async (req, res) => {
  try {
    const updated = await authService.updateSettings(req.user.ma_nguoi_dung, req.body);
    return res.apiSuccess(updated);
  } catch (err) {
    return res.apiError(err.message, 'UPDATE_FAILED', 400);
  }
});

module.exports = router;

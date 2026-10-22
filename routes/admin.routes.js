const express = require('express');
const router = express.Router();
const adminService = require('../services/admin.service');
const { requireAdmin } = require('../middlewares/auth.middleware');

// All admin routes require QUAN_TRI_VIEN
router.use(requireAdmin);

// Analytics
router.get('/stats', async (req, res) => {
  try {
    const stats = await adminService.getSystemStats();
    return res.apiSuccess(stats);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_STATS_FAILED', 500);
  }
});

// Courses
router.post('/courses', async (req, res) => {
  try {
    const course = await adminService.createCourse(req.body);
    return res.apiSuccess(course, 201);
  } catch (err) {
    return res.apiError(err.message, 'CREATE_COURSE_FAILED', 400);
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const course = await adminService.updateCourse(req.params.id, req.body);
    return res.apiSuccess(course);
  } catch (err) {
    return res.apiError(err.message, 'UPDATE_COURSE_FAILED', 400);
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    const result = await adminService.deleteCourse(req.params.id);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'DELETE_COURSE_FAILED', 400);
  }
});

// Chapters
router.post('/chapters', async (req, res) => {
  try {
    const chapter = await adminService.createChapter(req.body);
    return res.apiSuccess(chapter, 201);
  } catch (err) {
    return res.apiError(err.message, 'CREATE_CHAPTER_FAILED', 400);
  }
});

router.put('/chapters/:id', async (req, res) => {
  try {
    const chapter = await adminService.updateChapter(req.params.id, req.body);
    return res.apiSuccess(chapter);
  } catch (err) {
    return res.apiError(err.message, 'UPDATE_CHAPTER_FAILED', 400);
  }
});

router.delete('/chapters/:id', async (req, res) => {
  try {
    const result = await adminService.deleteChapter(req.params.id);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'DELETE_CHAPTER_FAILED', 400);
  }
});

// Checkpoints
router.post('/checkpoints', async (req, res) => {
  try {
    const checkpoint = await adminService.createCheckpoint(req.body);
    return res.apiSuccess(checkpoint, 201);
  } catch (err) {
    return res.apiError(err.message, 'CREATE_CHECKPOINT_FAILED', 400);
  }
});

router.put('/checkpoints/:id', async (req, res) => {
  try {
    const checkpoint = await adminService.updateCheckpoint(req.params.id, req.body);
    return res.apiSuccess(checkpoint);
  } catch (err) {
    return res.apiError(err.message, 'UPDATE_CHECKPOINT_FAILED', 400);
  }
});

router.delete('/checkpoints/:id', async (req, res) => {
  try {
    const result = await adminService.deleteCheckpoint(req.params.id);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'DELETE_CHECKPOINT_FAILED', 400);
  }
});

// Question Bank
router.get('/questions', async (req, res) => {
  try {
    const questions = await adminService.listQuestions(req.query);
    return res.apiSuccess(questions);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_QUESTIONS_FAILED', 500);
  }
});

router.post('/questions', async (req, res) => {
  try {
    const question = await adminService.createQuestion(req.body);
    return res.apiSuccess(question, 201);
  } catch (err) {
    return res.apiError(err.message, 'CREATE_QUESTION_FAILED', 400);
  }
});

router.put('/questions/:id', async (req, res) => {
  try {
    const question = await adminService.updateQuestion(req.params.id, req.body);
    return res.apiSuccess(question);
  } catch (err) {
    return res.apiError(err.message, 'UPDATE_QUESTION_FAILED', 400);
  }
});

router.delete('/questions/:id', async (req, res) => {
  try {
    const result = await adminService.deleteQuestion(req.params.id);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'DELETE_QUESTION_FAILED', 400);
  }
});

router.post('/questions/bulk', async (req, res) => {
  try {
    const { questions, default_moc_id } = req.body;
    const result = await adminService.bulkImportQuestions(questions, default_moc_id);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'BULK_IMPORT_FAILED', 400);
  }
});

// Users Management
router.get('/users', async (req, res) => {
  try {
    const users = await adminService.listUsers();
    return res.apiSuccess(users);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_USERS_FAILED', 500);
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { vai_tro } = req.body;
    const result = await adminService.updateUserRole(req.params.id, vai_tro);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'UPDATE_ROLE_FAILED', 400);
  }
});

router.post('/users/:id/coins', async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const result = await adminService.adjustUserCoins(req.params.id, parseInt(amount, 10), reason);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'ADJUST_COINS_FAILED', 400);
  }
});

// Activity and Learning Logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await adminService.getActivityLogs();
    return res.apiSuccess(logs);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_LOGS_FAILED', 500);
  }
});

// Comprehensive Learning Activity Feed (Recent Sessions + System Summary)
router.get('/learning-activity', async (req, res) => {
  try {
    const data = await adminService.getLearningActivityFeed();
    return res.apiSuccess(data);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_LEARNING_ACTIVITY_FAILED', 500);
  }
});

// Learners Telemetry Directory (All registered users with aggregated telemetry)
router.get('/learners', async (req, res) => {
  try {
    const data = await adminService.getLearnersTelemetryList();
    return res.apiSuccess(data);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_LEARNERS_FAILED', 500);
  }
});

// Learner Deep Telemetry (Full test history, per-question analytics, memory map)
router.get('/learners/:id/telemetry', async (req, res) => {
  try {
    const data = await adminService.getLearnerDeepTelemetry(req.params.id);
    return res.apiSuccess(data);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_LEARNER_TELEMETRY_FAILED', 500);
  }
});

// All System Coin Transactions
router.get('/transactions', async (req, res) => {
  try {
    const tx = await adminService.getAllTransactions();
    return res.apiSuccess(tx);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_TRANSACTIONS_FAILED', 500);
  }
});

// Pets Management
router.get('/pets', async (req, res) => {
  try {
    const pets = await adminService.listPets();
    return res.apiSuccess(pets);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_PETS_FAILED', 500);
  }
});

router.post('/pets', async (req, res) => {
  try {
    const pet = await adminService.createPet(req.body);
    return res.apiSuccess(pet, 201);
  } catch (err) {
    return res.apiError(err.message, 'CREATE_PET_FAILED', 400);
  }
});

router.put('/pets/:id', async (req, res) => {
  try {
    const pet = await adminService.updatePet(req.params.id, req.body);
    return res.apiSuccess(pet);
  } catch (err) {
    return res.apiError(err.message, 'UPDATE_PET_FAILED', 400);
  }
});

router.delete('/pets/:id', async (req, res) => {
  try {
    const result = await adminService.deletePet(req.params.id);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'DELETE_PET_FAILED', 400);
  }
});

module.exports = router;

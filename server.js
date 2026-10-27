/**
 * Tower of Knowledge - Main Server
 * Express 4 + Socket.IO + PostgreSQL / MSSQL
 */

require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const { responseFormatter } = require('./middlewares/response.middleware');
const { initArenaSocket } = require('./sockets/arena.socket');

// Import routes
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const petRoutes = require('./routes/pet.routes');
const arenaRoutes = require('./routes/arena.routes');
const economyRoutes = require('./routes/economy.routes');
const adminRoutes = require('./routes/admin.routes');
const extremeRoutes = require('./routes/extreme.routes');
const petStudioRoutes = require('./routes/petStudioRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.set('io', io);
initArenaSocket(io);

// Core Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(responseFormatter);

// Serve static assets & frontend applications
app.use(express.static(path.join(__dirname, 'public')));

// Admin Redirects
app.get('/admin.html', (req, res) => {
  res.redirect('/admin/');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.apiSuccess({
    status: 'HEALTHY',
    version: 'd901b3a_v6',
    database: process.env.DATABASE_URL ? 'PostgreSQL' : 'MSSQL'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', courseRoutes);
app.use('/api', petRoutes);
app.use('/api/arena', arenaRoutes);
app.use('/api/economy', economyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/extreme', extremeRoutes);
app.use('/api/pet-studio', petStudioRoutes);

// Fallback 404 handler
app.use('/api/*', (req, res) => {
  res.apiError('Endpoint API không tồn tại.', 'NOT_FOUND', 404);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Đã xảy ra lỗi nội bộ trên máy chủ.'
    },
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 TOWER OF KNOWLEDGE SERVER IS RUNNING ON PORT ${PORT}`);
  console.log(`📚 Learner UI: http://localhost:${PORT}/`);
  console.log(`🛡️ Admin Portal: http://localhost:${PORT}/admin/`);
  console.log(`📖 API Health: http://localhost:${PORT}/health`);
  console.log(`================================================================`);

  // Ensure Chapter 1 has 5 checkpoints and full question set (self-healing seed)
  setTimeout(() => {
    try {
      const { initTelemetrySchema } = require('./database/init_telemetry');
      initTelemetrySchema().catch(e => console.warn('⚠️ [STARTUP] Telemetry schema notice:', e.message));

      const ch1Seeder = require('./scripts/seed_chapter1_5levels');
      ch1Seeder.runSeed()
        .then(() => console.log('✅ [STARTUP] Chapter 1 5-level database sync completed!'))
        .catch(err => console.warn('⚠️ [STARTUP] Chapter 1 seed notice:', err.message));
    } catch (e) {
      console.warn('⚠️ [STARTUP] Chapter 1 seeder load notice:', e.message);
    }
  }, 1000);
});

module.exports = { app, server };

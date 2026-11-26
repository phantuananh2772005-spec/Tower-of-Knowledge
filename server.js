/**
 * Tower of Knowledge - Main Server
 * Express 4 + Socket.IO + local PostgreSQL V1
 */

const { port, host } = require('./config/local-env');
const db = require('./database/db');
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
app.use('/design/map-assets/optimized', express.static(path.join(__dirname, 'public/design/map-assets/optimized'), { maxAge: '7d' }));
app.get('/admin.html', (req, res) => {
  res.redirect('/admin/');
});

app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.apiSuccess({
    status: 'HEALTHY',
    version: '1.2.0-contextual-learning',
    database: 'PostgreSQL'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', courseRoutes);
app.use('/api', require('./routes/profile.routes'));
app.use('/api', petRoutes);
app.use('/api/arena', arenaRoutes);
app.use('/api/economy', economyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/extreme', extremeRoutes);
app.use('/api/pet-studio', petStudioRoutes);
app.use('/api/items', require('./routes/inventory.routes'));

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

async function start() {
  await db.verifyRuntime();
  app.set('ruleConstants', await db.loadRuleConstants());
  server.listen(port, host, () => {
    console.log('Tower of Knowledge listening on port ' + port);
  });
}

start().catch(async error => {
  console.error('[STARTUP] PostgreSQL V1 initialization failed:', error.message);
  await db.close();
  process.exitCode = 1;
});

module.exports = { app, server };

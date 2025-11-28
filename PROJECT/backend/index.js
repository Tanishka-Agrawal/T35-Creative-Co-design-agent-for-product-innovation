// Ensure app is created before it's used
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');

const app = express(); // <-- this must be before any app.use calls

// Security headers
app.use(helmet());

// CORS with credentials
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Body & cookies
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

// Health endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Dev-only diagnostics and helpers (unsafe for production)
if ((process.env.NODE_ENV || 'development') === 'development') {
  const getSupabase = require('./supabaseClient');
  const getAdminSupabase = require('./supabaseClient').getAdminSupabase;

  // Dev-only: expose a token helper to inspect in-memory verification tokens
  app.get('/internal/dev-token', async (req, res) => {
    try {
      const { email } = req.query || {};
      if (!email) return res.status(400).json({ error: 'Missing email' });
      const UserStore = require('./models/UserStore');
      const u = await UserStore.findOne({ email });
      if (!u) return res.status(404).json({ error: 'not found' });
      res.json({ verifyToken: u.verifyToken, verifyTokenExpires: u.verifyTokenExpires });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dev-only: supabase connectivity check (attempts to sign up a temporary user and optionally deletes it)
  app.get('/internal/supabase-check', async (req, res) => {
    try {
      const supabase = await getSupabase();
      const testEmail = `supacheck-${Date.now()}@example.test`;
      const password = 'Check1234!';
      const { data, error } = await supabase.auth.signUp({ email: testEmail, password });
      if (error) return res.status(500).json({ ok: false, error: error.message });
      // Try to delete the user if we can (admin key set)
      let deleted = false;
      try {
        const admin = await getAdminSupabase();
        if (admin) {
          await admin.auth.admin.deleteUser(data.user.id);
          deleted = true;
        }
      } catch (errDel) {
        // ignore deletion error
      }
      res.json({ ok: true, created: data.user, deleted });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get('/internal/status', async (req, res) => {
    const supabaseConfigured = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
    const supabaseServiceKeyConfigured = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const mongoConfigured = !!process.env.MONGODB_URI;
    return res.json({ ok: true, env: process.env.NODE_ENV || 'development', SUPABASE_URL: supabaseConfigured, SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKeyConfigured, MONGODB_URI: mongoConfigured, USE_LOCAL_AUTH: process.env.USE_LOCAL_AUTH || 'false' });
  });

  app.get('/internal/supabase-users', async (req, res) => {
    try {
      const admin = await getAdminSupabase();
      const { data, error } = await admin.auth.admin.listUsers();
      if (error) return res.status(500).json({ ok: false, error: error.message });
      return res.json({ ok: true, total: data?.length || 0, users: data?.slice(0, 20) || [] });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  });
}

// Serve static frontend next
app.use(express.static(path.join(__dirname, '..', 'mini')));

// SPA/HTML fallback for non-API routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'mini', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// MongoDB connection: optional
const mongoUri = process.env.MONGODB_URI;

function startServer() {
  const port = Number(process.env.PORT) || 5000;
  const host = process.env.HOST || '127.0.0.1';
  app.listen(port, host, () => {
    console.log(`Server listening on ${host}:${port}`);
    console.log(`CORS allowed origin: ${allowedOrigin}`);
  });
}

if (mongoUri) {
  mongoose
    .connect(mongoUri, { autoIndex: true })
    .then(() => {
      console.log('MongoDB connected');
      startServer();
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
} else {
  console.log('No MONGODB_URI found; using in-memory user store.');
  // Add additional error handlers to log unexpected issues
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
  });
  startServer();
}

// Dev-only: supabase connectivity check (attempts to sign up a temporary user and optionally deletes it)
if ((process.env.NODE_ENV || 'development') === 'development') {
  const getSupabase = require('./supabaseClient');
  const getAdminSupabase = require('./supabaseClient').getAdminSupabase;
  app.get('/internal/supabase-check', async (req, res) => {
    try {
      const supabase = await getSupabase();
      const testEmail = `supacheck-${Date.now()}@example.test`;
      const password = 'Check1234!';
      const { data, error } = await supabase.auth.signUp({ email: testEmail, password });
      if (error) return res.status(500).json({ ok: false, error: error.message });
      // Try to delete the user if we can (admin key set)
      let deleted = false;
      try {
        const admin = await getAdminSupabase();
        if (admin) {
          await admin.auth.admin.deleteUser(data.user.id);
          deleted = true;
        }
      } catch (errDel) {
        // ignore deletion error
      }
      res.json({ ok: true, created: data.user, deleted });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });
}
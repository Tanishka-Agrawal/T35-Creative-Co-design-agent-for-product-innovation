// routes/auth.js — support Supabase and fallback to in-memory store
const express = require('express');
const getSupabase = require('../supabaseClient');
const UserStore = require('../models/UserStore');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();
const SUPABASE_CONFIGURED = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
let useLocal = ((process.env.USE_LOCAL_AUTH || 'false').trim().toLowerCase() === 'true') || !SUPABASE_CONFIGURED;
// Don't force local auth in dev: prefer SUPABASE if configured; allow USE_LOCAL_AUTH to override
console.log('AUTH useLocal (resolved):', useLocal, 'SUPABASE_CONFIGURED:', SUPABASE_CONFIGURED, 'USE_LOCAL_AUTH:', process.env.USE_LOCAL_AUTH);

// Helper to sign JWT for fallback mode
function signToken(userId) {
  if (!process.env.JWT_SECRET) throw new Error('Missing JWT_SECRET in environment for fallback auth');
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Helper to send verification emails. Uses SMTP config if provided or Ethereal for dev
async function sendVerificationEmail(to, token) {
  const baseUrl = `http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 5000}`;
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${encodeURIComponent(token)}`;

  // build message
  const subject = 'Verify your email for Online Fertilizer Portal';
  const html = `<p>Click the link below to verify your email:</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>This link expires in 24 hours.</p>`;

  // If SMTP config available, use it. Otherwise, create a test account and log preview URL
  const smtpHost = process.env.SMTP_HOST;
  if (smtpHost) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: (process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    await transporter.sendMail({ from: process.env.FROM_EMAIL || 'noreply@example.com', to, subject, html });
    return null;
  } else {
    // dev/test: ethereal
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    const info = await transporter.sendMail({ from: 'noreply@fertilizer-portal.test', to, subject, html });
    return nodemailer.getTestMessageUrl(info);
  }
}

router.post('/register', async (req, res, next) => {
  try {
    console.log('Register endpoint; useLocal:', useLocal);
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    // const useLocal is read from module-scope variable defined above
    try {
      if (!useLocal) {
        const supabase = await getSupabase();
        // If we have Supabase configured, prefer it
        const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) {
        const status = error.message && error.message.toLowerCase().includes('already') ? 409 : 400;
        return res.status(status).json({ error: error.message });
      }
      const user = data.user;
        if (!user) return res.status(500).json({ error: 'User not returned from Supabase' });
        return res.status(201).json({ id: user.id, name: user.user_metadata?.name || '', email: user.email });
      }
    } catch (err) {
      // Supabase not available; fallback to in-memory store
    }

    // Fallback: create user in local in-memory store
    const existing = await UserStore.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);
    const user = await UserStore.create({ name, email, password: hash });
    // Return a JWT token cookie for consistent client behavior
    // Create verification token and send email
    const verifyToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await UserStore.setVerifyToken(user._id, verifyToken, expiresAt);
    const previewUrl = await sendVerificationEmail(user.email, verifyToken);
    return res.status(201).json({ id: user._id, name: user.name, email: user.email, verificationSent: true, previewUrl });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    console.log('Login endpoint; useLocal:', useLocal);
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    try {
      if (!useLocal) {
        const supabase = await getSupabase();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data || !data.session || !data.user) return res.status(401).json({ error: error?.message || 'Invalid credentials' });
        const { session, user } = data;
      const emailConfirmedAt = user.email_confirmed_at || user.confirmed_at;
      if (!emailConfirmedAt) return res.status(403).json({ error: 'Please verify your email before logging in.' });
      const token = session.access_token;
      return res.cookie('token', token, {
        httpOnly: true,
        secure: (process.env.NODE_ENV || 'development') === 'production',
        sameSite: (process.env.NODE_ENV || 'development') === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }).status(200).json({ id: user.id, name: user.user_metadata?.name || '', email: user.email });
      }
    } catch (err) {
      // Fallthrough to fallback mode
    }

    // Fallback: local user store
    const user = await UserStore.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.verified) {
      // if not verified, resend verification and deny login
      const verifyToken = crypto.randomBytes(24).toString('hex');
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      await UserStore.setVerifyToken(user._id, verifyToken, expiresAt);
      const previewUrl = await sendVerificationEmail(user.email, verifyToken);
      return res.status(403).json({ error: 'Please verify your email before logging in.', verificationSent: true, previewUrl });
    }

    const token = signToken(user._id);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' }).status(200).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: (process.env.NODE_ENV || 'development') === 'production',
    sameSite: (process.env.NODE_ENV || 'development') === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ ok: true });
});

module.exports = router;

// Verify route for local tokens
router.get('/verify', async (req, res, next) => {
  try {
    const { token } = req.query || {};
    if (!token) return res.status(400).json({ error: 'Missing token' });
    const user = await UserStore.findByVerifyToken(token);
    if (!user) return res.status(400).json({ error: 'Invalid token' });
    if (!user.verifyTokenExpires || user.verifyTokenExpires < Date.now()) {
      return res.status(400).json({ error: 'Token expired' });
    }
    await UserStore.setVerified(user._id);
    // Optional: sign token and set cookie so user is logged in immediately
    const jwtToken = signToken(user._id);
    res.cookie('token', jwtToken, { httpOnly: true, sameSite: 'lax' });
    return res.status(200).json({ ok: true, message: 'Email verified' });
  } catch (err) {
    next(err);
  }
});
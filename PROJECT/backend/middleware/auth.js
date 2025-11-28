// Auth middleware: verifies Supabase access token OR fallback JWT
const jwt = require('jsonwebtoken');
const getSupabase = require('../supabaseClient');
const UserStore = require('../models/UserStore');

module.exports = async function auth(req, res, next) {
  const cookieToken = req.cookies?.token;
  const header = req.headers.authorization || '';
  const headerToken = header.startsWith('Bearer ') ? header.slice(7) : null;
  const token = cookieToken || headerToken;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Prefer Supabase if available
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data && data.user) {
        req.user = data.user;
        req.userId = data.user.id;
        return next();
      }
      // if it fails, fall through to JWT check
    } catch (err) {
      // supabase not configured; we'll verify JWT next
    }

    // Fallback to JWT-based auth
    if (!process.env.JWT_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload && payload.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await UserStore.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    req.user = { _id: user._id, email: user.email, name: user.name };
    req.userId = user._id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
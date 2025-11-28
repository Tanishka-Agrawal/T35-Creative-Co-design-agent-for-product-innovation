// User routes: current user info (requires auth)
const express = require('express');
const auth = require('../middleware/auth');
const UserStore = require('../models/UserStore');

const router = express.Router();

router.get('/me', auth, async (req, res, next) => {
  try {
    // If middleware already set req.user (supabase or jwt-based fallback), use it
    if (req.user) {
      const user = req.user;
      return res.status(200).json({ _id: user.id || user._id, name: user.user_metadata?.name || user.name, email: user.email });
    }

    // Otherwise, look up by id in in-memory store
    const user = await UserStore.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ _id: user._id, name: user.name, email: user.email });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
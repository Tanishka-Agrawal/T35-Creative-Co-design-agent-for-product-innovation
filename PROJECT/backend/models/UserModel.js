const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verifyToken: { type: String, default: null },
  verifyTokenExpires: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);

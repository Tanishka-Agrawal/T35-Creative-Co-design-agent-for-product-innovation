const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.model("User", UserSchema);

// Signup Route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPass = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ name, email, password: hashedPass });
    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Wrong password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });

  res.json({ message: "Login successful", token });
});

// Protected Route
app.get("/profile", (req, res) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ error: "Token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ userId: decoded.id });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Use Render's PORT environment variable or fallback to 5000 for local
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));

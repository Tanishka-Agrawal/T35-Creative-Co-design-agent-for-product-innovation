const express = require("express");
const router = express.Router();

const db = require("../db");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../utils/otp");
const transporter = require("../utils/emailService");
const auth = require("../middleware/authMiddleware");

const SECRET = "MY_SECRET_KEY";

/* ---------------- SEND SIGNUP OTP ---------------- */
router.post("/send-otp", (req, res) => {
  const { email } = req.body;

  const otp = generateOTP();
  global.signupOTP = otp;
  global.signupEmail = email;

  transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Signup OTP",
    text: `Your OTP is: ${otp}`,
  });

  res.json({ message: "OTP sent successfully" });
});

/* ---------------- VERIFY SIGNUP OTP ---------------- */
router.post("/verify-otp", (req, res) => {
  const { name, email, phone, address, area, otp } = req.body;

  if (otp !== global.signupOTP || email !== global.signupEmail) {
    return res.json({ message: "Invalid OTP" });
  }

  const checkSql = "SELECT * FROM users WHERE email = ? OR phone = ?";
  db.query(checkSql, [email, phone], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    if (result.length > 0) {
      return res.json({ message: "Email or Phone already exists!" });
    }

    const insertSql =
      "INSERT INTO users (name, email, phone, address, area) VALUES (?, ?, ?, ?, ?)";

    db.query(insertSql, [name, email, phone, address, area], () => {
      global.signupOTP = null;
      global.signupEmail = null;

      res.json({ message: "Signup completed successfully!" });
    });
  });
});

/* ---------------- SEND LOGIN OTP ---------------- */
router.post("/login/send-otp", (req, res) => {
  const { email } = req.body;

  const otp = generateOTP();
  global.loginOTP = otp;
  global.loginEmail = email;

  transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Login OTP",
    text: `Your login OTP is: ${otp}`,
  });

  res.json({ message: "Login OTP sent" });
});

/* ---------------- VERIFY LOGIN OTP ---------------- */
router.post("/login/verify", (req, res) => {
  const { email, otp } = req.body;

  if (otp !== global.loginOTP || email !== global.loginEmail)
    return res.json({ message: "Invalid OTP" });

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (result.length === 0)
      return res.json({ message: "User not found" });

    const user = result[0];

    const token = jwt.sign({ email: email }, SECRET, { expiresIn: "1h" });

    global.loginOTP = null;
    global.loginEmail = null;

    res.json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        area: user.area,
      },
    });
  });
});

/* ---------------- PROTECTED ROUTE ---------------- */
router.get("/home", auth, (req, res) => {
  res.json({ message: "Welcome!", user: req.user });
});

module.exports = router;

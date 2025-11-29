const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGen = require("../utils/otp").generateOTP;
const transporter = require("../utils/emailService");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET || "MY_SECRET_KEY";

// TEMP MEMORY
global.signupOTP = null;
global.signupEmail = null;
global.loginOTP = null;
global.loginEmail = null;

/* ----------------------------------------------------
    SEND SIGNUP OTP
---------------------------------------------------- */
exports.sendSignupOTP = (req, res) => {
  const { email } = req.body;

  if (!email) return res.json({ message: "Email is required" });

  const otp = otpGen();
  global.signupOTP = otp;
  global.signupEmail = email;

  transporter.sendMail(
    {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Signup OTP",
      text: `Your Signup OTP is: ${otp}`,
    },
    (err) => {
      if (err) {
        console.log("❌ Signup Email Error:", err);
        return res.json({ message: "Failed to send OTP" });
      }

      console.log("Signup OTP:", otp);
      res.json({ message: "Signup OTP sent!" });
    }
  );
};

/* ----------------------------------------------------
    VERIFY SIGNUP OTP + CREATE USER
---------------------------------------------------- */
exports.verifySignupOTP = async (req, res) => {
  const { name, email, phone, address, area, password, otp } = req.body;

  if (!email || !otp)
    return res.json({ message: "Email and OTP required" });

  if (otp !== global.signupOTP || email !== global.signupEmail)
    return res.json({ message: "Invalid OTP" });

  const checkSql =
    "SELECT * FROM users WHERE email = ? OR phone = ?";

  db.query(checkSql, [email, phone], async (err, result) => {
    if (err) return res.json({ message: "DB error", err });

    if (result.length > 0)
      return res.json({ message: "Email or Phone already exists" });

    const hashedPw = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, phone, address, area, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, email, phone, address, area, hashedPw], (err2) => {
      if (err2) return res.json({ message: "Signup failed", err2 });

      global.signupOTP = null;
      global.signupEmail = null;

      res.json({ message: "Signup successful" });
    });
  });
};

/* ----------------------------------------------------
    SEND LOGIN OTP
---------------------------------------------------- */
exports.sendLoginOTP = (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.json({ message: "Email is required" });

  const otp = otpGen();
  global.loginOTP = otp;
  global.loginEmail = email;

  transporter.sendMail(
    {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Login OTP",
      text: `Your Login OTP is: ${otp}`,
    },
    (err) => {
      if (err) {
        console.log("Login OTP Error:", err);
        return res.json({ message: "Failed to send OTP" });
      }

      console.log("Login OTP:", otp);
      res.json({ message: "Login OTP sent!" });
    }
  );
};

/* ----------------------------------------------------
    VERIFY LOGIN OTP + SEND TOKEN
---------------------------------------------------- */
exports.verifyLoginOTP = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.json({ message: "Email and OTP required" });

  if (otp !== global.loginOTP || email !== global.loginEmail)
    return res.json({ message: "Invalid OTP" });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) return res.json({ message: "DB error", err });

    if (result.length === 0)
      return res.json({ message: "User not found" });

    const user = result[0];

    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET,
      { expiresIn: "1h" }
    );

    global.loginOTP = null;
    global.loginEmail = null;

    res.json({
      message: "Login successful",
      token,
      user,
    });
  });
};

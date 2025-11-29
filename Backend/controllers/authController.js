const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGen = require("../utils/otp").generateOTP;
const transporter = require("../utils/emailService");

const SECRET = "MY_SECRET_KEY";

// TEMP MEMORY (until DB adds OTP table)
global.signupOTP = null;
global.signupEmail = null;
global.loginOTP = null;
global.loginEmail = null;

/* ---------------- SEND OTP (Signup) ---------------- */
exports.sendSignupOTP = (req, res) => {
  const { email } = req.body;

  const otp = otpGen();
  global.signupOTP = otp;
  global.signupEmail = email;

  const options = {
    from: "YOUR_EMAIL@gmail.com",
    to: email,
    subject: "Signup OTP",
    text: `Your OTP: ${otp}`
  };

  transporter.sendMail(options, (err) => {
    if (err) return res.status(500).send({ message: "Email error", err });
    res.send({ message: "OTP sent!" });
  });
};

/* ---------------- VERIFY OTP + COMPLETE SIGNUP ---------------- */
exports.verifySignupOTP = async (req, res) => {
  const { name, email, phone, address, area, password, otp } = req.body;

  if (otp !== global.signupOTP || email !== global.signupEmail) {
    return res.send({ message: "Invalid OTP" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO users (name,email,phone,address,area,password) VALUES (?,?,?,?,?,?)";
  db.query(sql, [name, email, phone, address, area, hashed], (err) => {
    if (err) return res.status(500).send({ error: err });

    res.send({ message: "Signup completed!" });
  });
};

/* ---------------- SEND OTP (Login) ---------------- */
exports.sendLoginOTP = (req, res) => {
  const { email } = req.body;

  const otp = otpGen();
  global.loginOTP = otp;
  global.loginEmail = email;

  const options = {
    from: "YOUR_EMAIL@gmail.com",
    to: email,
    subject: "Login OTP",
    text: `Your login OTP is: ${otp}`
  };

  transporter.sendMail(options, (err) => {
    if (err) return res.status(500).send({ message: "Email error" });
    res.send({ message: "Login OTP sent!" });
  });
};

/* ---------------- VERIFY LOGIN OTP ---------------- */
exports.verifyLoginOTP = (req, res) => {
  const { email, otp } = req.body;

  if (otp !== global.loginOTP || email !== global.loginEmail) {
    return res.send({ message: "Invalid OTP" });
  }

  const token = jwt.sign({ email }, SECRET, { expiresIn: "1h" });

  res.send({ message: "Login successful", token });
};

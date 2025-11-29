
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,           // <-- IMPORTANT: Use 587 instead of 465
  secure: false,       // false for 587
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

// DEBUG
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ EMAIL CONFIG ERROR:", error);
  } else {
    console.log("✔ EMAIL CONFIG OK — Ready to send OTP");
  }
});

module.exports = transporter;

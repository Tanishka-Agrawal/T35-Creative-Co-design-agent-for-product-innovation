const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // MUST be Gmail App Password
  },
});

transporter.verify((err) => {
  if (err) console.log("❌ EMAIL CONFIG ERROR:", err);
  else console.log("✔ Email Service Ready");
});

module.exports = transporter;

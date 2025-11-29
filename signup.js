console.log("SIGNUP JS LOADED ✔");

import { 
  otpSentVoice, 
  otpVerifiedVoice,
  signupPageVoice,
  signupFieldInstructions 
} from "./Home_page/voiceAssistant.js";

document.addEventListener("DOMContentLoaded", () => {

  // Speak page instructions
  signupPageVoice();
  signupFieldInstructions();

  const fullname = document.getElementById("fullname");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const address = document.getElementById("address");
  const area = document.getElementById("area");

  const otpBox = document.getElementById("signupOtpGroup");
  const otpInput = document.getElementById("signupOtp");

  const sendOtpBtn = document.getElementById("signupBtn");
  const verifyOtpBtn = document.getElementById("verifySignupBtn");

  // ---------------- SEND OTP ----------------
  sendOtpBtn.addEventListener("click", async () => {

    if (!email.value.trim()) {
      alert("Enter email first!");
      return;
    }

    const res = await fetch("http://localhost:5000/api/auth/send-otp", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email: email.value })
    });

    const data = await res.json();
    alert(data.message);

    if (data.message.includes("OTP sent")) {
      otpSentVoice();  // 🔊 Speak only here

      otpBox.style.display = "block";
      sendOtpBtn.style.display = "none";
      verifyOtpBtn.style.display = "block";
    }
  });

  // ---------------- VERIFY OTP + SIGNUP ----------------
  verifyOtpBtn.addEventListener("click", async () => {

    const body = {
      name: fullname.value,
      email: email.value,
      phone: phone.value,
      address: address.value,
      area: area.value,
      otp: otpInput.value
    };

    const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body)
    });

    const data = await res.json();
    alert(data.message);

    if (data.message.includes("Signup completed")) {
      otpVerifiedVoice(fullname.value);   // 🔊 Speak farmer’s name
      window.location.href = "index.html";
    }
  });

});

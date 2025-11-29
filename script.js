// ---- IMPORT VOICE FUNCTIONS ----
import { 
  loginPageVoice,
  loginFieldInstructions,
  otpSentVoice,
  speakLoginName,
  otpVerifiedVoice,
  toggleVoice
} from "./Home_page/voiceAssistant.js";

// ---- VOICE ON PAGE LOAD ----
loginPageVoice();
loginFieldInstructions();

// ---- MUTE/UNMUTE BUTTON ----
document.getElementById("muteVoiceBtn").addEventListener("click", toggleVoice);

// ---- LOGIN OTP ELEMENTS ----
const loginEmail = document.getElementById("loginEmail");
const loginOtpBox = document.getElementById("loginOtpBox");
const loginOtp = document.getElementById("loginOtp");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");

/* ------------------------------------------------------------------
    SEND OTP
------------------------------------------------------------------ */
sendOtpBtn.addEventListener("click", async () => {

  const email = loginEmail.value.trim();

  if (!email) {
    alert("Enter your email first!");
    return;
  }

  const res = await fetch("http://localhost:5000/api/auth/login/send-otp", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  alert(data.message);

  if (data.message.includes("OTP sent")) {
    otpSentVoice();  // VOICE
    loginOtpBox.style.display = "block";
    sendOtpBtn.style.display = "none";
    verifyOtpBtn.style.display = "block";
  }
});

/* ------------------------------------------------------------------
    VERIFY OTP
------------------------------------------------------------------ */
verifyOtpBtn.addEventListener("click", async () => {

  const res = await fetch("http://localhost:5000/api/auth/login/verify", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email: loginEmail.value,
      otp: loginOtp.value
    })
  });

  const data = await res.json();
  alert(data.message);

  if (data.message.includes("Login successful")) {

    // 🎤 SPEAK FARMER NAME AFTER LOGIN
    speakLoginName(data.user.name);

    // SAVE LOGIN SESSION
    localStorage.setItem("token", data.token);
    localStorage.setItem("loggedInUser", JSON.stringify(data.user));

    // REDIRECT TO HOME
    window.location.href = "./Home_page/home.html";
  }
});

const token = localStorage.getItem("token");
if (!token) {
  alert("Please login first");
  window.location.href = "../index.html";
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "../index.html";
});

import { welcomeVoice, toggleVoice } from "./voiceAssistant.js";

welcomeVoice();

document.getElementById("voiceToggle")?.addEventListener("click", toggleVoice);

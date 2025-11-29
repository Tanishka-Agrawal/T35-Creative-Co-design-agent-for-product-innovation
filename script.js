
console.log("LOGIN JS LOADED ✔");

document.addEventListener("DOMContentLoaded", () => {

  const loginEmail = document.getElementById("loginEmail");
  const loginOtpBox = document.getElementById("loginOtpBox");
  const loginOtpInput = document.getElementById("loginOtp");

  const sendLoginOtpBtn = document.getElementById("sendOtpBtn");
  const verifyLoginOtpBtn = document.getElementById("verifyOtpBtn");

  // ---------------- SEND LOGIN OTP ----------------
  sendLoginOtpBtn.addEventListener("click", async () => {

    if (!loginEmail.value.trim()) {
      alert("Please enter your email!");
      return;
    }

    const res = await fetch("http://localhost:5000/api/auth/login/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail.value })
    });

    const data = await res.json();
    alert(data.message);

    if (data.message.includes("OTP sent")) {
      loginOtpBox.style.display = "block";
      sendLoginOtpBtn.style.display = "none";
      verifyLoginOtpBtn.style.display = "block";
    }
  });

  // ---------------- VERIFY LOGIN OTP ----------------
  verifyLoginOtpBtn.addEventListener("click", async () => {

    if (!loginOtpInput.value.trim()) {
      alert("Enter OTP!");
      return;
    }

    const res = await fetch("http://localhost:5000/api/auth/login/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginEmail.value,
        otp: loginOtpInput.value
      })
    });

    const data = await res.json();
    alert(data.message);

    if (data.message.includes("Login successful")) {

      // Save user & token
      localStorage.setItem("token", data.token);
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));

      // Go to farmer home page
      window.location.href = "./Home_page/home.html";
    }
  });

});


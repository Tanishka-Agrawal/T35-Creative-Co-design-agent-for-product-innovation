const fullname = document.getElementById("fullname");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const address = document.getElementById("address");
const area = document.getElementById("area");
const password = document.getElementById("password");

const otpBox = document.getElementById("signupOtpGroup");
const otpInput = document.getElementById("signupOtp");

const sendOtpBtn = document.getElementById("signupBtn");
const verifyOtpBtn = document.getElementById("verifySignupBtn");

/* SEND OTP */
sendOtpBtn.addEventListener("click", async () => {
  if (!email.value.trim()) {
    alert("Enter email first!");
    return;
  }

  const res = await fetch("http://localhost:5000/api/auth/signup/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.value })
  });

  const data = await res.json();
  alert(data.message);

  if (data.message.includes("OTP sent")) {
    otpBox.style.display = "block";
    sendOtpBtn.style.display = "none";
    verifyOtpBtn.style.display = "block";
  }
});

/* VERIFY OTP */
verifyOtpBtn.addEventListener("click", async () => {

  const body = {
    name: fullname.value,
    email: email.value,
    phone: phone.value,
    address: address.value,
    area: area.value,
    password: password.value,
    otp: otpInput.value
  };

  const res = await fetch("http://localhost:5000/api/auth/signup/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  alert(data.message);

  if (data.message.includes("Signup successful")) {
    window.location.href = "index.html";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");

  if (signupBtn) {
    signupBtn.addEventListener("click", (e) => {
      e.preventDefault();
//const name = document.getElementById("fullname").value.trim();
//const email=document.getElementById('email').value.trim();
//const phone=document.getElementById('phone').value.trim();
//const address=document.getElementById('address').value.trim();
//const area=document.getElementById('area').value.trim();

      const name = document.getElementById("fullname").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const address = document.getElementById("address").value.trim();
      const area = document.getElementById("area").value.trim();
      const password = document.getElementById("password").value.trim();
//document.addEventListener('DOMC
      const nameRegex = /^[A-Za-z\s]+$/;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
      const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number format
///^[A-Za-z\s]+$/;
//^[a-zA-Z0-9%._+-]+@[a-zA-Z0-0.-]+\.[A-Za-z]{2,}$/;

      // ✅ Check all fields filled
      if (!name || !email || !phone || !address || !area || !password) {
        alert("⚠️ Please fill in all fields before signing up!");
        return;
      }

      // ✅ Validate name (letters & spaces only)
      if (!nameRegex.test(name)) {
        alert("⚠️ Name must contain only alphabets and spaces.");
        return;
      }

      // ✅ Validate email
      if (!emailRegex.test(email)) {
        alert("⚠️ Please enter a valid email address.");
        return;
      }

      // ✅ Validate phone
      if (!phoneRegex.test(phone)) {
        alert("⚠️ Please enter a valid 10-digit phone number starting with 6–9.");
        return;
      }

      // ✅ Validate password (minimum 6 chars)
      if (password.length < 6) {
        alert("⚠️ Password must be at least 6 characters long.");
        return;
      }

      const users = JSON.parse(localStorage.getItem("users")) || [];
      const exists = users.find((u) => u.email === email);

      if (exists) {
        alert("⚠️ User already exists! Please log in instead.");
        window.location.href = "index.html";
        return;
      }

      users.push({ name, email, phone, address, area, password });
      localStorage.setItem("users", JSON.stringify(users));

      alert("✅ Sign-up successful! Redirecting to login page...");
      window.location.href = "index.html";
    });
  }

  /* ---------------- LOGIN ---------------- */
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        alert("⚠️ Please enter both email and password!");
        return;
      }

      const users = JSON.parse(localStorage.getItem("users")) || [];
      const validUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (validUser) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loggedInUser", JSON.stringify(validUser));

        alert(`✅ Welcome back, ${validUser.name}! Redirecting to home...`);
        window.location.href = "Home_page/home.html"; // correct relative path
      } else {
        alert("❌ Invalid credentials! Please sign up first.");
      }
    });
  }
});

//
document.addEventListener("DOMContentLoaded", () => {
  const API = "https://t35-creative-co-design-agent-for-product-u00t.onrender.com"; // same origin

  // ============================================
  // GOOGLE SIGNUP (Primary method on signup page)
  // ============================================
  const googleSignupBtn = document.getElementById("googleSignupBtn");
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      if (typeof google !== "undefined" && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
          client_id: "AIzaSyC_t9o3YBYt0TK2mduKnBDamQangMf0i3I",
          callback: handleGoogleSignUp,
        });
        google.accounts.id.renderButton(
          document.createElement("div"),
          { theme: "outline", size: "large" }
        );
        google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log("Google One Tap not displayed.");
          }
        });
      } else {
        alert("⚠️ Google Sign-In library not loaded.");
      }
    });

    window.handleGoogleSignUp = async (response) => {
      const googleToken = response.credential;
      try {
        const payload = JSON.parse(atob(googleToken.split('.')[1]));
        const { name, email, picture } = payload;

        const res = await fetch(`${API}/api/users/google-oauth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ googleToken, name, email, picture }),
        });
        const data = await res.json();

        if (!res.ok) {
          alert("❌ Google sign-up failed: " + (data.message || data.error));
          return;
        }

        if (data.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        }

        alert(`✅ Account created! Welcome ${data.user.name || data.user.email}.`);
        window.location.href = "home.html";
      } catch (err) {
        console.error(err);
        alert("❌ Network error during Google sign-up.");
      }
    };
  }

  // ============================================
  // MANUAL SIGN-UP (Secondary method)
  // ============================================
  const signupBtn = document.getElementById("signupBtn");
  if (signupBtn) {
    signupBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const name = document.getElementById("fullname").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const address = document.getElementById("address").value.trim();
      const area = document.getElementById("area").value.trim();
      const password = document.getElementById("password").value.trim();

      const nameRegex = /^[A-Za-z\s]+$/;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
      const phoneRegex = /^[6-9]\d{9}$/;

      if (!name || !email || !phone || !address || !area || !password) {
        alert("⚠️ Please fill in all fields!");
        return;
      }

      if (!nameRegex.test(name)) {
        alert("⚠️ Name must contain only alphabets and spaces.");
        return;
      }

      if (!emailRegex.test(email)) {
        alert("⚠️ Please enter a valid email address.");
        return;
      }

      if (!phoneRegex.test(phone)) {
        alert("⚠️ Please enter a valid 10-digit phone number.");
        return;
      }

      if (password.length < 6) {
        alert("⚠️ Password must be at least 6 characters long.");
        return;
      }

      try {
        const res = await fetch(`${API}/api/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, phone, address, area }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert("❌ Sign-up failed: " + (data.message || data.error));
          return;
        }

        if (data.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        }

        alert("✅ Account created! Redirecting to home...");
        window.location.href = "home.html";
      } catch (err) {
        console.error(err);
        alert("❌ Network error while signing up.");
      }
    });
  }

  // ============================================
  // LOGIN PAGE
  // ============================================
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        alert("⚠️ Please enter both email and password!");
        return;
      }

      try {
        const res = await fetch(`${API}/api/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert("❌ Login failed: " + (data.message || data.error));
          return;
        }

        if (data.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        }

        alert(`✅ Welcome back, ${data.user.name || data.user.email}!`);
        window.location.href = "home.html";
      } catch (err) {
        console.error(err);
        alert("❌ Network error while logging in.");
      }
    });
  }

  

  // ============================================
  // LOGOUT
  // ============================================
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        await fetch(`${API}/api/users/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        localStorage.removeItem("authToken");
        localStorage.removeItem("loggedInUser");

        alert("✅ Logged out successfully!");
        window.location.href = "index.html";
      } catch (err) {
        console.error(err);
        alert("❌ Network error while logging out.");
      }
    });
  }

  // ============================================
  // FETCH AND LOG STATS
  // ============================================
  (async function fetchStats() {
    try {
      const res = await fetch(`${API}/api/users/stats`);
      if (!res.ok) return;
      const s = await res.json();
      console.log("[User Stats]", s);
    } catch (e) {
      // ignore
    }
  })();

  // ============================================
  // CHECK LOGIN STATUS
  // ============================================
  function isLoggedIn() {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("loggedInUser");
    return !!token && !!user;
  }
});

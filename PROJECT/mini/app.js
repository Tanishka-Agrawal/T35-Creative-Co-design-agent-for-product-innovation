// Define global callbacks so Google One Tap doesn't crash if it fires early
document.addEventListener("DOMContentLoaded", () => {
  // Use relative API path to avoid CORS issues when site uses 127.0.0.1 vs localhost
  const API = '';

  // Google sign-up removed: project uses manual sign-up / email login only.

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

      // Require only fields the backend uses
      if (!name || !email || !password) {
        alert("⚠️ Please fill in name, email, and password!");
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

      // Phone is optional; validate only if provided
      if (phone && !phoneRegex.test(phone)) {
        alert("⚠️ Please enter a valid 10-digit phone number starting with 6–9.");
        return;
      }

      try {
        const res = await fetch(`${API}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert("❌ Sign-up failed: " + (data.message || data.error));
          return;
        }

        if (data.verificationSent) {
          let msg = '✅ Account created! Please verify your email before logging in.';
          if (data.previewUrl) {
            msg += '\n\n(Dev preview) Open the verification email: ' + data.previewUrl;
            // open preview link in a new tab so user can click through
            window.open(data.previewUrl, '_blank');
          }
          alert(msg);
          window.location.href = 'index.html';
          return;
        }

        // If no verification required or other behavior
        alert('✅ Account created! Please log in.');
        window.location.href = 'index.html';
      } catch (err) {
        console.error(err);
        alert("❌ Network error while signing up.");
      }
    });
  }

  // LOGIN PAGE
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
        const res = await fetch(`${API}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 403 && data.verificationSent) {
            let msg = '❌ Please verify your email before logging in. Check your inbox for the verification link.';
            if (data.previewUrl) {
              msg += '\n\n(Dev preview) Open the verification email: ' + data.previewUrl;
              window.open(data.previewUrl, '_blank');
            }
            alert(msg);
            return;
          } else if (res.status === 403) {
            alert('❌ Please verify your email first.');
            return;
          } else {
            alert('❌ Login failed: ' + (data.message || data.error));
            return;
          }
        }

        // Save user info from response
        localStorage.setItem("loggedInUser", JSON.stringify(data));

        alert(`✅ Welcome back, ${data.name || data.email}!`);
        window.location.href = "home.html";
      } catch (err) {
        console.error(err);
        alert("❌ Network error while logging in.");
      }
    });
  }

  // LOGOUT
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        const res = await fetch(`${API}/api/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert("❌ Logout failed: " + (data.message || data.error || res.status));
          return;
        }

        localStorage.removeItem("loggedInUser");

        alert("✅ Logged out successfully!");
        window.location.href = "index.html";
      } catch (err) {
        console.error(err);
        alert("❌ Network error while logging out.");
      }
    });
  }

  // Remove the invalid stats call to /api/users/stats (not implemented in backend)
  // (Previously here)

  // CHECK LOGIN STATUS (optional legacy helper)
  function isLoggedIn() {
    const user = localStorage.getItem("loggedInUser");
    return !!user;
  }
});

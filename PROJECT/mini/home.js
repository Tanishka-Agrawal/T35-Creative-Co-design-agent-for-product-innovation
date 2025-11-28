document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/user/me", { credentials: "include" });
    if (!res.ok) {
      alert("⚠️ Please login first!");
      window.location.href = "index.html";
      return;
    }
    const user = await res.json();

    document.getElementById("welcomeText").textContent = `Welcome, ${user.name}! 👩‍🌾`;
    const userNameDisplay = document.getElementById("userNameDisplay");
    if (userNameDisplay) {
      userNameDisplay.textContent = `👤 ${user.name || user.email}`;
    }
  } catch (err) {
    alert("❌ Unable to load user. Please login again.");
    window.location.href = "index.html";
  }
});
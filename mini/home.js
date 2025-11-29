document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const token = localStorage.getItem("authToken");

  if (!user || !token) {
    alert("⚠️ Please login first!");
    window.location.href = "index.html";
    return;
  }

  // Display user info
  document.getElementById("welcomeText").textContent = `Welcome, ${user.name}! 👩‍🌾`;
  
  // Display username in header
  const userNameDisplay = document.getElementById("userNameDisplay");
  if (userNameDisplay) {
    userNameDisplay.textContent = `👤 ${user.name || user.email}`;
  }
});
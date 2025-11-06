document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const logoutBtn = document.getElementById("logoutBtn");

  if (!user) {
    alert("⚠️ Please login first!");
    window.location.href = "../index.html";
    return;
  }

  // Display user info
  document.getElementById("welcomeText").textContent = `Welcome, ${user.name}! 👩‍🌾`;
  document.getElementById("userDetails").innerHTML = `
    <strong>Email:</strong> ${user.email} <br>
    <strong>Phone:</strong> ${user.phone} <br>
    <strong>Address:</strong> ${user.address} <br>
    <strong>Area:</strong> ${user.area}
  `;

  // Logout handler
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");
    window.location.href = "../index.html";
  });
});

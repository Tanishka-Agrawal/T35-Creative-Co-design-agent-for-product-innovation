document.addEventListener("DOMContentLoaded", () => {

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const token = localStorage.getItem("token");

  const welcomeText = document.getElementById("welcomeText");
  const logoutBtn = document.getElementById("logoutBtn");

  const sidebar = document.getElementById("sidebar");
  const openSidebar = document.getElementById("openSidebar");
  const closeSidebar = document.getElementById("closeSidebar");

  if (!token || !user) {
    alert("Please login first!");
    window.location.href = "../index.html";
    return;
  }

  // Set welcome text
  welcomeText.textContent = `Welcome, ${user.name}! 👨‍🌾`;

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    window.location.href = "../index.html";
  });

  // Sidebar open/close
  openSidebar.addEventListener("click", () => sidebar.classList.add("active"));
  closeSidebar.addEventListener("click", () => sidebar.classList.remove("active"));

});

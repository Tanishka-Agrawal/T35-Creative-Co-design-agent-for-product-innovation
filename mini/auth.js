// ============================================
// Frontend Auth API client
// ============================================

const API = ""; // same origin (mini is served by backend)

export async function register(name, email, password, phone, address, area) {
  const res = await fetch(`${API}/api/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, phone, address, area }),
  });
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function googleOAuth(googleToken, name, email, picture) {
  const res = await fetch(`${API}/api/users/google-oauth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ googleToken, name, email, picture }),
  });
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API}/api/users/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}

export function getToken() {
  return localStorage.getItem("authToken");
}

export function setToken(token) {
  localStorage.setItem("authToken", token);
}

export function removeToken() {
  localStorage.removeItem("authToken");
}

export function getLoggedInUser() {
  const user = localStorage.getItem("loggedInUser");
  return user ? JSON.parse(user) : null;
}

export function setLoggedInUser(user) {
  localStorage.setItem("loggedInUser", JSON.stringify(user));
}

export function removeLoggedInUser() {
  localStorage.removeItem("loggedInUser");
}

export async function fetchStats() {
  try {
    const res = await fetch(`${API}/api/users/stats`);
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

// ============================================
// Frontend Auth API client
// ============================================

const API = "https://t35-creative-co-design-agent-for-product-innovation-6al89nh4d.vercel.app"; 

export async function register(name, email, password) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API}/api/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res.json();
}

export async function me() {
  const res = await fetch(`${API}/api/user/me`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) return null;
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

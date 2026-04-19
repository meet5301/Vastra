export function getToken() {
  return localStorage.getItem("vastra_token");
}

export function setToken(token) {
  localStorage.setItem("vastra_token", token);
}

export function getUser() {
  const raw = localStorage.getItem("vastra_user");
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user) {
  localStorage.setItem("vastra_user", JSON.stringify(user));
}

export function clearAuth() {
  [
    "vastra_token",
    "vastra_user",
    "vastra_cart",
    "vastra_admin_token",
    "vastra_admin_user",
  ].forEach((key) => localStorage.removeItem(key));
}

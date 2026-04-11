// ─── VASTRA USER AUTH JS ───────────────────────────────────────────

// ── LOGIN ──────────────────────────────────────────────────────────
const loginForm = document.querySelector("form[data-form='login']");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email    = loginForm.querySelector("[name='email']").value;
    const password = loginForm.querySelector("[name='password']").value;
    const btn      = loginForm.querySelector("button");
    btn.textContent = "Logging in...";
    btn.disabled    = true;

    try {
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        // Save for user navbar
        localStorage.setItem("vastra_token", data.token);
        localStorage.setItem("vastra_user",  JSON.stringify(data.user));

        if (data.user.role === "admin") {
          // Also save as admin tokens so admin panel works
          localStorage.setItem("vastra_admin_token", data.token);
          localStorage.setItem("vastra_admin_user",  JSON.stringify(data.user));
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/";
        }
      } else {
        alert(data.message || "Login failed");
        btn.textContent = "Login";
        btn.disabled    = false;
      }
    } catch (err) {
      alert("Server error. Please try again.");
      btn.textContent = "Login";
      btn.disabled    = false;
    }
  });
}

// ── SIGNUP ─────────────────────────────────────────────────────────
const signupForm = document.querySelector("form[data-form='signup']");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = signupForm.querySelector("[name='username']").value;
    const email    = signupForm.querySelector("[name='email']").value;
    const password = signupForm.querySelector("[name='password']").value;
    const btn      = signupForm.querySelector("button");
    btn.textContent = "Creating account...";
    btn.disabled    = true;

    try {
      const res  = await fetch("/api/auth/signup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("vastra_token", data.token);
        localStorage.setItem("vastra_user",  JSON.stringify(data.user));
        window.location.href = "/";
      } else {
        alert(data.message || "Signup failed");
        btn.textContent = "Sign Up";
        btn.disabled    = false;
      }
    } catch (err) {
      alert("Server error. Please try again.");
      btn.textContent = "Sign Up";
      btn.disabled    = false;
    }
  });
}

// ── HELPERS ────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem("vastra_token"); }
function getUser()  {
  const u = localStorage.getItem("vastra_user");
  return u ? JSON.parse(u) : null;
}
function logout() {
  localStorage.removeItem("vastra_token");
  localStorage.removeItem("vastra_user");
  localStorage.removeItem("vastra_cart");
  localStorage.removeItem("vastra_admin_token");
  localStorage.removeItem("vastra_admin_user");
  window.location.href = "/login";
}

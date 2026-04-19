import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setToken, setUser } from "../utils/storage";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const form = document.querySelector("form[data-form='login']");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.querySelector("[name='login_email']").value;
      const password = form.querySelector("[name='login_pass']").value;
      const btn = form.querySelector("button");
      btn.textContent = "Logging in...";
      btn.disabled = true;

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (data.success) {
          setToken(data.token);
          setUser(data.user);
          if (data.user.role === "admin") {
            localStorage.setItem("vastra_admin_token", data.token);
            localStorage.setItem("vastra_admin_user", JSON.stringify(data.user));
            window.location.href = "/admin/dashboard";
            return;
          }
          navigate("/");
        } else {
          alert(data.message || "Login failed");
          btn.textContent = "Login";
          btn.disabled = false;
        }
      } catch {
        alert("Server error. Please try again.");
        btn.textContent = "Login";
        btn.disabled = false;
      }
    });
  }, [navigate]);

  return (
    <div className="auth-container">
      <div className="left-panel">
        <h1>VASTRA.</h1>
        <p>
          Welcome back!<br />
          Minimal fashion, premium quality.
        </p>
      </div>

      <div className="right-panel">
        <div className="form-box">
          <h2>Welcome Back</h2>
          <form data-form="login" autoComplete="off">
            <div className="input-group">
              <input type="email" name="login_email" placeholder="Email" autoComplete="username" required />
            </div>
            <div className="input-group">
              <input type="password" name="login_pass" placeholder="Password" autoComplete="new-password" required />
            </div>
            <button type="submit">Login</button>
          </form>
          <div className="switch">
            Don't have an account?
            <a href="/signup">Sign Up</a>
          </div>
        </div>
      </div>
    </div>
  );
}

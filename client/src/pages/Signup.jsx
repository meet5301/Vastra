import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setToken, setUser } from "../utils/storage";

export default function Signup() {
  const navigate = useNavigate();

  useEffect(() => {
    const form = document.querySelector("form[data-form='signup']");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = form.querySelector("[name='signup_username']").value;
      const email = form.querySelector("[name='signup_email']").value;
      const password = form.querySelector("[name='signup_pass']").value;
      const btn = form.querySelector("button");
      btn.textContent = "Creating account...";
      btn.disabled = true;

      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();

        if (data.success) {
          setToken(data.token);
          setUser(data.user);
          navigate("/");
        } else {
          alert(data.message || "Signup failed");
          btn.textContent = "Sign Up";
          btn.disabled = false;
        }
      } catch {
        alert("Server error. Please try again.");
        btn.textContent = "Sign Up";
        btn.disabled = false;
      }
    });
  }, [navigate]);

  return (
    <div className="auth-container">
      <div className="left-panel">
        <h1>VASTRA.</h1>
        <p>
          Create your account and start exploring<br />
          minimal fashion, premium quality.
        </p>
      </div>

      <div className="right-panel">
        <div className="form-box">
          <h2>Create Account</h2>
          <form data-form="signup" autoComplete="off">
            <div className="input-group">
              <input type="text" name="signup_username" placeholder="Username" autoComplete="off" required />
            </div>
            <div className="input-group">
              <input type="email" name="signup_email" placeholder="Email" autoComplete="off" required />
            </div>
            <div className="input-group">
              <input type="password" name="signup_pass" placeholder="Password" autoComplete="new-password" required />
            </div>
            <button type="submit">Sign Up</button>
          </form>
          <div className="switch">
            Already have an account?
            <a href="/login">Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}

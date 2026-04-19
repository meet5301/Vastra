import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("vastra_admin_token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleLogin = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.user?.role === "admin") {
        localStorage.setItem("vastra_admin_token", data.token);
        localStorage.setItem("vastra_admin_user", JSON.stringify(data.user));
        navigate("/dashboard");
        return;
      }
      if (data.success && data.user?.role !== "admin") {
        setError("Access denied. Admin only.");
        return;
      }
      setError(data.message || "Invalid credentials");
    } catch (err) {
      setError("Server error. Try again.");
    }
  }, [email, password, navigate]);

  useEffect(() => {
    function handleEnter(e) {
      if (e.key === "Enter") {
        handleLogin();
      }
    }
    document.addEventListener("keydown", handleEnter);
    return () => document.removeEventListener("keydown", handleEnter);
  }, [handleLogin]);

  return (
    <div className="admin-login-page">
      <div className="login-box">
        <h1>VASTRA.</h1>
        <p>ADMIN PANEL</p>
        <div className="error" id="error-msg" style={{ display: error ? "block" : "none" }}>
          {error || "Invalid email or password"}
        </div>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button id="login-btn" onClick={handleLogin}>LOGIN</button>
      </div>
    </div>
  );
}

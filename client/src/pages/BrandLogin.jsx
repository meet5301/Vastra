import { useEffect, useState } from "react";

export default function BrandLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vastra_brand_token");
    if (token) window.location.href = "/brand/dashboard";
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/brand/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Brand login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("vastra_brand_token", data.token);
      localStorage.setItem("vastra_brand_user", JSON.stringify(data.user));
      window.location.href = "/brand/dashboard";
    } catch {
      alert("Server error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="left-panel">
        <h1>VASTRA.</h1>
        <p>
          Brand Partner Login.<br />
          Manage your brand profile and product listings.
        </p>
      </div>
      <div className="right-panel">
        <div className="form-box">
          <h2>Brand Seller Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input type="email" placeholder="Brand Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login as Brand"}</button>
          </form>
          <div className="switch">
            New seller?
            <a href="/brand/register"> Register your brand</a>
          </div>
          <div className="switch" style={{ marginTop: 8 }}>
            Buyer account?
            <a href="/login"> User Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}

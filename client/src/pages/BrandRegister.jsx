import { useEffect, useState } from "react";

export default function BrandRegister() {
  const [form, setForm] = useState({
    brandName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vastra_brand_token");
    if (token) window.location.href = "/brand/dashboard";
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/brand/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Brand registration failed");
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

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="auth-container brand-auth-container">
      <div className="left-panel">
        <h1>VASTRA.</h1>
        <p>
          Add your brand for selling clothes on Vastra.<br />
          Create your seller account and manage catalog from one dashboard.
        </p>
      </div>
      <div className="right-panel">
        <div className="form-box">
          <h2>Brand Seller Registration</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group"><input type="text" placeholder="Brand Name" value={form.brandName} onChange={(e) => setField("brandName", e.target.value)} required /></div>
            <div className="input-group"><input type="email" placeholder="Business Email" value={form.email} onChange={(e) => setField("email", e.target.value)} required /></div>
            <div className="input-group"><input type="password" placeholder="Password" value={form.password} onChange={(e) => setField("password", e.target.value)} required /></div>
            <button type="submit" disabled={loading}>{loading ? "Creating seller account..." : "Register Brand Seller"}</button>
          </form>
          <div className="switch">
            Already a seller?
            <a href="/brand/login"> Brand Login</a>
          </div>
          <div className="switch" style={{ marginTop: 8 }}>
            Just want to buy?
            <a href="/signup"> User Signup</a>
          </div>
        </div>
      </div>
    </div>
  );
}

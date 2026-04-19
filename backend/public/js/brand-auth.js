const brandLoginForm = document.querySelector("form[data-form='brand-login']");
const brandRegisterForm = document.querySelector("form[data-form='brand-register']");

if (brandLoginForm) {
  brandLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = brandLoginForm.querySelector("[name='brand_email']").value.trim();
    const password = brandLoginForm.querySelector("[name='brand_pass']").value;
    const btn = brandLoginForm.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Logging in...";

    try {
      const res = await fetch("/api/auth/brand/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Brand login failed");
        btn.disabled = false;
        btn.textContent = "Login as Brand";
        return;
      }

      localStorage.setItem("vastra_brand_token", data.token);
      localStorage.setItem("vastra_brand_user", JSON.stringify(data.user));
      window.location.href = "/brand/dashboard";
    } catch (err) {
      alert("Server error. Please try again.");
      btn.disabled = false;
      btn.textContent = "Login as Brand";
    }
  });
}

if (brandRegisterForm) {
  brandRegisterForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      email: brandRegisterForm.querySelector("[name='brand_email']").value.trim(),
      password: brandRegisterForm.querySelector("[name='brand_pass']").value,
      brandName: brandRegisterForm.querySelector("[name='brand_name']").value.trim(),
    };

    const btn = brandRegisterForm.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Creating seller account...";

    try {
      const res = await fetch("/api/auth/brand/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Brand registration failed");
        btn.disabled = false;
        btn.textContent = "Register Brand Seller";
        return;
      }

      localStorage.setItem("vastra_brand_token", data.token);
      localStorage.setItem("vastra_brand_user", JSON.stringify(data.user));
      window.location.href = "/brand/dashboard";
    } catch (err) {
      alert("Server error. Please try again.");
      btn.disabled = false;
      btn.textContent = "Register Brand Seller";
    }
  });
}

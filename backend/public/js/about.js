// ── COUNTER ANIMATION ─────────────────────────────────────
function animateCounters() {
  const nums = document.querySelectorAll(".ab2-stat-num, .ab-stat-num");
  if (!nums.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const step = target / (1600 / 16);
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current);
        if (current >= target) clearInterval(timer);
      }, 16);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(el => observer.observe(el));
}

// ── SCROLL REVEAL ─────────────────────────────────────────
function initScrollReveal() {
  const ab2Els = document.querySelectorAll(".ab2-reveal");
  if (ab2Els.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("ab2-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    ab2Els.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      observer.observe(el);
    });
    return;
  }

  const els = document.querySelectorAll(
    ".ab-value-card, .ab-testi-card, .ab-step, .ab-point, .ab-sustain-copy, .ab-story-copy, .ab-story-img"
  );
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("ab-revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    el.classList.add("ab-reveal");
    observer.observe(el);
  });
}

// ── NEWSLETTER ────────────────────────────────────────────
function initNewsletter() {
  const form = document.getElementById("ab2-nl-form") || document.getElementById("ab-nl-form");
  const msg  = document.getElementById("ab2-nl-msg") || document.getElementById("ab-nl-msg");
  if (!form || !msg) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailField = document.getElementById("ab2-nl-email") || document.getElementById("ab-nl-email");
    const email = emailField ? emailField.value.trim() : "";
    if (!email) return;
    // Store locally (no backend endpoint needed)
    const subs = JSON.parse(localStorage.getItem("vastra_newsletter") || "[]");
    if (subs.includes(email)) {
      msg.textContent = "You're already subscribed!";
      msg.style.color = "#c9a84c";
    } else {
      subs.push(email);
      localStorage.setItem("vastra_newsletter", JSON.stringify(subs));
      msg.textContent = "🎉 You're in! Welcome to the Vastra family.";
      msg.style.color = "#2ecc71";
      form.reset();
    }
    setTimeout(() => { msg.textContent = ""; }, 4000);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  animateCounters();
  initScrollReveal();
  initNewsletter();
});

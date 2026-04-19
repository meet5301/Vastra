export function showToast(msg) {
  let t = document.getElementById("vastra-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "vastra-toast";
    t.style.cssText = "position:fixed;bottom:2rem;right:2rem;background:#000;color:#fff;padding:12px 22px;z-index:99999;font-size:13px;letter-spacing:1px;opacity:0;transition:opacity 0.3s;pointer-events:none;";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity = "0";
  }, 2500);
}

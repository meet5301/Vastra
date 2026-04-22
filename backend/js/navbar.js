function initNavbarAuth() {
    const raw = localStorage.getItem("vastra_user");
    let user = null;
    try {
        user = raw ? JSON.parse(raw) : null;
    } catch (err) {
        localStorage.removeItem("vastra_user");
    }

    const loginBtn  = document.getElementById("nav-login-btn");
    const adminLink = document.getElementById("nav-admin-link");

    if (!loginBtn || !adminLink) return;

    if (user) {
        const letter = (user.username || user.email || "U").charAt(0).toUpperCase();
        loginBtn.textContent = letter;
        if (user.role === "brand") {
            loginBtn.setAttribute("href", "/brand/dashboard");
        } else {
            loginBtn.setAttribute("href", "/profile");
        }
        loginBtn.title = user.username || "Profile";
        loginBtn.style.background = "#111";
        loginBtn.style.color = "#fff";
        if (user.role === "admin") {
            adminLink.style.display = "block";
        }
    } else {
        loginBtn.textContent = "L";
        loginBtn.setAttribute("href", "/login");
        loginBtn.title = "Login";
        loginBtn.style.background = "#111";
        loginBtn.style.color = "#fff";
        adminLink.style.display = "none";
    }
}

function initNavbarSearch() {
    const searchBtn = document.getElementById("nav-search-btn");
    const panel = document.getElementById("search-panel");
    const overlay = document.getElementById("search-overlay");
    const closeBtn = document.getElementById("nav-search-close");
    const input = document.getElementById("nav-search-input");
    const results = document.getElementById("nav-search-results");
    const status = document.getElementById("nav-search-status");

    if (!searchBtn || !panel || !overlay || !closeBtn || !input || !results || !status) return;

    let searchTimer;

    function openPanel() {
        document.dispatchEvent(new CustomEvent("vastra:close-menu"));
        panel.classList.add("open");
        overlay.classList.add("show");
        panel.setAttribute("aria-hidden", "false");
        overlay.setAttribute("aria-hidden", "false");
        input.focus();
    }

    function closePanel() {
        panel.classList.remove("open");
        overlay.classList.remove("show");
        panel.setAttribute("aria-hidden", "true");
        overlay.setAttribute("aria-hidden", "true");
    }

    async function performSearch(query) {
        status.textContent = "Searching...";
        results.innerHTML = "";

        try {
            const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=8`);
            const data = await res.json();

            if (data.success && data.products.length > 0) {
                status.textContent = `${data.products.length} results`;
                results.innerHTML = data.products
                    .map((p) => `
                        <div class="search-item" data-id="${p._id}">
                            <img src="${p.image}" alt="${p.name}" onerror="this.src='/images/no-image.svg'" />
                            <div class="search-item-info">
                                <div class="search-item-name">${p.name}</div>
                                <div class="search-item-price">Rs. ${Math.round(Number(p.price || 0)).toLocaleString("en-IN")}</div>
                            </div>
                        </div>
                    `)
                    .join("");
            } else {
                status.textContent = "0 results";
                results.innerHTML = "<div class=\"search-empty\">No products found</div>";
            }
        } catch (err) {
            status.textContent = "Search failed";
            results.innerHTML = "<div class=\"search-empty\">Please try again</div>";
        }
    }

    function openFromAction(e) {
        e.preventDefault();
        openPanel();
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", openFromAction);
    }

    closeBtn.addEventListener("click", closePanel);
    overlay.addEventListener("click", closePanel);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closePanel();
    });

    input.addEventListener("input", () => {
        clearTimeout(searchTimer);
        const query = input.value.trim();

        if (!query) {
            status.textContent = "Type to search";
            results.innerHTML = "";
            return;
        }

        searchTimer = setTimeout(() => performSearch(query), 250);
    });

    results.addEventListener("click", (e) => {
        const item = e.target.closest(".search-item");
        if (!item) return;

        const id = item.getAttribute("data-id");
        const target = document.querySelector(`[data-product-id="${id}"]`);

        if (target) {
            closePanel();
            target.scrollIntoView({ behavior: "smooth", block: "center" });
            target.classList.add("search-highlight");
            setTimeout(() => target.classList.remove("search-highlight"), 2000);
        } else {
            window.location.href = `/detail?id=${id}`;
        }
    });
}

function initNavbarMenu() {
    const toggleBtn = document.getElementById("nav-menu-toggle");
    const closeBtn = document.getElementById("nav-menu-close");
    const menu = document.querySelector(".menu");
    const backdrop = document.getElementById("nav-menu-backdrop");

    if (!toggleBtn || !menu || !backdrop) return;

    function closeMenu() {
        menu.classList.remove("open");
        backdrop.classList.remove("show");
        backdrop.setAttribute("aria-hidden", "true");
        toggleBtn.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
        document.body.style.overflow = "";
    }

    function openMenu() {
        menu.classList.add("open");
        backdrop.classList.add("show");
        backdrop.setAttribute("aria-hidden", "false");
        toggleBtn.setAttribute("aria-expanded", "true");
        document.body.classList.add("nav-open");
        document.body.style.overflow = "hidden";
    }

    function handleToggle() {
        if (menu.classList.contains("open")) {
            closeMenu();
            return;
        }
        openMenu();
    }

    toggleBtn.addEventListener("click", handleToggle);
    if (closeBtn) {
        closeBtn.addEventListener("click", closeMenu);
    }

    backdrop.addEventListener("click", closeMenu);

    menu.addEventListener("click", (e) => {
        if (window.innerWidth > 1024) return;

        const link = e.target.closest("a[href]");
        if (!link || !menu.contains(link)) return;

        const href = link.getAttribute("href");
        closeMenu();

        if (!href || href.startsWith("#")) return;

        e.preventDefault();
        e.stopPropagation();
        window.location.assign(href);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) closeMenu();
    });

    document.addEventListener("vastra:close-menu", closeMenu);
}

function ensurePerfScript() {
    if (document.querySelector('script[data-vastra-perf="1"]')) return;
    const perfScript = document.createElement("script");
    perfScript.src = "/js/perf.js";
    perfScript.defer = true;
    perfScript.setAttribute("data-vastra-perf", "1");
    document.head.appendChild(perfScript);
}

ensurePerfScript();

fetch("/navbar")
    .then((res) => res.text())
    .then((data) => {
        const host = document.getElementById("navbar");
        if (!host) return;
        host.innerHTML = data;

        try { initNavbarAuth(); } catch (err) {}
        try { initNavbarSearch(); } catch (err) {}
        try { initNavbarMenu(); } catch (err) {}
    })
    .catch(() => {});
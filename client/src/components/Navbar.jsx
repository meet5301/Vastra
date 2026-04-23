import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUser } from "../utils/storage";
import { formatINR } from "../utils/currency";

export default function Navbar() {
  const [user, setUser] = useState(getUser());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Type to search");
  const [results, setResults] = useState([]);
  const timerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getUser());
  }, [location.pathname]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!query.trim()) {
      setStatus("Type to search");
      setResults([]);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setStatus("Searching...");
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=8`);
        const data = await res.json();
        if (data.success && data.products.length > 0) {
          setResults(data.products);
          setStatus(`${data.products.length} results`);
        } else {
          setResults([]);
          setStatus("0 results");
        }
      } catch {
        setResults([]);
        setStatus("Search failed");
      }
    }, 250);

    return () => clearTimeout(timerRef.current);
  }, [open, query]);

  function onResultClick(id) {
    setOpen(false);
    setQuery("");
    navigate(`/detail?id=${id}`);
  }

  const loginLabel = user ? (user.username || user.email || "U").charAt(0).toUpperCase() : "L";
  const loginHref = user ? "/profile" : "/login";

  return (
    <>
      <header className="navbar">
        <button
          id="nav-menu-toggle"
          className="hamburger-btn"
          type="button"
          aria-label="Menu kholo"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="logo" onClick={() => navigate("/")}>VASTRA.</div>

        <ul className={`menu${open ? " open" : ""}`}>
          <li><Link to="/">HOME</Link></li>
          <li><Link to="/men">MEN</Link></li>
          <li><Link to="/women">WOMEN</Link></li>
          <li><Link to="/kids">KIDS</Link></li>
          <li><Link to="/accessories">ACCESSORIES</Link></li>
          <li><Link to="/about">ABOUT</Link></li>
          {user?.role === "brand" ? (
            <li id="nav-brand-link">
              <a href="/brand/dashboard" style={{ color: "#0f766e" }}>
                SELLER DASHBOARD
              </a>
            </li>
          ) : null}
          {user?.role === "admin" ? (
            <li id="nav-admin-link">
              <a href="/admin/dashboard" style={{ color: "#e63946" }}>
                ADMIN
              </a>
            </li>
          ) : null}
        </ul>

        <div className="icons">
          <button id="nav-search-btn" type="button" onClick={() => setOpen(true)}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
          <Link to="/wishlist" className="nav-icon-link">
            <i className="fa-regular fa-heart"></i>
          </Link>
          <Link to="/shopingbag" className="nav-icon-link">
            <i className="fa-solid fa-cart-shopping"></i>
          </Link>
          <Link id="nav-login-btn" to={loginHref} title={user?.username || "Login"}>
            {loginLabel}
          </Link>
        </div>
      </header>

      <div
        id="nav-menu-backdrop"
        className={`nav-menu-backdrop${open ? " show" : ""}`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      ></div>

      <div id="search-panel" className={`search-panel${open ? " open" : ""}`} aria-hidden={!open}>
        <div className="search-panel-header">
          <h3>SEARCH</h3>
          <button id="nav-search-close" type="button" aria-label="Close search" onClick={() => setOpen(false)}>
            &times;
          </button>
        </div>
        <input
          id="nav-search-input"
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div id="nav-search-status" className="search-status">{status}</div>
        <div id="nav-search-results" className="search-results">
          {results.length === 0 ? (
            status === "Searching..." ? null : <div className="search-empty">{status}</div>
          ) : (
            results.map((p) => (
              <div className="search-item" key={p._id} onClick={() => onResultClick(p._id)}>
                <img src={p.image} alt={p.name} onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/64"; }} />
                <div className="search-item-info">
                  <div className="search-item-name">{p.name}</div>
                  <div className="search-item-price">{formatINR(p.price)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div
        id="search-overlay"
        className={`search-overlay${open ? " show" : ""}`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      ></div>
    </>
  );
}

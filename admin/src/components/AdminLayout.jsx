import { Link } from "react-router-dom";

export default function AdminLayout({ active, title, topbarContent, children }) {
  function handleLogout() {
    localStorage.removeItem("vastra_admin_token");
    localStorage.removeItem("vastra_admin_user");
    window.location.href = "/admin";
  }
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>VASTRA.</h1>
          <span>ADMIN PANEL</span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={active === "dashboard" ? "active" : ""}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            DASHBOARD
          </Link>
          <Link to="/products" className={active === "products" ? "active" : ""}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            PRODUCTS
          </Link>
          <Link to="/orders" className={active === "orders" ? "active" : ""}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            ORDERS
          </Link>
          <Link to="/users" className={active === "users" ? "active" : ""}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            USERS
          </Link>
          <Link to="/brands" className={active === "brands" ? "active" : ""}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a4 4 0 100 8m0-8a4 4 0 110 8m0 0v2m0-2a4 4 0 100 8m0-8a4 4 0 110 8"/></svg>
            BRANDS
          </Link>
          <Link to="/discounts" className={active === "discounts" ? "active" : ""}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5 1A1.5 1.5 0 1111 6.5 1.5 1.5 0 019.5 9zm5 8A1.5 1.5 0 1116 15.5 1.5 1.5 0 0114.5 17z"/></svg>
            DISCOUNTS
          </Link>
          <Link to="/placements" className={active === "placements" ? "active" : ""}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            PLACEMENTS
          </Link>
          <Link to="/analytics" className={active === "analytics" ? "active" : ""}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 19h16M6 17V9m6 8V5m6 12v-6"/></svg>
            ANALYTICS
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <button id="admin-logout-btn" onClick={handleLogout}>LOGOUT</button>
        </div>
      </aside>

      <div className="main-content">
        <div className="topbar">
          <h2>{title}</h2>
          <div className="topbar-right">{topbarContent}</div>
        </div>
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}

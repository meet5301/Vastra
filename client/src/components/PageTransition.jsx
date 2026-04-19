import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition() {
  const location = useLocation();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 250);
    return () => clearTimeout(t);
  }, [location.pathname, location.search]);

  return (
    <div
      id="page-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "#fff",
        zIndex: 99999,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    />
  );
}

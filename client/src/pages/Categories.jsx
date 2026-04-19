import { useEffect } from "react";

export default function Categories() {
  useEffect(() => {
    return () => {};
  }, []);

  return (
    <main>
      <h1>CATEGORIES</h1>
      <div className="container">
        <section className="content">
          <div className="categories-grid">
            <div className="category-card" onClick={() => (window.location.href = "/men")}>
              <div className="category-card-image"><i className="fas fa-shirt"></i></div>
              <h3>MEN</h3>
              <p>Explore our collection of premium men's clothing</p>
              <button className="category-card-btn">VIEW ALL</button>
            </div>
            <div className="category-card" onClick={() => (window.location.href = "/women")}>
              <div className="category-card-image"><i className="fas fa-dress"></i></div>
              <h3>WOMEN</h3>
              <p>Discover elegant women's fashion essentials</p>
              <button className="category-card-btn">VIEW ALL</button>
            </div>
            <div className="category-card" onClick={() => (window.location.href = "/accessories")}>
              <div className="category-card-image"><i className="fas fa-ring"></i></div>
              <h3>ACCESSORIES</h3>
              <p>Complete your look with our accessories range</p>
              <button className="category-card-btn">VIEW ALL</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

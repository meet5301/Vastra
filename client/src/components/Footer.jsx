export default function Footer() {
  return (
    <footer className="vastra-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h1 className="footer-logo">VASTRA.</h1>
          <p className="footer-tagline">Premium fashion for the modern wardrobe.</p>
          <div className="footer-socials">
            <a href="#"><i className="fa-brands fa-instagram"></i></a>
            <a href="#"><i className="fa-brands fa-pinterest"></i></a>
            <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="#"><i className="fa-brands fa-x-twitter"></i></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>SHOP</h4>
          <a href="/men">Men</a>
          <a href="/women">Women</a>
          <a href="/accessories">Accessories</a>
          <a href="/shop">New Arrivals</a>
          <a href="/shop">Sale</a>
        </div>
        <div className="footer-col">
          <h4>HELP</h4>
          <a href="/contact">Contact Us</a>
          <a href="#">Shipping Info</a>
          <a href="#">Returns</a>
          <a href="#">Size Guide</a>
          <a href="#">FAQs</a>
        </div>
        <div className="footer-col">
          <h4>COMPANY</h4>
          <a href="/about">About Us</a>
          <a href="/journal">Style Journal</a>
          <a href="#">Careers</a>
          <a href="#">Press</a>
          <a href="#">Sustainability</a>
        </div>
        <div className="footer-newsletter">
          <h4>STAY IN STYLE</h4>
          <p>Get exclusive offers and new arrivals in your inbox.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Your email address" />
            <button>JOIN</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 VASTRA. All rights reserved.</p>
        <div className="footer-payments">
          <i className="fa-brands fa-cc-visa"></i>
          <i className="fa-brands fa-cc-mastercard"></i>
          <i className="fa-brands fa-cc-amex"></i>
          <i className="fa-brands fa-cc-paypal"></i>
        </div>
      </div>
    </footer>
  );
}

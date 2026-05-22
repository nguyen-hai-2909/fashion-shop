import { FaEnvelope, FaFacebookF, FaHome, FaInstagram, FaPhoneAlt, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer-main">
      <div className="footer-bottom">
        <div className="section-center footer-grid">
          <div className="footer-widget">
            <h3>About</h3>
            <p>
              With a friendly and dedicated support team, we always aim to
              deliver the best fashion shopping experience at ComfySloth.
            </p>
            <ul>
              <li>
                <FaHome /> Gia Lam, Hanoi
              </li>
              <li>
                <FaEnvelope /> nguyenphilong@gmail.com
              </li>
              <li>
                <FaPhoneAlt /> 0931.0808.18
              </li>
            </ul>
          </div>
          <div className="footer-widget">
            <h3>Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/products">Products</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link to="/cart">Cart</Link>
              </li>
            </ul>
          </div>
          <div className="footer-widget">
            <h3>Newsletter</h3>
            <form className="footer-newsletter" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" />
              <button type="submit">Subscribe</button>
            </form>
            <p className="footer-caption">
              Enter your email to get the latest deals and updates.
            </p>
            <div className="footer-social">
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                <FaFacebookF />
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                <FaInstagram />
              </a>
              <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">
                <FaYoutube />
              </a>
            </div>
          </div>
          <div className="footer-widget">
            <h3>Connect with us</h3>
            <iframe
              title="facebook-page"
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebook%2F&tabs&width=340&height=160&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true"
              width="100%"
              height="160"
              style={{ border: "none", overflow: "hidden" }}
              scrolling="no"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          </div>
        </div>
      </div>
      <div className="footer-copyright">
        <p>Copyright © 2026 Shop Anh Long</p>
      </div>
    </footer>
  );
};

export default Footer;

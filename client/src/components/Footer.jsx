import { Link } from 'react-router-dom';
import './Footer.css';
const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-brand">
        <h3>🍽️ SharePlate</h3>
        <p>Reducing food waste, one meal at a time.<br/>A Community Engagement Project,<br/>Thakur Shyamnarayan Degree College, Mumbai.</p>
      </div>
      <div className="footer-links">
        <h4>Quick Links</h4>
        <Link to="/">Home</Link><Link to="/about">About</Link><Link to="/find">Find Food</Link><Link to="/contact">Contact</Link>
      </div>
      <div className="footer-links">
        <h4>Get Involved</h4>
        <Link to="/register">Register as Donor</Link><Link to="/register">Register as NGO</Link><Link to="/donate">Donate Food</Link>
      </div>
    </div>
    <div className="footer-bottom"><p>© {new Date().getFullYear()} SharePlate. Built with ❤️ for the community.</p></div>
  </footer>
);
export default Footer;

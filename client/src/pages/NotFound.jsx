import { Link } from 'react-router-dom';
const NotFound = () => (
  <div className="section" style={{ textAlign: 'center' }}>
    <div className="container">
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>404</div>
      <h2>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  </div>
);
export default NotFound;

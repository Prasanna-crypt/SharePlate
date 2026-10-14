import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };
  const close = () => setOpen(false);
  const dash =
    user?.role === 'admin'
      ? '/dashboard/admin'
      : user?.role === 'donor'
      ? '/dashboard/donor'
      : '/dashboard/receiver';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={close}>
          <span className="logo-icon">🍽️</span>
          <span>SharePlate</span>
        </Link>
        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? '✕' : '☰'}
        </button>
        <div className={`nav-links ${open ? 'open' : ''}`}>
          <Link to="/" onClick={close}>Home</Link>
          <Link to="/about" onClick={close}>About</Link>
          <Link to="/find" onClick={close}>Find Food</Link>
          {(user?.role === 'donor' || user?.role === 'admin') && (
            <Link to="/donate" onClick={close}>Donate Food</Link>
          )}
          {user && <Link to="/dashboard/volunteer" onClick={close}>Volunteer Tasks</Link>}
          <Link to="/contact" onClick={close}>Contact</Link>
          {user ? (
            <div className="nav-user">
              <NotificationBell />
              <Link to={dash} className="nav-dash" onClick={close}>Dashboard</Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-outline btn-sm" onClick={close}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm btn-register" style={{ color: '#ffffff' }} onClick={close}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

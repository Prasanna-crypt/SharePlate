import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'donor',
    organisationName: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'donor' ? '/dashboard/donor' : '/dashboard/receiver');
    } catch (err) {
      if (!err.response) {
        setError(
          'Cannot connect to backend server. Make sure the backend is running on port 5000 (cd server && npm start).'
        );
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
      }
    }
    setLoading(false);
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="card">
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Join the Mumbai food redistribution community
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">I want to *</label>
              <select className="form-select" value={form.role} onChange={(e) => set('role', e.target.value)}>
                <option value="donor">Donate Food (Household / Restaurant / Caterer)</option>
                <option value="receiver">Receive Food (NGO / Volunteer / Shelter)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name or Contact Person *</label>
              <input
                type="text"
                className="form-input"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Ramesh Patel"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="e.g. ramesh@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password * (Min 6 characters)</label>
              <input
                type="password"
                className="form-input"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone Number *</label>
              <input
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="e.g. 9820011223"
                required
              />
            </div>
            {form.role === 'receiver' && (
              <div className="form-group">
                <label className="form-label">Organisation / Trust Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.organisationName}
                  onChange={(e) => set('organisationName', e.target.value)}
                  placeholder="e.g. Roti Foundation Charitable Trust"
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Locality / Area Address</label>
              <input
                type="text"
                className="form-input"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="e.g. Thakur Complex, Kandivali East, Mumbai"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

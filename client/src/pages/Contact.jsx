import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Contact = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('report');
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', message: '', type: reportId ? 'report' : 'feedback', listing: reportId || '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setStatus({ type: '', text: '' });
    try {
      const res = await API.post('/feedback', form);
      setStatus({ type: 'success', text: res.data.message });
      setForm({ ...form, message: '' });
    } catch (err) { setStatus({ type: 'error', text: err.response?.data?.message || 'Failed' }); }
    setLoading(false);
  };

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 550, margin: '0 auto' }}>
        <h2 className="section-title">{reportId ? 'Report a Listing' : 'Contact Us'}</h2>
        <p className="section-subtitle">{reportId ? 'Report a problem with this listing' : 'We\'d love to hear from you'}</p>
        <div className="card">
          {status.text && <div className={`alert alert-${status.type}`}>{status.text}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea className="form-textarea" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required placeholder={reportId ? 'Describe the problem...' : 'Your message...'} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Contact;

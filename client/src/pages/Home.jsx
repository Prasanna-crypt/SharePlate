import { Link } from 'react-router-dom';
import ImpactCounter from '../components/ImpactCounter';
import './Home.css';

const tips = [
  { icon: '🗓️', title: 'Plan Your Meals', desc: 'Plan weekly household portions and grocery lists to prevent excess food waste.' },
  { icon: '❄️', title: 'Store Food Properly', desc: 'Maintain clean, sealed containers and verify refrigeration temperatures (< 4°C).' },
  { icon: '♻️', title: 'Safe Handling of Leftovers', desc: 'Cool surplus meals quickly, avoid cross-contamination, and never leave hot food at room temperature.' },
  { icon: '🛡️', title: 'Food Safety Guidelines', desc: 'Only list food prepared hygienically, not previously served, and packed in clean food-grade containers.' },
];

const Home = () => (
  <div className="home">
    <section className="hero">
      <div className="container hero-content">
        <div className="project-badge">
          🎓 Community Engagement Project · B.Sc. Computer Science · Thakur Shyamnarayan Degree College, Mumbai
        </div>
        <h1>Don't Waste It,<br /><span>Share It.</span></h1>
        <p>
          A community bridge connecting households, restaurants, caterers, and housing societies with local NGOs and volunteers to redistribute safe surplus meals in Mumbai.
        </p>
        <div className="hero-btns">
          <Link to="/donate" className="btn btn-primary btn-lg">🍽️ Donate Food</Link>
          <Link to="/find" className="btn btn-outline btn-lg">🔍 Find Surplus Food</Link>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">A simple, transparent 3-step redistribution cycle</p>
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-num">1</span>
            <h3>List Surplus Food</h3>
            <p>Donors specify food type, quantity, safety checklist, and pin their pickup location.</p>
          </div>
          <div className="step-card">
            <span className="step-num">2</span>
            <h3>Claim & Coordinate</h3>
            <p>Verified NGOs and volunteers discover nearby food, claim it, and unlock contact details.</p>
          </div>
          <div className="step-card">
            <span className="step-num">3</span>
            <h3>Pickup & Deliver</h3>
            <p>Volunteers collect the food safely and distribute it to shelters and families in need.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <h2 className="section-title">Community Impact Counter</h2>
        <p className="section-subtitle">Live numbers pulled directly from our database</p>
        <ImpactCounter />
      </div>
    </section>

    <section className="section">
      <div className="container">
        <h2 className="section-title">Food Safety & Awareness</h2>
        <p className="section-subtitle">Best practices derived from our 85-respondent community survey in Mumbai</p>
        <div className="tips-grid">
          {tips.map((t) => (
            <div key={t.title} className="tip-card">
              <span className="tip-icon">{t.icon}</span>
              <h4>{t.title}</h4>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="cta-section">
      <div className="container" style={{ textAlign: 'center' }}>
        <h2>Every Meal Saved Feeds Someone in Need</h2>
        <p>Join over dozens of donors and NGOs across Kandivali, Borivali, and Malad.</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg">Join as Donor or NGO</Link>
          <Link to="/about" className="btn btn-outline btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>Read Survey Insights</Link>
        </div>
      </div>
    </section>
  </div>
);

export default Home;

import './About.css';

const About = () => (
  <div className="about-page">
    <section className="about-hero">
      <div className="container">
        <h1>Why Surplus Food Matters</h1>
        <p>Understanding the problem and how we can solve it together.</p>
      </div>
    </section>
    <section className="section">
      <div className="container about-content">
        <div className="about-card">
          <h2>📊 The Problem</h2>
          <p>In our survey of 85 respondents from Mumbai, we found that households, restaurants, caterers, and housing societies regularly have safe surplus food but end up throwing it away. The main barriers to donating are:</p>
          <ul>
            <li>People don't know where to donate</li>
            <li>Quantities seem too small to bother</li>
            <li>Transport and time are limited</li>
          </ul>
          <p>Prepared and cooked meals are the most common type of surplus food, and most respondents were willing to use a platform that connects them with people or organisations in need.</p>
        </div>
        <div className="about-card">
          <h2>💡 Our Solution</h2>
          <p>SharePlate is a simple, safe, and convenient platform where:</p>
          <ul>
            <li><strong>Donors</strong> list surplus food with details, location, and pickup time</li>
            <li><strong>Receivers</strong> (NGOs, volunteers, community organisations) find nearby food, claim it, and coordinate pickup</li>
            <li><strong>Volunteers</strong> help with delivery when donors or receivers can't transport food themselves</li>
          </ul>
        </div>
        <div className="about-card">
          <h2>🏫 About This Project</h2>
          <p>This platform is built as a Community Engagement Project by B.Sc. Computer Science students at Thakur Shyamnarayan Degree College, Mumbai. Our goal is to apply technology to address a real community problem — food waste and food insecurity — by making surplus food redistribution easier and more organised.</p>
        </div>
      </div>
    </section>
  </div>
);

export default About;

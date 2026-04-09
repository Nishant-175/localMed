import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Find Quality Healthcare, Instantly</h1>
          <p>Connect with nearby doctors in real-time. See live availability and book your appointment immediately.</p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/search')}>
              Find a Doctor
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/register')}>
              Join as Doctor
            </button>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose LocalMed?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-Time Availability</h3>
            <p>See which doctors are available right now, not outdated schedules.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Find Nearby Doctors</h3>
            <p>Search doctors by specialty and proximity to your location.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Easy Booking</h3>
            <p>Book appointments in seconds with just a few clicks.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Instant Notifications</h3>
            <p>Get real-time updates about your appointments and doctor availability.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Get Started?</h2>
        <p>Whether you're a patient seeking care or a doctor sharing your availability, LocalMed makes it easy.</p>
        <button className="btn btn-primary" onClick={() => navigate('/register')}>
          Sign Up Now
        </button>
      </section>
    </div>
  );
}

export default Home;

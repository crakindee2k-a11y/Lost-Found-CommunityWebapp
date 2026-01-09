import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
    return (
        <div className="about-page">
            <div className="about-hero">
                <h1>About FindX</h1>
                <p className="about-tagline">Reconnecting people with what matters most</p>
            </div>

            <div className="about-content">
                <section className="about-section">
                    <div className="section-icon">🎯</div>
                    <h2>Our Mission</h2>
                    <p>
                        FindX was created to bridge the gap between those who have lost something precious and those who have found it. 
                        We believe in the power of community and the kindness of strangers. Every day, people lose items that matter to them, 
                        and every day, kind souls find these items and want to return them. We're here to make those connections happen.
                    </p>
                </section>

                <section className="about-section">
                    <div className="section-icon">💡</div>
                    <h2>How It Works</h2>
                    <div className="steps-grid">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Create an Account</h3>
                            <p>Sign up in seconds to start posting</p>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Post Your Item</h3>
                            <p>Lost something? Found something? Post it with details</p>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Connect</h3>
                            <p>Browse listings and reunite with your belongings</p>
                        </div>
                    </div>
                </section>

                <section className="about-section">
                    <div className="section-icon">🌟</div>
                    <h2>Why Choose FindX?</h2>
                    <div className="features-grid">
                        <div className="feature">
                            <h4>🔍 Easy Search</h4>
                            <p>Advanced filters to find exactly what you're looking for</p>
                        </div>
                        <div className="feature">
                            <h4>📍 Location-Based</h4>
                            <p>Find items near you with location tracking</p>
                        </div>
                        <div className="feature">
                            <h4>⚡ Fast & Simple</h4>
                            <p>Post items in under 2 minutes</p>
                        </div>
                        <div className="feature">
                            <h4>🤝 Community Driven</h4>
                            <p>Built on trust and helping each other</p>
                        </div>
                    </div>
                </section>

                <section className="about-section cta-section">
                    <h2>Ready to Get Started?</h2>
                    <p>Join thousands of people who have successfully reunited with their belongings.</p>
                    <div className="cta-buttons">
                        <a href="/register" className="btn-primary">Sign Up Now</a>
                        <a href="/home" className="btn-secondary">Browse Items</a>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutUs;



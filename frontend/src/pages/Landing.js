import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleExploreClick = () => {
        navigate('/home');
    };

    React.useEffect(() => {
        // Add a class to body and html when Landing page is mounted
        document.body.classList.add('landing-page-body');
        document.documentElement.classList.add('landing-page-html');
        
        // Prevent scrolling
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // Remove the class and restore scrolling when component unmounts
        return () => {
            document.body.classList.remove('landing-page-body');
            document.documentElement.classList.remove('landing-page-html');
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, []);

    return (
        <div className="landing-page">
            {/* Success Stories - Real Community Impact */}
            <div className="floating-stories">
                <div className="story-card story-1">
                    <div className="story-header">
                        <div className="story-avatar">SM</div>
                        <div className="story-user-info">
                            <div className="story-name">
                                Sarah Martinez
                                <svg className="verified-badge" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <span className="story-date">3 days ago • Boston, MA</span>
                        </div>
                    </div>
                    <p className="story-text">
                        Left my iPhone 13 at the Esplanade during my morning jog. Posted here and got a message within 2 hours! 
                        A jogger found it and returned it with my photos still intact. This community is amazing! 🙏
                    </p>
                    <div className="story-tags">
                        <span className="story-tag resolved">✓ Reunited</span>
                        <span className="story-tag">📱 Phone</span>
                    </div>
                </div>
                
                <div className="story-card story-2">
                    <div className="story-header">
                        <div className="story-avatar">MR</div>
                        <div className="story-user-info">
                            <div className="story-name">
                                Michael Rodriguez
                                <svg className="verified-badge" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <span className="story-date">1 week ago • Austin, TX</span>
                        </div>
                    </div>
                    <p className="story-text">
                        My golden retriever Max escaped from the backyard. Posted his picture here with his favorite toy. 
                        Someone 5 blocks away recognized him and kept him safe until I arrived. Forever grateful!
                    </p>
                    <div className="story-tags">
                        <span className="story-tag resolved">✓ Reunited</span>
                        <span className="story-tag">🐕 Pet</span>
                    </div>
                </div>
                
                <div className="story-card story-3">
                    <div className="story-header">
                        <div className="story-avatar">AK</div>
                        <div className="story-user-info">
                            <div className="story-name">
                                Aisha Kumar
                                <svg className="verified-badge" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <span className="story-date">2 weeks ago • Seattle, WA</span>
                        </div>
                    </div>
                    <p className="story-text">
                        Lost my grandmother's gold bracelet at Pike Place Market. I was devastated thinking it was gone forever. 
                        A vendor found it near his stall and posted here. The sentimental value is priceless. Thank you FindX community!
                    </p>
                    <div className="story-tags">
                        <span className="story-tag resolved">✓ Reunited</span>
                        <span className="story-tag">💍 Jewelry</span>
                    </div>
                </div>
                
                <div className="story-card story-4">
                    <div className="story-header">
                        <div className="story-avatar">JC</div>
                        <div className="story-user-info">
                            <div className="story-name">
                                James Chen
                                <svg className="verified-badge" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <span className="story-date">4 days ago • NYC</span>
                        </div>
                    </div>
                    <p className="story-text">
                        Dropped my wallet with all my IDs and cards at the subway station during rush hour. 
                        A commuter posted it here with the location. Got everything back, even the $60 cash inside. 
                        Faith in humanity restored!
                    </p>
                    <div className="story-tags">
                        <span className="story-tag resolved">✓ Reunited</span>
                        <span className="story-tag">💳 Wallet</span>
                    </div>
                </div>
                
                <div className="story-card story-5">
                    <div className="story-header">
                        <div className="story-avatar">EP</div>
                        <div className="story-user-info">
                            <div className="story-name">
                                Emily Parker
                                <svg className="verified-badge" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <span className="story-date">5 days ago • Portland, OR</span>
                        </div>
                    </div>
                    <p className="story-text">
                        My MacBook with 3 years of photography work was left at a coffee shop. 
                        The barista found it and posted here immediately. Connected within minutes and recovered it the same day. 
                        You saved my portfolio!
                    </p>
                    <div className="story-tags">
                        <span className="story-tag resolved">✓ Reunited</span>
                        <span className="story-tag">💻 Laptop</span>
                    </div>
                </div>
                
                <div className="story-card story-6">
                    <div className="story-header">
                        <div className="story-avatar">DT</div>
                        <div className="story-user-info">
                            <div className="story-name">
                                David Thompson
                                <svg className="verified-badge" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <span className="story-date">1 week ago • Chicago, IL</span>
                        </div>
                    </div>
                    <p className="story-text">
                        House keys with my car fob fell out of my pocket at the park while playing with my kids. 
                        Posted in panic mode. A neighbor saw the listing and messaged me - keys were safe at the park office. 
                        This platform is a lifesaver!
                    </p>
                    <div className="story-tags">
                        <span className="story-tag resolved">✓ Reunited</span>
                        <span className="story-tag">🔑 Keys</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-left">
                    <button 
                        className="menu-toggle"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>

                <div className="nav-right">
                    <Link to="/home" className="nav-link">Home</Link>
                    <Link to="/about" className="nav-link">About Us</Link>
                    <Link to="/stories" className="nav-link">Stories</Link>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
                <Link to="/home" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link to="/about" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>About Us</Link>
                <Link to="/stories" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Stories</Link>
            </div>

            {/* Hero Section */}
            <div className="landing-hero">
                <div className="hero-content">
                    <h1 className="hero-logo">
                        FIND<span className="logo-x">X</span>
                    </h1>
                    <p className="hero-tagline">
                        <span className="highlight-text">Reconnecting</span> people with <span className="highlight-text">what matters most</span>
                    </p>
                    
                    <Link to="/login" className="cta-button-primary">
                        <span>Sign In</span>
                        <svg className="button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-4l5-5-5-5m5 5H3"/>
                        </svg>
                    </Link>

                    <button className="secondary-link" onClick={handleExploreClick}>
                        Explore the archive →
                    </button>
                </div>
                {/* Social Media Icons */}
                <div className="social-icons">
                    <a href="#" className="social-icon" aria-label="Facebook">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </a>
                    <a href="#" className="social-icon" aria-label="Instagram">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                        </svg>
                    </a>
                    <a href="#" className="social-icon" aria-label="WhatsApp">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                    </a>
                    <a href="#" className="social-icon" aria-label="X">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Landing;



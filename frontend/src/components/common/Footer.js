import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>FindX</h3>
                        <p>Helping people reunite with their lost items since 2024.</p>
                    </div>

                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="/">Home</a></li>
                            <li><a href="/create-post">Report Lost Item</a></li>
                            <li><a href="/create-post">Report Found Item</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Contact</h4>
                        <ul>
                            <li>Email: support@findx.com</li>
                            <li>Phone: (555) 123-FIND</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2024 FindX. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
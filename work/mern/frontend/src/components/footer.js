
import React, { useState, useEffect } from "react";
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark-mode') || document.body.classList.contains('dark-mode'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="pt-lg-10 pt-5 footer bg-white" style={{ 
      borderTop: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9',
      background: isDarkMode ? '#0f172a' : '#ffffff'
    }}>
      <style>{`
        /* Modern Footer Styling */
        .footer {
          font-family: "Open Sans", sans-serif;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        .dark-mode .footer {
          background: #0f172a;
          color: #e2e8f0;
        }

        .dark-mode .footer h2,
        .dark-mode .footer h3 {
          color: #e2e8f0;
        }

        /* Override inline styles for AttendEase heading in dark mode */
        .dark-mode .footer h2 {
          color: #e2e8f0 !important;
        }

        /* Only target the first strong (Attend), not the one with green color */
        .dark-mode .footer h2 strong:first-of-type {
          color: #e2e8f0 !important;
        }

        /* Keep Ease green in dark mode - target the second strong element */
        .dark-mode .footer h2 strong:last-of-type,
        .dark-mode .footer h2 strong[style*="42c488"] {
          color: #42c488 !important;
        }

        .dark-mode .footer p {
          color: #cbd5e1;
        }

        .footer h2, .footer h3 {
          font-family: "Open Sans", sans-serif;
          font-weight: 700;
        }

        .footer p, .footer a {
          font-family: "Open Sans", sans-serif;
        }

        .footer .nav-link {
          color: #64748b;
          font-size: 14px;
          padding: 0.5rem 0;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .dark-mode .footer .nav-link {
          color: #cbd5e1;
        }

        .footer .nav-link:hover {
          color: #42c488;
          padding-left: 0.5rem;
        }

        .footer-social {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .footer-social a {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          color: #64748b;
          border-radius: 10px;
          transition: all 0.3s ease;
          font-size: 18px;
        }

        .footer-social a:hover {
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          color: #ffffff;
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(66, 196, 136, 0.3);
        }

        .dark-mode .footer-social a {
          background: #334155;
          color: #cbd5e1;
        }

        .footer-contact-info {
          color: #64748b;
          font-size: 14px;
          line-height: 1.8;
        }

        .dark-mode .footer-contact-info {
          color: #cbd5e1;
        }

        .footer-contact-info a {
          color: #42c488;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .footer-contact-info a:hover {
          color: #38a169;
          text-decoration: underline;
        }

        .footer-bottom {
          border-top: 1px solid #e2e8f0;
          padding-top: 2rem;
          margin-top: 3rem;
        }

        .dark-mode .footer-bottom {
          border-top: 1px solid #334155;
        }

        .footer-bottom .nav-link {
          color: #94a3b8;
          font-size: 13px;
          padding: 0.25rem 0.5rem;
        }

        .dark-mode .footer-bottom .nav-link {
          color: #cbd5e1;
        }

        .footer-bottom .nav-link:hover {
          color: #42c488;
          padding-left: 0.75rem;
        }

        /* Override bg-white class in dark mode */
        .dark-mode .footer.bg-white {
          background: #0f172a !important;
        }

        /* Ensure footer is visible in dark mode */
        .dark-mode footer {
          background: #0f172a !important;
          color: #e2e8f0 !important;
        }
      `}</style>

      <div className="container">
        <div className="row">
          {/* About + Socials */}
          <div className="col-lg-4 col-md-6 col-12 mb-4 mb-lg-0">
            <div className="mb-4 d-flex align-items-center">
              <img
                src="/icons/icon.png"
                alt="AttendEase logo"
                className="logo-inverse"
                style={{
                  height: "50px",
                  width: "auto",
                }}
              />
              <div className="ms-3">
                <h2 className="mb-0" style={{ fontSize: '24px', fontWeight: '700', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                  <strong>Attend</strong>
                  <strong style={{ color: "#42c488" }}>Ease</strong>
                </h2>
              </div>
            </div>

            <div className="mt-4">
              <p style={{ color: isDarkMode ? '#cbd5e1' : '#64748b', fontSize: '15px', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Streamline your workforce management with our modern attendance and leave management platform. 
                Track, manage, and optimize your team's productivity effortlessly.
              </p>

              {/* Social media */}
              <div className="footer-social">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <i className="bi bi-twitter"></i>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <i className="bi bi-linkedin"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="bi bi-instagram"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div className="col-lg-2 col-md-3 col-6 mb-4 mb-lg-0">
            <div className="mb-4">
              <h3 className="fw-bold mb-3" style={{ fontSize: '18px', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Company</h3>
              <ul className="list-unstyled nav nav-footer flex-column nav-x-0">
                <li><a href="#home-section" className="nav-link">About Us</a></li>
                <li><a href="#features-section" className="nav-link">Features</a></li>
                <li><a href="#pricing-section" className="nav-link">Pricing</a></li>
                <li><a href="#blog-section" className="nav-link">Blog</a></li>
                <li><a href="#contact-section" className="nav-link">Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Support Links */}
          <div className="col-lg-2 col-md-3 col-6 mb-4 mb-lg-0">
            <div className="mb-4">
              <h3 className="fw-bold mb-3" style={{ fontSize: '18px', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Support</h3>
              <ul className="list-unstyled nav nav-footer flex-column nav-x-0">
                <li><a href="#attendease-faq" className="nav-link">Help Center</a></li>
                <li><a href="#attendease-faq" className="nav-link">FAQ's</a></li>
                <li><a href="/register" className="nav-link">Get Started</a></li>
                <li><a href="/login" className="nav-link">Login</a></li>
                <li><a href="#contact-section" className="nav-link">Contact Support</a></li>
              </ul>
            </div>
          </div>

          {/* Resources */}
          <div className="col-lg-2 col-md-3 col-6 mb-4 mb-lg-0">
            <div className="mb-4">
              <h3 className="fw-bold mb-3" style={{ fontSize: '18px', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Resources</h3>
              <ul className="list-unstyled nav nav-footer flex-column nav-x-0">
                <li><a href="#blog-section" className="nav-link">Blog</a></li>
                <li><a href="#features-section" className="nav-link">Documentation</a></li>
                <li><a href="#pricing-section" className="nav-link">Pricing Plans</a></li>
                <li><a href="#attendease-faq" className="nav-link">Guides</a></li>
                <li><a href="#contact-section" className="nav-link">API Access</a></li>
              </ul>
            </div>
          </div>

          {/* Get in touch */}
          <div className="col-lg-2 col-md-12">
            <div className="mb-4">
              <h3 className="fw-bold mb-3" style={{ fontSize: '18px', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Get in touch</h3>
              <div className="footer-contact-info">
                <p style={{ marginBottom: '1rem' }}>
                  123 Business Street<br />
                  Suite 100<br />
                  San Francisco, CA 94105
                </p>
                <p className="mb-2">
                  Email: <a href="mailto:support@attendease.com">support@attendease.com</a>
                </p>
                <p>
                  Phone: <a href="tel:+1234567890">+1 (234) 567-890</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="footer-bottom">
          <div className="row align-items-center g-0">
            <div className="col-12 col-md-5 col-lg-6 text-center text-md-start mb-3 mb-md-0">
              <p className="mb-0" style={{ color: isDarkMode ? '#94a3b8' : '#94a3b8', fontSize: '14px' }}>
                &copy; {currentYear} AttendEase. All rights reserved.
              </p>
            </div>

            <div className="col-12 col-md-7 col-lg-6 d-md-flex justify-content-end">
              <nav className="nav nav-footer justify-content-center justify-content-md-end" aria-label="Footer policies">
                <a className="nav-link ps-0" href="#">Privacy Policy</a>
                <a className="nav-link px-2 px-md-3" href="#">Cookie Notice</a>
                <a className="nav-link" href="#">Terms of Use</a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle,
  ChevronDown,
  SunFill,
  MoonStarsFill,
  List,
  XLg
} from "react-bootstrap-icons";

export default function Header({ isDarkMode = false, toggleTheme = () => {} }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();

  const navLinks = [
    { id: 'home', label: 'Home', href: '#home-section' },
    { id: 'features', label: 'Features', href: '#features-section', hasDropdown: true },
    { id: 'pricing', label: 'Pricing', href: '#pricing-section' },
    { id: 'blog', label: 'Blog', href: '#blog-section' },
    { id: 'contact', label: 'Contact', href: '#contact-section' },
  ];

  // Detect which section is currently in view
  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => link.href.replace('#', ''));
      const headerOffset = 150;
      
      // Check each section to see which one is in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= headerOffset && rect.bottom >= headerOffset) {
            setActiveSection(`#${sectionId}`);
            // Update hash in URL without triggering scroll
            if (window.location.hash !== `#${sectionId}`) {
              window.history.replaceState(null, '', `#${sectionId}`);
            }
            break;
          }
        }
      }
      
      // If scrolled to top, set home as active
      if (window.scrollY < 100) {
        setActiveSection('#home-section');
        if (location.pathname === '/' && window.location.hash !== '#home-section' && !window.location.hash) {
          window.history.replaceState(null, '', location.pathname);
        }
      }
    };

    // Initial check
    handleScroll();
    
    // Check on scroll
    window.addEventListener('scroll', handleScroll);
    
    // Check on hash change
    const handleHashChange = () => {
      const hash = window.location.hash || '#home-section';
      setActiveSection(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [location.pathname]);

  const isActive = (path) => {
    if (location.pathname !== '/' && location.pathname !== '') {
      return false;
    }
    
    // Use activeSection state if available, otherwise fallback to hash
    if (activeSection) {
      return activeSection === path;
    }
    
    // Fallback to hash-based detection
    if (path === '#home-section') {
      return !window.location.hash || window.location.hash === '' || window.location.hash === '#home-section';
    }
    return window.location.hash === path;
  };

  const buildNavTarget = (hash) => ({
    pathname: '/',
    hash
  });

  const featuresItems = [
    { label: 'Admin Dashboard', href: '#features-section' },
    { label: 'Manager Dashboard', href: '#features-section' },
    { label: 'Employee Dashboard', href: '#features-section' },
    { label: 'Real-Time Tracking', href: '#features-section' },
    { label: 'Analytics & Reports', href: '#features-section' },
  ];

  // Unified navigation handler for all navbar links
  const handleNavClick = (e, href) => {
    e.preventDefault();
    const hash = href.replace('#', '');
    const sectionId = hash || href;
    
    if (location.pathname === '/' || location.pathname === '') {
      // Already on home page, scroll to section
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          // Account for fixed header height
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Update hash without triggering scroll
          window.history.pushState(null, '', href);
        } else {
          // Fallback: use hash navigation
          window.location.hash = href;
        }
      }, 10);
    } else {
      // Navigate to home page with hash
      const target = buildNavTarget(href);
      window.location.href = target.pathname + target.hash;
    }
  };

  const handleDropdownItemClick = (e, href) => {
    handleNavClick(e, href);
  };

  // Handle initial hash navigation on page load
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '') {
      const hash = location.hash || window.location.hash;
      if (hash) {
        setTimeout(() => {
          const sectionId = hash.replace('#', '');
          const element = document.getElementById(sectionId);
          if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <style>{`
        .modern-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 1000;
          border-bottom: 1px solid rgba(51, 65, 85, 0.15);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease, background 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .header-spacer {
          height: 84px;
        }

        .modern-header.light {
          background: rgba(248, 250, 252, 0.95);
          border-bottom-color: rgba(203, 213, 225, 0.7);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
        }

        .modern-header.dark {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(19, 78, 74, 0.95) 100%);
          border-bottom-color: rgba(51, 65, 85, 0.3);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
        }

        .modern-header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: inherit;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          border: 2px solid #42c488;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(66, 196, 136, 0.1);
        }

        .logo-icon svg {
          width: 24px;
          height: 24px;
          color: #42c488;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .modern-header.light .logo-text .attend {
          color: #0f172a;
        }

        .modern-header.dark .logo-text .attend {
          color: #e2e8f0;
        }

        .logo-text .ease {
          color: #42c488;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 2rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-item {
          position: relative;
        }

        .nav-link {
          color: #475569;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          padding: 0.5rem 0;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
          background: none;
          border: none;
        }

        .modern-header.dark .nav-link {
          color: #e2e8f0;
        }

        .nav-link:hover {
          color: #10b981;
        }

        .nav-link.active {
          color: #10b981;
          position: relative;
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #42c488;
          border-radius: 2px;
        }

        .dropdown-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.2s ease;
        }

        .nav-item:hover .dropdown-icon {
          transform: rotate(180deg);
        }

        .features-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.5rem;
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.1);
          border-radius: 8px;
          padding: 0.5rem;
          min-width: 200px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
          list-style: none;
          z-index: 100;
        }

        .nav-item:hover .features-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .modern-header.dark .features-dropdown {
          background: #1e293b;
          border-color: rgba(51, 65, 85, 0.5);
        }

        .dropdown-item {
          display: block;
          padding: 0.625rem 0.875rem;
          color: #e2e8f0;
          text-decoration: none;
          font-size: 0.9rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .modern-header.light .dropdown-item {
          color: #0f172a;
        }

        .dropdown-item:hover {
          background: rgba(66, 196, 136, 0.1);
          color: #10b981;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .theme-toggle {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 1px solid rgba(51, 65, 85, 0.5);
          background: rgba(51, 65, 85, 0.08);
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modern-header.dark .theme-toggle {
          color: #fbbf24;
          background: rgba(51, 65, 85, 0.2);
          border-color: rgba(148, 163, 184, 0.35);
        }

        .theme-toggle:hover {
          background: rgba(16, 185, 129, 0.12);
          border-color: #10b981;
          color: #0f172a;
        }

        .modern-header.dark .theme-toggle:hover {
          color: #fbbf24;
        }

        .theme-toggle svg {
          width: 20px;
          height: 20px;
        }

        .btn-login {
          padding: 0.625rem 1.5rem;
          border: 2px solid #10b981;
          background: transparent;
          color: #0f172a;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .modern-header.dark .btn-login {
          color: #e2e8f0;
        }

        .btn-login:hover {
          background: rgba(16, 185, 129, 0.08);
          color: #0f172a;
        }

        .modern-header.dark .btn-login:hover {
          color: #42c488;
        }

        .btn-signup {
          padding: 0.625rem 1.5rem;
          border: 2px solid #10b981;
          background: #10b981;
          color: #ffffff;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-signup:hover {
          background: #0ea572;
          border-color: #0ea572;
        }

        .mobile-menu-toggle {
          display: none;
          width: 40px;
          height: 40px;
          border: none;
          background: rgba(51, 65, 85, 0.2);
          border-radius: 8px;
          color: #e2e8f0;
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }

        .mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(248, 250, 252, 0.96);
          border-top: 1px solid rgba(226, 232, 240, 0.9);
          padding: 1rem 2rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .modern-header.dark .mobile-menu {
          background: rgba(30, 41, 59, 0.95);
          border-top-color: rgba(51, 65, 85, 0.5);
        }

        .mobile-menu.open {
          display: block;
        }

        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .mobile-nav-item {
          position: relative;
        }

        .mobile-nav-link {
          color: #0f172a;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          padding: 0.75rem 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }

        .modern-header.dark .mobile-nav-link {
          color: #e2e8f0;
          border-bottom-color: rgba(51, 65, 85, 0.4);
        }

        .mobile-nav-link.active {
          color: #10b981;
        }

        .mobile-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(51, 65, 85, 0.3);
        }

        @media (max-width: 1024px) {
          .header-nav,
          .header-actions .btn-login,
          .header-actions .btn-signup {
            display: none;
          }

          .mobile-menu-toggle {
            display: flex;
          }

          .mobile-menu {
            display: block;
          }

          .header-actions {
            gap: 0.5rem;
          }
        }

        @media (max-width: 640px) {
          .modern-header-container {
            padding: 1rem;
          }

          .logo-text {
            font-size: 1.25rem;
          }

          .theme-toggle {
            width: 36px;
            height: 36px;
          }

          .btn-login,
          .btn-signup {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
        }
      `}</style>

      <header className={`modern-header ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="modern-header-container">
          {/* Logo */}
          <Link to="/" className="header-logo">
            <div className="logo-icon">
              <CheckCircle />
            </div>
            <div className="logo-text">
              <span className="attend">Attend</span>
              <span className="ease"> Ease</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav-wrapper">
            <ul className="header-nav">
              {navLinks.map((link) => (
                <li key={link.id} className="nav-item">
                  {link.hasDropdown ? (
                    <>
                      <a
                        href={link.href}
                        className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, link.href)}
                      >
                        {link.label}
                        <ChevronDown className="dropdown-icon" />
                      </a>
                      <ul className="features-dropdown">
                        {featuresItems.map((item, index) => (
                          <li key={index}>
                            <a 
                              href={item.href} 
                              className="dropdown-item"
                              onClick={(e) => handleDropdownItemClick(e, item.href)}
                            >
                              {item.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <a
                      href={link.href}
                      className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
                      onClick={(e) => handleNavClick(e, link.href)}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Actions */}
          <div className="header-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <SunFill /> : <MoonStarsFill />}
            </button>
            <Link to="/login" className="btn-login">
              Login
            </Link>
            <Link to="/register" className="btn-signup">
              Sign Up
            </Link>
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <XLg /> : <List />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <ul className="mobile-nav">
            {navLinks.map((link) => (
              <li key={link.id} className="mobile-nav-item">
                <a
                  href={link.href}
                  className={`mobile-nav-link ${isActive(link.href) ? 'active' : ''}`}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handleNavClick(e, link.href);
                  }}
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown />}
                </a>
                {link.hasDropdown && (
                  <ul style={{ listStyle: 'none', padding: '0.5rem 0 0 1rem', margin: 0 }}>
                    {featuresItems.map((item, index) => (
                      <li key={index}>
                        <a 
                          href={item.href} 
                          className="dropdown-item"
                          onClick={(e) => {
                            setIsMobileMenuOpen(false);
                            handleDropdownItemClick(e, item.href);
                          }}
                          style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className="mobile-actions">
            <Link
              to="/login"
              className="btn-login"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn-signup"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>
      <div className="header-spacer" />
    </>
  );
}
 


import React, { useState, useEffect } from "react";
import Header from "./header";
import Footer from "./footer";
import { PublicLoadingPage } from "./PublicLoadingPage";

// Counter component for animated statistics
function StatisticCounter({ end, suffix = '', label, isDarkMode, decimals = 0, format = '' }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          const startTime = Date.now();
          const duration = 1800; // Medium speed animation - 1.8 seconds
          const startValue = 0;
          
          const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth fast animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (end - startValue) * easeOutQuart;
            
            setCount(currentValue);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
              setHasAnimated(true);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );
    
    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }
    
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [end, hasAnimated]);

  const formatNumber = (num) => {
    if (decimals > 0) {
      return num.toFixed(decimals) + suffix;
    }
    if (format === 'K' && num >= 1000) {
      return (num / 1000).toFixed(0) + 'K' + suffix;
    }
    return Math.floor(num) + suffix;
  };

  return (
    <div className="col-md-3 col-6 text-center mb-4 mb-md-0">
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '48px', fontWeight: '800', color: '#42c488', margin: 0, fontFamily: '"Open Sans", sans-serif' }}>
          {formatNumber(count)}
        </h3>
        <p style={{ fontSize: '16px', color: isDarkMode ? '#cbd5e1' : '#64748b', margin: '0.5rem 0 0', fontFamily: '"Open Sans", sans-serif' }}>
          {label}
        </p>
      </div>
    </div>
  );
}

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('home-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Handle scroll for back to top button
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll-triggered animations for all sections
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Handle stagger-fade-up sections - they handle children via CSS
          if (entry.target.classList.contains('stagger-fade-up')) {
            // stagger-fade-up CSS handles direct children automatically
          } else if (entry.target.classList.contains('site-section')) {
            // For site-section, animate all child elements with animation classes
            const children = entry.target.querySelectorAll('.animate-child, .feature-v1, .feature-v2, .slide-in-left, .slide-in-right, .scale-in, .rotate-in, .fade-blur');
            children.forEach((child, index) => {
              // Only add animate-in if it doesn't already have it
              if (!child.classList.contains('animate-in')) {
                setTimeout(() => {
                  child.classList.add('animate-in');
                }, child.classList.contains('animate-child') ? index * 100 : index * 150);
              }
            });
          } else {
            // For other sections, stagger animation for animate-child elements only
            const children = entry.target.querySelectorAll('.animate-child');
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('animate-in');
              }, index * 100);
            });
          }
          
          // Unobserve after animation is triggered to improve performance
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Helper function to check if element is in viewport
    const isInViewport = (element) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= -100 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 100 &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    };

    // Function to find and observe all animated elements
    const observeElements = () => {
      // Observe main sections
      const sections = document.querySelectorAll('.site-section, .feature-v1, .feature-v2, .pricing .border, .testimonial, .h-entry, .stagger-fade-up');
      
      sections.forEach((section) => {
        // If element is already in viewport, animate it immediately
        if (isInViewport(section)) {
          section.classList.add('animate-in');
          // Animate children for stagger-fade-up sections
          if (section.classList.contains('stagger-fade-up')) {
            // stagger-fade-up handles its children via CSS, so we're done
          } else if (section.classList.contains('site-section')) {
            // For site-section, animate all child elements with animation classes
            const children = section.querySelectorAll('.animate-child, .feature-v1, .feature-v2, .slide-in-left, .slide-in-right, .scale-in, .rotate-in, .fade-blur');
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('animate-in');
              }, child.classList.contains('animate-child') ? index * 100 : index * 150);
            });
          } else {
            // For other sections, animate their animate-child elements
            const children = section.querySelectorAll('.animate-child');
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('animate-in');
              }, index * 100);
            });
          }
        } else {
          // Otherwise, observe it for when it comes into view
          observer.observe(section);
        }
      });

      // Observe all individual feature items and animation-class elements
      const animatedElements = document.querySelectorAll('.feature-v1, .feature-v2, .slide-in-left, .slide-in-right, .scale-in, .rotate-in, .fade-blur, .animate-child');
      
      animatedElements.forEach((element) => {
        // Skip if already part of an observed parent
        const hasAnimatedParent = element.closest('.site-section.animate-in, .stagger-fade-up.animate-in');
        if (hasAnimatedParent && element.classList.contains('animate-child')) {
          // Parent will handle this child, skip
          return;
        }
        
        // If element is already in viewport, animate it immediately
        if (isInViewport(element)) {
          element.classList.add('animate-in');
        } else {
          // Check if it's not already being observed
          let isObserved = false;
          sections.forEach((section) => {
            if (section.contains(element) && section !== element) {
              isObserved = true;
            }
          });
          
          if (!isObserved) {
            observer.observe(element);
          }
        }
      });
    };

    // Wait for DOM to be ready, then set up animations
    let timeoutId, timeoutId2;
    let domContentLoadedHandler;
    let rafId;

    const startAnimations = () => {
      // Use requestAnimationFrame to ensure React rendering is complete
      rafId = requestAnimationFrame(() => {
        // Then wait a small amount for layout to settle
        timeoutId = setTimeout(observeElements, 50);
      });
    };

    if (document.readyState === 'loading') {
      domContentLoadedHandler = () => {
        startAnimations();
      };
      document.addEventListener('DOMContentLoaded', domContentLoadedHandler);
    } else {
      // DOM is already ready, but wait for React to finish rendering
      startAnimations();
    }

    // Re-check after a delay to catch any late-loading elements
    timeoutId2 = setTimeout(() => {
      observeElements();
    }, 800);

    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
      if (timeoutId2) clearTimeout(timeoutId2);
      if (rafId) cancelAnimationFrame(rafId);
      if (domContentLoadedHandler) {
        document.removeEventListener('DOMContentLoaded', domContentLoadedHandler);
      }
    };
  }, []);

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
    // Save preference
    localStorage.setItem('home-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {isLoading && <PublicLoadingPage onComplete={() => setIsLoading(false)} />}
      <div className={`site-wrap ${isDarkMode ? 'dark-mode' : ''}`}>
        <style>{`
        /* Modern Trending UI Styles */
        .site-wrap {
          overflow-x: hidden;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Dark Mode Base Styles */
        .site-wrap.dark-mode,
        body.dark-mode {
          background-color: #0f172a;
          color: #e2e8f0;
        }

        .site-wrap.dark-mode * {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }

        /* Override Bootstrap bg-light in dark mode */
        .dark-mode .bg-light {
          background-color: #1e293b !important;
          background: #1e293b !important;
        }

        .dark-mode section.bg-light {
          background-color: #1e293b !important;
          background: #1e293b !important;
        }

        /* Ensure all text is visible in dark mode */
        .dark-mode .site-section {
          background-color: #1e293b !important;
        }

        .dark-mode .site-section.bg-light {
          background-color: #1e293b !important;
          background: #1e293b !important;
        }

        /* Global Font Matching - Consistent Typography */
        .site-wrap {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
        }

        .site-wrap h1,
        .site-wrap h2,
        .site-wrap h3,
        .site-wrap h4,
        .site-wrap h5,
        .site-wrap h6,
        .site-wrap .hero-heading,
        .site-wrap .section-title-1,
        .site-wrap .section-title-2,
        .site-wrap .display-3 {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif !important;
        }

        .site-wrap p,
        .site-wrap span:not([class*="icon"]):not(.wrap-icon),
        .site-wrap a,
        .site-wrap li,
        .site-wrap label,
        .site-wrap input,
        .site-wrap textarea,
        .site-wrap button,
        .site-wrap .subtitle-1,
        .site-wrap .lead {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif !important;
        }

        /* Preserve icon fonts */
        .site-wrap [class*="icon"],
        .site-wrap .wrap-icon,
        .site-wrap .icon-room,
        .site-wrap .icon-phone,
        .site-wrap .icon-mail_outline {
          font-family: "icomoon" !important;
        }

        /* Hero Section Modern Styling */
        .hero {
          position: relative;
          padding-top: 12rem;
          padding-bottom: 6rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
          overflow: hidden;
        }

        .dark-mode .hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%) !important;
        }

        body.dark-mode .hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%) !important;
        }

        .hero::before {
          content: '';
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(66, 196, 136, 0.15) 0%, transparent 70%);
          top: -400px;
          right: -400px;
          border-radius: 50%;
          animation: float 20s ease-in-out infinite;
        }

        .hero::after {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(66, 196, 136, 0.1) 0%, transparent 70%);
          bottom: -300px;
          left: -300px;
          border-radius: 50%;
          animation: float 25s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }

        .hero-heading {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 56px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #42c488 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: fadeInUp 0.8s ease-out;
          color: #0f172a;
        }

        .dark-mode .hero-heading {
          background: none !important;
          -webkit-background-clip: unset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
          background-clip: unset !important;
          color: #e2e8f0 !important;
        }

        body.dark-mode .hero-heading {
          background: none !important;
          -webkit-background-clip: unset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
          background-clip: unset !important;
          color: #e2e8f0 !important;
        }

        .dark-mode .hero-heading span {
          color: #e2e8f0 !important;
          -webkit-text-fill-color: #e2e8f0 !important;
        }

        .hero-heading strong {
          color: #42c488 !important;
          -webkit-text-fill-color: #42c488 !important;
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .dark-mode .hero-heading strong {
          color: #42c488 !important;
          -webkit-text-fill-color: #42c488 !important;
        }
        
        /* Attend text styling - black in light mode, white in dark mode */
        .hero-heading .hero-attend {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
        }

        .dark-mode .hero-heading .hero-attend {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        .hero-heading strong1 {
          color: #42c488 !important;
          -webkit-text-fill-color: #42c488 !important;
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .dark-mode .hero-heading strong1 {
          color: #42c488 !important;
          -webkit-text-fill-color: #42c488 !important;
        }

        .hero p {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 20px;
          font-weight: 400;
          color: #64748b;
          margin-bottom: 2rem;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .dark-mode .hero p {
          color: #cbd5e1 !important;
        }

        body.dark-mode .hero p {
          color: #cbd5e1 !important;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero .btn-primary {
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          border: none;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(66, 196, 136, 0.3);
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease-out 0.4s both;
          position: relative;
          overflow: hidden;
        }

        .hero .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .hero .btn-primary:hover::before {
          left: 100%;
        }

        .hero .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(66, 196, 136, 0.4);
        }

        .hero img {
          animation: fadeInUp 0.8s ease-out 0.6s both, floatImage 6s ease-in-out infinite;
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.1));
        }

        @keyframes floatImage {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        /* Features Section Modern Styling */
        #features-section {
          position: relative;
          padding: 6rem 0;
          background: #ffffff;
        }

        .dark-mode #features-section {
          background: #1e293b;
        }

        .section-title-1, .section-title-2 {
          position: relative;
          display: inline-block;
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-weight: 700;
          text-align: center;
          width: 100%;
        }

        .section-title-1::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 4px;
          background: linear-gradient(90deg, #42c488, #38a169);
          border-radius: 2px;
        }

        .subtitle-1 {
          display: block;
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #42c488;
          margin-bottom: 1rem;
          position: relative;
          text-align: center;
          width: 100%;
        }

        .dark-mode .subtitle-1 {
          color: #42c488 !important;
        }

        /* Force dark backgrounds for all sections in dark mode */
        .dark-mode #blog-section,
        .dark-mode #contact-section,
        .dark-mode #attendease-faq {
          background-color: #1e293b !important;
          background: #1e293b !important;
        }

        /* Center align section headers */
        #features-section .col-12.text-center,
        #features-section .subtitle-1,
        #features-section .section-title-1 {
          text-align: center !important;
          display: block;
        }

        /* More Features Section */
        .site-section .col-md-7.text-center,
        .site-section .subtitle-1,
        .site-section .section-title-1 {
          text-align: center !important;
        }

        /* Testimonials Section */
        #testimonials-section .col-12.text-center,
        #testimonials-section .subtitle-1,
        #testimonials-section .section-title-1 {
          text-align: center !important;
          display: block;
        }

        /* Pricing Section */
        #pricing-section .col-7.text-center,
        #pricing-section .subtitle-1,
        #pricing-section .section-title-1 {
          text-align: center !important;
          display: block;
        }

        .feature-v1 {
          padding: 1.5rem;
          border-radius: 16px;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
          background: #ffffff;
          border: 1px solid #f1f5f9;
        }

        .dark-mode .feature-v1 {
          background: #1e293b;
          border: 1px solid #334155;
          color: #e2e8f0;
        }

        .feature-v1:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(66, 196, 136, 0.15);
          border-color: #42c488;
          background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
        }

        .dark-mode .feature-v1:hover {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-color: #42c488;
          box-shadow: 0 12px 32px rgba(66, 196, 136, 0.3);
        }

        .feature-v1 .wrap-icon {
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1.5rem;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(66, 196, 136, 0.3);
          transition: all 0.3s ease;
          font-family: "icomoon" !important;
        }

        .feature-v1 h3,
        .feature-v1 p {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        }

        .feature-v1:hover .wrap-icon {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 8px 20px rgba(66, 196, 136, 0.4);
        }

        .img-shadow {
          border-radius: 20px;
          transition: all 0.4s ease;
          overflow: hidden;
        }

        .img-shadow:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .img-shadow img {
          transition: transform 0.4s ease;
        }

        .img-shadow:hover img {
          transform: scale(1.05);
        }

        /* CTA Section Modern Styling */
        section.py-8 {
          position: relative;
          padding: 6rem 0;
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          overflow: hidden;
        }

        .dark-mode section.py-8 {
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
        }

        section.py-8::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 100px,
            rgba(255, 255, 255, 0.03) 100px,
            rgba(255, 255, 255, 0.03) 200px
          );
          animation: slide 30s linear infinite;
        }

        @keyframes slide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(100px, 100px); }
        }

        section.py-8 .container {
          position: relative;
          z-index: 2;
        }

        section.py-8 h2 {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-weight: 700;
          color: #ffffff;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        section.py-8 p {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 18px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
        }

        section.py-8 span {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        section.py-8 .btn-primary {
          background: #ffffff;
          color: #42c488;
          border: none;
          padding: 14px 32px;
          font-weight: 600;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        section.py-8 .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
        }

        /* More Features Section */
        .feature-v2 {
          padding: 2rem;
          text-align: center;
          border-radius: 20px;
          transition: all 0.3s ease;
          background: #ffffff;
          border: 2px solid #f1f5f9;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .dark-mode .feature-v2 {
          background: #1e293b;
          border: 2px solid #334155;
          color: #e2e8f0;
        }

        .feature-v2:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 40px rgba(66, 196, 136, 0.2);
          border-color: #42c488;
          background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
        }

        .dark-mode .feature-v2:hover {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-color: #42c488;
          box-shadow: 0 16px 40px rgba(66, 196, 136, 0.3);
        }

        .feature-v2 span {
          font-size: 48px;
          color: #42c488;
          margin-bottom: 1rem;
          display: block;
          transition: all 0.3s ease;
          font-family: "icomoon" !important;
        }

        .feature-v2 h3 {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        }

        .feature-v2:hover span {
          transform: scale(1.2) rotate(5deg);
        }

        .feature-v2 h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .dark-mode .feature-v2 h3 {
          color: #e2e8f0;
        }

        /* Pricing Cards Modern Styling */
        .pricing .border {
          border-radius: 24px;
          transition: all 0.3s ease;
          border: 2px solid #e2e8f0 !important;
          overflow: hidden;
          position: relative;
          background: #ffffff;
        }

        .dark-mode .pricing .border {
          background: #1e293b;
          border: 2px solid #334155 !important;
          color: #e2e8f0;
        }

        .pricing h3 {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        .dark-mode .pricing h3 {
          color: #e2e8f0;
        }

        .pricing .price {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .pricing .price .number {
          font-size: 48px;
          font-weight: 800;
          color: #1e293b;
        }

        .dark-mode .pricing .price .number {
          color: #e2e8f0;
        }

        .pricing .price .currency {
          font-size: 24px;
          font-weight: 600;
          color: #64748b;
        }

        .dark-mode .pricing .price .currency {
          color: #cbd5e1;
        }

        .pricing .price .per {
          font-size: 18px;
          font-weight: 400;
          color: #94a3b8;
        }

        .dark-mode .pricing .price .per {
          color: #94a3b8;
        }

        .dark-mode .pricing p.text-muted {
          color: #cbd5e1 !important;
        }

        .dark-mode .pricing ul li {
          color: #cbd5e1 !important;
        }

        .pricing p {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 14px;
          font-weight: 400;
        }

        .pricing ul li {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.8;
        }

        .pricing .border::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #42c488, #38a169);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .pricing .border:hover::before {
          opacity: 1;
        }

        .pricing .border:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 60px rgba(66, 196, 136, 0.2);
          border-color: #42c488 !important;
        }

        .pricing .btn-primary {
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          border: none;
          box-shadow: 0 4px 12px rgba(66, 196, 136, 0.3);
        }

        .pricing .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(66, 196, 136, 0.4);
        }

        /* Testimonials Modern Styling */
        .testimonial-wrap {
          position: relative;
          padding: 6rem 0;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .dark-mode .testimonial-wrap {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        }

        .testimonial {
          padding: 3rem;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          margin: 1rem;
          transition: all 0.3s ease;
        }

        .dark-mode .testimonial {
          background: #1e293b;
          border: 1px solid #334155;
          color: #e2e8f0;
        }

        .testimonial p {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.6;
          color: #475569;
        }

        .dark-mode .testimonial p {
          color: #cbd5e1;
        }

        .testimonial blockquote p {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 18px;
          font-weight: 400;
          font-style: italic;
          line-height: 1.8;
          color: #1e293b;
        }

        .dark-mode .testimonial blockquote p {
          color: #e2e8f0;
        }

        .testimonial:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
        }

        .testimonial img {
          border-radius: 50%;
          border: 4px solid #42c488;
          transition: all 0.3s ease;
        }

        .testimonial:hover img {
          transform: scale(1.1);
          border-color: #38a169;
        }

        /* How It Works Cards */
        .how-it-works-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 16px 40px rgba(66, 196, 136, 0.2);
        }

        /* Statistics Section */
        .site-section h3 {
          transition: all 0.3s ease;
        }

        .site-section h3:hover {
          transform: scale(1.1);
        }

        /* Blog Cards Modern Styling */
        .h-entry {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid #f1f5f9;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .dark-mode .h-entry {
          background: #1e293b;
          border: 1px solid #334155;
          color: #e2e8f0;
        }

        #blog-section h2,
        #blog-section .sub-title {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        #blog-section p {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .h-entry:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
          border-color: #42c488;
        }

        .h-entry img {
          transition: transform 0.4s ease;
        }

        .h-entry:hover img {
          transform: scale(1.1);
        }

        .h-entry h2 {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
        }

        .dark-mode .h-entry h2 {
          color: #e2e8f0;
        }

        .h-entry a {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #1e293b;
          transition: color 0.3s ease;
        }

        .dark-mode .h-entry a {
          color: #e2e8f0;
        }

        .h-entry a:hover {
          color: #42c488;
        }

        .h-entry p {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: #64748b;
          line-height: 1.6;
        }

        .h-entry .meta {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: #94a3b8;
        }

        /* Contact Form Modern Styling */
        .bg-white {
          border-radius: 24px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border: 1px solid #f1f5f9;
        }

        .dark-mode .bg-white {
          background: #1e293b !important;
          border: 1px solid #334155;
          color: #e2e8f0;
        }

        .form-control {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 15px;
          font-weight: 400;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          padding: 12px 16px;
          transition: all 0.3s ease;
        }

        .dark-mode .form-control {
          background: #0f172a;
          border: 1.5px solid #334155;
          color: #e2e8f0;
        }

        .form-control:focus {
          border-color: #42c488;
          box-shadow: 0 0 0 4px rgba(66, 196, 136, 0.1);
          outline: none;
        }

        .dark-mode .form-control:focus {
          border-color: #42c488;
          box-shadow: 0 0 0 4px rgba(66, 196, 136, 0.2);
        }

        .form-label {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }

        .bg-white h2 {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        .dark-mode .bg-white h2 {
          color: #e2e8f0;
        }

        /* FAQ Modern Styling */
        .accordion-item {
          border-radius: 12px;
          margin-bottom: 1rem;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .dark-mode .accordion-item {
          border: 1px solid #334155;
          background: #1e293b;
        }

        .accordion-item:hover {
          border-color: #42c488;
        }

        .accordion-button {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          background: #ffffff;
          border: none;
        }

        .dark-mode .accordion-button {
          background: #1e293b !important;
          color: #e2e8f0 !important;
          border-color: #334155 !important;
        }

        .dark-mode .accordion-button.collapsed {
          background: #1e293b !important;
          color: #e2e8f0 !important;
        }

        .dark-mode .accordion-button:not(.collapsed) {
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%) !important;
          color: #ffffff !important;
        }

        .accordion-body {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.6;
          color: #475569;
        }

        .dark-mode .accordion-body {
          background: #1e293b !important;
          color: #cbd5e1 !important;
        }

        .dark-mode .accordion-item {
          background: #1e293b !important;
          border-color: #334155 !important;
        }

        .dark-mode .text-muted {
          color: #cbd5e1 !important;
        }

        .dark-mode h2.fw-bold,
        .dark-mode h3.fw-bold {
          color: #e2e8f0 !important;
        }

        .accordion-button:not(.collapsed) {
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          color: #ffffff;
        }

        .dark-mode .accordion-button:not(.collapsed) {
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%) !important;
          color: #ffffff !important;
        }

        .accordion-button:focus {
          box-shadow: 0 0 0 4px rgba(66, 196, 136, 0.1);
        }

        /* Trusted By Section */
        .opacity-75 img {
          transition: all 0.3s ease;
          filter: grayscale(100%);
          opacity: 0.6;
        }

        .opacity-75 img:hover {
          filter: grayscale(0%);
          opacity: 1;
          transform: scale(1.1);
        }

        .text-uppercase.text-muted {
          font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
        }

        /* Comprehensive Scroll Animations */
        [data-aos] {
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        /* Scroll-triggered animations */
        .site-section,
        .feature-v1,
        .feature-v2,
        .pricing .border,
        .testimonial,
        .h-entry {
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .site-section.animate-in,
        .feature-v1.animate-in,
        .feature-v2.animate-in,
        .pricing .border.animate-in,
        .testimonial.animate-in,
        .h-entry.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* Stagger animations for child elements */
        .animate-child {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-child.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* Slide in from left */
        .slide-in-left {
          opacity: 0;
          transform: translateX(-100px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .slide-in-left.animate-in {
          opacity: 1;
          transform: translateX(0);
        }

        /* Slide in from right */
        .slide-in-right {
          opacity: 1;
          transform: translateX(0);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .slide-in-right.animate-in {
          opacity: 1;
          transform: translateX(0);
        }

        /* Ensure images are visible by default */
        img.slide-in-right {
          opacity: 1 !important;
          display: block !important;
        }

        /* Scale animation */
        .scale-in {
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .scale-in.animate-in {
          opacity: 1;
          transform: scale(1);
        }

        /* Rotate animation */
        .rotate-in {
          opacity: 0;
          transform: rotate(-10deg) scale(0.9);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .rotate-in.animate-in {
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }

        /* Fade in with blur */
        .fade-blur {
          opacity: 0;
          filter: blur(10px);
          transform: translateY(20px);
          transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .fade-blur.animate-in {
          opacity: 1;
          filter: blur(0);
          transform: translateY(0);
        }

        /* Bounce animation */
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-50px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) translateY(0);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        .bounce-in {
          opacity: 0;
        }

        .bounce-in.animate-in {
          animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        /* Flip animation */
        @keyframes flipIn {
          0% {
            opacity: 0;
            transform: perspective(400px) rotateY(-90deg);
          }
          100% {
            opacity: 1;
            transform: perspective(400px) rotateY(0deg);
          }
        }

        .flip-in {
          opacity: 0;
        }

        .flip-in.animate-in {
          animation: flipIn 0.8s ease-out forwards;
        }

        /* Shimmer effect */
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(66, 196, 136, 0.2),
            transparent
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }

        /* Glow pulse animation */
        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(66, 196, 136, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(66, 196, 136, 0.6);
          }
        }

        .glow-pulse {
          animation: glowPulse 2s ease-in-out infinite;
        }

        /* Gradient animation */
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .gradient-animate {
          background-size: 200% 200%;
          animation: gradientShift 5s ease infinite;
        }

        /* Typing animation */
        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        .typing-effect {
          overflow: hidden;
          white-space: nowrap;
          animation: typing 2s steps(40, end);
        }

        /* Ripple effect */
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        .ripple-effect::before {
          content: '';
          position: absolute;
          border-radius: 50%;
          background: rgba(66, 196, 136, 0.3);
          width: 100px;
          height: 100px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 1s ease-out;
        }

        /* Parallax effect */
        .parallax {
          transition: transform 0.3s ease-out;
        }

        /* Hover scale with shadow */
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(66, 196, 136, 0.2);
        }

        /* Shake animation */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .shake:hover {
          animation: shake 0.5s;
        }

        /* Spin animation */
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .spin-on-hover:hover {
          animation: spin 1s linear;
        }

        /* Pulse scale */
        @keyframes pulseScale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .pulse-scale {
          animation: pulseScale 2s ease-in-out infinite;
        }

        /* Slide up with fade */
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .slide-up-fade {
          animation: slideUpFade 0.8s ease-out;
        }

        /* Zoom in */
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .zoom-in {
          animation: zoomIn 0.6s ease-out;
        }

        /* Wobble effect */
        @keyframes wobble {
          0%, 100% { transform: translateX(0%); }
          15% { transform: translateX(-10px) rotate(-5deg); }
          30% { transform: translateX(10px) rotate(5deg); }
          45% { transform: translateX(-5px) rotate(-3deg); }
          60% { transform: translateX(5px) rotate(3deg); }
          75% { transform: translateX(-2px) rotate(-1deg); }
        }

        .wobble:hover {
          animation: wobble 0.5s ease-in-out;
        }

        /* Elastic bounce */
        @keyframes elasticBounce {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        .elastic-bounce {
          animation: elasticBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        /* Fade in from bottom with stagger */
        .stagger-fade-up > * {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stagger-fade-up.animate-in > *:nth-child(1) {
          transition-delay: 0.1s;
        }
        .stagger-fade-up.animate-in > *:nth-child(2) {
          transition-delay: 0.2s;
        }
        .stagger-fade-up.animate-in > *:nth-child(3) {
          transition-delay: 0.3s;
        }
        .stagger-fade-up.animate-in > *:nth-child(4) {
          transition-delay: 0.4s;
        }
        .stagger-fade-up.animate-in > *:nth-child(5) {
          transition-delay: 0.5s;
        }
        .stagger-fade-up.animate-in > *:nth-child(6) {
          transition-delay: 0.6s;
        }

        .stagger-fade-up.animate-in > * {
          opacity: 1;
          transform: translateY(0);
        }

        /* Sticky Floating CTA Button */
        .floating-cta {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          color: #ffffff;
          padding: 16px 24px;
          border-radius: 50px;
          box-shadow: 0 8px 24px rgba(66, 196, 136, 0.4);
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }

        .floating-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(66, 196, 136, 0.5);
          color: #ffffff;
          text-decoration: none;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 8px 24px rgba(66, 196, 136, 0.4);
          }
          50% {
            box-shadow: 0 8px 24px rgba(66, 196, 136, 0.6), 0 0 0 10px rgba(66, 196, 136, 0.1);
          }
        }

        /* Newsletter Section */
        .newsletter-section {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          padding: 4rem 0;
          color: #ffffff;
        }

        .dark-mode .newsletter-section {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }

        .newsletter-section h2 {
          color: #ffffff;
          margin-bottom: 1rem;
        }

        .newsletter-section p {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2rem;
        }

        .newsletter-form {
          display: flex;
          gap: 1rem;
          max-width: 500px;
          margin: 0 auto;
        }

        .newsletter-input {
          flex: 1;
          padding: 14px 20px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .newsletter-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .newsletter-input:focus {
          outline: none;
          border-color: #42c488;
          background: rgba(255, 255, 255, 0.15);
        }

        .newsletter-btn {
          padding: 14px 32px;
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .newsletter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(66, 196, 136, 0.4);
        }

        /* Security Badges Section */
        .security-badges {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 3rem;
          flex-wrap: wrap;
          padding: 2rem 0;
        }

        .dark-mode .security-badge-text {
          color: #cbd5e1 !important;
        }

        /* Ensure all list items are visible in dark mode */
        .dark-mode ul li,
        .dark-mode .ul-check li {
          color: #cbd5e1 !important;
        }

        /* Ensure all paragraphs are visible in dark mode */
        .dark-mode p {
          color: #cbd5e1;
        }

        /* Override any Bootstrap text-muted in dark mode */
        .dark-mode .text-muted {
          color: #cbd5e1 !important;
        }

        /* Ensure Help Center button is visible in dark mode */
        .dark-mode .btn-outline-primary {
          border-color: #42c488 !important;
          color: #42c488 !important;
        }

        .dark-mode .btn-outline-primary:hover {
          background-color: #42c488 !important;
          color: #ffffff !important;
        }

        /* Force dark backgrounds on all sections with bg-light class */
        body.dark-mode .bg-light,
        .dark-mode .bg-light {
          background-color: #1e293b !important;
        }

        /* Ensure section backgrounds are dark */
        body.dark-mode section.bg-light,
        .dark-mode section.bg-light,
        body.dark-mode .site-section.bg-light,
        .dark-mode .site-section.bg-light {
          background-color: #1e293b !important;
          background: #1e293b !important;
        }

        .security-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .security-badge-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(66, 196, 136, 0.3);
        }

        .security-badge-text {
          font-size: 14px;
          color: #64748b;
          text-align: center;
          font-weight: 600;
        }

        /* Back to Top Button */
        .back-to-top {
          position: fixed;
          bottom: 100px;
          right: 30px;
          z-index: 999;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          color: #ffffff;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(66, 196, 136, 0.4);
          transition: all 0.3s ease;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
        }

        .back-to-top.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .back-to-top:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(66, 196, 136, 0.6);
        }

        .back-to-top svg {
          width: 24px;
          height: 24px;
        }

        /* Scroll Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }

        /* Number Counter Animation */
        @keyframes countUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .counter-animate {
          animation: countUp 0.8s ease-out;
        }

        /* Improved Blog Section */
        .blog-placeholder {
          text-align: center;
          padding: 3rem 1rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 2px dashed #e2e8f0;
        }

        .blog-placeholder h3 {
          color: #64748b;
          font-size: 20px;
          margin-bottom: 0.5rem;
        }

        .blog-placeholder p {
          color: #94a3b8;
          font-size: 14px;
        }

        /* Improved Contact Section */
        .contact-info-card {
          background: #ffffff;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          height: 100%;
        }

        .contact-info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .contact-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 28px;
          color: #ffffff;
        }

        /* Loading Skeleton */
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-heading {
            font-size: 36px;
          }
          
          .hero p {
            font-size: 16px;
          }

          .feature-v1 {
            padding: 1rem;
          }

          .feature-v2 {
            padding: 1.5rem;
          }

          .floating-cta {
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            font-size: 14px;
          }

          .back-to-top {
            bottom: 80px;
            right: 20px;
            width: 45px;
            height: 45px;
          }

          .newsletter-form {
            flex-direction: column;
          }

          .security-badges {
            gap: 2rem;
          }
        }
      `}</style>
      {/* {<!-- Mobile Menu -->} */}
      {/* <div class="site-mobile-menu site-navbar-target">
          <div class="site-mobile-menu-header">
            <div class="site-mobile-menu-close mt-3">
              <span class="icon-close2 js-menu-toggle"></span>
            </div>
          </div>
          <div class="site-mobile-menu-body"></div>
        </div> */}

      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />




      {/* Hero */}
      <div className="site-section hero fade-blur" id="home-section" style={{ 
        background: isDarkMode ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'
      }}>
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="mb-5">
                <h1 className="hero-heading" style={{ 
                  color: isDarkMode ? '#e2e8f0' : '#0f172a',
                  WebkitTextFillColor: isDarkMode ? '#e2e8f0' : 'transparent'
                }}>
                  <span style={{ color: isDarkMode ? '#e2e8f0' : 'inherit' }}>Boost Productivity with </span>
                  <strong className="hero-attend" style={{ color: isDarkMode ? '#ffffff' : '#000000', WebkitTextFillColor: isDarkMode ? '#ffffff' : '#000000' }}>Attend</strong>
                  <strong style={{ color: '#42c488', WebkitTextFillColor: '#42c488' }}>Ease</strong>
                </h1>
                <p style={{ 
                  fontSize: '20px', 
                  marginBottom: '2rem', 
                  color: isDarkMode ? '#cbd5e1' : '#64748b',
                  fontFamily: '"Open Sans", sans-serif'
                }}>Attendance made easy. Productivity made better.</p>
                
                {/* Trust Badges */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '2rem', 
                  marginBottom: '2rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#42c488', fontSize: '24px' }}>✓</span>
                    <span style={{ fontSize: '14px', color: isDarkMode ? '#cbd5e1' : '#64748b' }}>No Credit Card Required</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#42c488', fontSize: '24px' }}>✓</span>
                    <span style={{ fontSize: '14px', color: isDarkMode ? '#cbd5e1' : '#64748b' }}>Free 14-Day Trial</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#42c488', fontSize: '24px' }}>✓</span>
                    <span style={{ fontSize: '14px', color: isDarkMode ? '#cbd5e1' : '#64748b' }}>Setup in 2 Minutes</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href="/register" className="btn btn-primary elastic-bounce hover-lift" style={{ minWidth: '180px' }}>
                    Start Free Trial
                  </a>
                  <a href="#features-section" className="btn hover-lift" style={{ 
                    background: isDarkMode ? 'rgba(66, 196, 136, 0.1)' : 'transparent', 
                    border: '2px solid #42c488', 
                    color: '#42c488',
                    minWidth: '180px',
                    fontWeight: '600',
                    padding: '14px 32px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#42c488';
                    e.target.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = isDarkMode ? 'rgba(66, 196, 136, 0.1)' : 'transparent';
                    e.target.style.color = '#42c488';
                  }}
                  >
                    Learn More
                  </a>
                </div>
              </div>
              <img
                src="images/lap..png"
                alt="image"
                className="img-fluid parallax pulse-scale"
                style={{ transform: `translateY(${scrollY * 0.1}px)` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div id="stats-section" className="site-section stagger-fade-up" style={{ 
        padding: '4rem 0', 
        background: isDarkMode ? '#1e293b' : '#ffffff', 
        borderTop: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9', 
        borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9'
      }}>
        <div className="container">
          <div className="row">
            <StatisticCounter 
              end={10000} 
              suffix="+" 
              label="Active Users" 
              isDarkMode={isDarkMode}
              format="K"
            />
            <StatisticCounter 
              end={500} 
              suffix="+" 
              label="Companies" 
              isDarkMode={isDarkMode}
            />
            <StatisticCounter 
              end={99.9} 
              suffix="%" 
              label="Uptime" 
              isDarkMode={isDarkMode}
              decimals={1}
            />
            <div className="col-md-3 col-6 text-center mb-4 mb-md-0">
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '48px', fontWeight: '800', color: '#42c488', margin: 0, fontFamily: '"Open Sans", sans-serif' }}>24/7</h3>
                <p style={{ fontSize: '16px', color: isDarkMode ? '#cbd5e1' : '#64748b', margin: '0.5rem 0 0', fontFamily: '"Open Sans", sans-serif' }}>Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="site-section" style={{ 
        padding: '6rem 0', 
        background: isDarkMode ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' 
      }}>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="subtitle-1" style={{ textAlign: 'center', display: 'block', width: '100%' }}>How It Works</span>
              <h2 className="section-title-1 fw-bold" style={{ textAlign: 'center', display: 'block', width: '100%', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Get Started in 3 Simple Steps</h2>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 text-center mb-4 mb-md-0">
              <div style={{ 
                background: isDarkMode ? '#1e293b' : '#ffffff', 
                padding: '2.5rem 2rem', 
                borderRadius: '20px', 
                boxShadow: isDarkMode ? '0 8px 24px rgba(0, 0, 0, 0.3)' : '0 8px 24px rgba(0, 0, 0, 0.08)',
                height: '100%',
                transition: 'all 0.3s ease',
                border: isDarkMode ? '1px solid #334155' : 'none'
              }} className="how-it-works-card">
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  background: 'linear-gradient(135deg, #42c488 0%, #38a169 100%)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1.5rem',
                  fontSize: '36px',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 20px rgba(66, 196, 136, 0.3)'
                }}>1</div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: isDarkMode ? '#e2e8f0' : '#1e293b', marginBottom: '1rem', fontFamily: '"Open Sans", sans-serif' }}>Sign Up</h3>
                <p style={{ fontSize: '16px', color: isDarkMode ? '#cbd5e1' : '#64748b', lineHeight: '1.6', fontFamily: '"Open Sans", sans-serif' }}>Create your account in less than 2 minutes. No credit card required.</p>
              </div>
            </div>
            <div className="col-md-4 text-center mb-4 mb-md-0">
              <div style={{ 
                background: isDarkMode ? '#1e293b' : '#ffffff', 
                padding: '2.5rem 2rem', 
                borderRadius: '20px', 
                boxShadow: isDarkMode ? '0 8px 24px rgba(0, 0, 0, 0.3)' : '0 8px 24px rgba(0, 0, 0, 0.08)',
                height: '100%',
                transition: 'all 0.3s ease',
                border: isDarkMode ? '1px solid #334155' : 'none'
              }} className="how-it-works-card">
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  background: 'linear-gradient(135deg, #42c488 0%, #38a169 100%)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1.5rem',
                  fontSize: '36px',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 20px rgba(66, 196, 136, 0.3)'
                }}>2</div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: isDarkMode ? '#e2e8f0' : '#1e293b', marginBottom: '1rem', fontFamily: '"Open Sans", sans-serif' }}>Setup Team</h3>
                <p style={{ fontSize: '16px', color: isDarkMode ? '#cbd5e1' : '#64748b', lineHeight: '1.6', fontFamily: '"Open Sans", sans-serif' }}>Add your team members and configure attendance policies to fit your needs.</p>
              </div>
            </div>
            <div className="col-md-4 text-center mb-4 mb-md-0">
              <div style={{ 
                background: isDarkMode ? '#1e293b' : '#ffffff', 
                padding: '2.5rem 2rem', 
                borderRadius: '20px', 
                boxShadow: isDarkMode ? '0 8px 24px rgba(0, 0, 0, 0.3)' : '0 8px 24px rgba(0, 0, 0, 0.08)',
                height: '100%',
                transition: 'all 0.3s ease',
                border: isDarkMode ? '1px solid #334155' : 'none'
              }} className="how-it-works-card">
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  background: 'linear-gradient(135deg, #42c488 0%, #38a169 100%)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1.5rem',
                  fontSize: '36px',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 20px rgba(66, 196, 136, 0.3)'
                }}>3</div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: isDarkMode ? '#e2e8f0' : '#1e293b', marginBottom: '1rem', fontFamily: '"Open Sans", sans-serif' }}>Start Tracking</h3>
                <p style={{ fontSize: '16px', color: isDarkMode ? '#cbd5e1' : '#64748b', lineHeight: '1.6', fontFamily: '"Open Sans", sans-serif' }}>Begin tracking attendance and managing leaves with real-time insights and reports.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="site-section pt-0 stagger-fade-up" id="features-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="subtitle-1" style={{ textAlign: 'center', display: 'block' }}>Features</span>
              <h2 className="section-title-1 fw-bold" style={{ textAlign: 'center', display: 'block', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>The Features</h2>
            </div>
          </div>

          {/* Block 1 */}
          <div className="row align-items-center mb-5">
            <div
              className="col-lg-6 mb-5 order-lg-2 mb-lg-0"
              data-aos="fade-right"
            >
              <img
                src="/images/22.png"
                alt="Admin Dashboard Feature"
                className="img-fluid img-shadow slide-in-right hover-lift"
                style={{ opacity: 1, display: 'block' }}
                onError={(e) => {
                  e.target.src = 'images/22.png';
                  e.target.style.display = 'block';
                }}
              />
            </div>
            <div className="col-lg-5 me-auto">
              <div className="mb-4">
                <h2 className="section-title-2" style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Admin Dashboard</h2>
                <p style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>Manage, monitor, and make smarter decisions — all in one place with AttendEase.</p>
              </div>

              <div className="d-flex feature-v1 slide-in-left animate-child">
                <span className="wrap-icon icon-users"></span>
                <div>
                  <h3 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>User Management</h3>
                  <p style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>
                    Add, edit, and organize employee or student profiles effortlessly with real-time access control.
                  </p>
                </div>
              </div>

              <div className="d-flex feature-v1 slide-in-left animate-child">
                <span className="wrap-icon icon-layers"></span>
                <div>
                  <h3 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Insights & Analytics</h3>
                  <p style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>
                    View attendance trends, generate reports, and gain valuable insights for better productivity decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Block 2 */}
          <div className="row align-items-center mb-5">
            <div className="col-lg-6 mb-5 mb-lg-0" data-aos="fade-left">
              <img
                src="images/managerdas.png"
                alt="Feature"
                className="img-fluid img-shadow"
              />
            </div>
            <div className="col-lg-5 order-lg-1 ms-auto">
              <div className="mb-4">
                <h2 className="section-title-2" style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Manager Dashboard</h2>
                <p style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>Empower your team with real-time insights and effortless management tools — all in one place.</p>
              </div>

              <div className="d-flex feature-v1">
                <span className="wrap-icon icon-cog"></span>
                <div>
                  <h3 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Performance Overview</h3>
                  <p style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>
                    Track attendance, productivity, and performance metrics at a glance to make informed decisions.
                  </p>
                </div>
              </div>

              <div className="d-flex feature-v1">
                <span className="wrap-icon icon-bolt"></span>
                <div>
                  <h3 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Schedule & Leave Management</h3>
                  <p style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>
                    Approve leave requests, manage shift schedules, and keep your team organized with minimal effor
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Block 3 */}
          <div className="row align-items-center mb-5">
            <div
              className="col-lg-6 mb-5 order-lg-2 mb-lg-0"
              data-aos="fade-right"
            >
              <img
                src="images/employeedas.png"
                alt="Feature"
                className="img-fluid img-shadow"
              />
            </div>
            <div className="col-lg-5 me-auto">
              <div className="mb-4">
                <h2 className="section-title-2" style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Employee Dashboard</h2>
                <p style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>Stay organized, track attendance, and manage your day with ease — all from one simple dashboard.</p>
              </div>

              <div className="d-flex feature-v1">
                <span className="wrap-icon icon-users"></span>
                <div>
                  <h3 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Attendance Tracking</h3>
                  <p style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>
                    Mark your attendance, view history, and ensure your records are always up to date.
                  </p>
                </div>
              </div>

              <div className="d-flex feature-v1">
                <span className="wrap-icon icon-layers"></span>
                <div>
                  <h3 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Leave Requests</h3>
                  <p style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>
                    Apply for leave, check approvals, and plan your schedule without any hassle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="py-8">
        <div className="container">
          <div className="row">
            <div className="offset-lg-2 col-lg-8 col-md-12 col-12 text-center">
              <span className="fs-4 ls-md text-uppercase fw-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                get things done
              </span>

              {/* heading */}
              <h2 className="display-3 mt-4 mb-3 fw-bold" style={{ color: '#ffffff' }}>
                Just try it out! You'll fall in love
              </h2>

              {/* para */}
              <p className="lead px-lg-8 mb-6" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                Designed for modern companies looking to launch a simple, premium
                and modern website and apps.
              </p>

              <a href="/register" className="btn btn-primary">
                Try For Free
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* More Features */}
      <div className="site-section" style={{ background: isDarkMode ? '#1e293b' : '#ffffff' }}>
        <div className="site-section">
          <div className="container">
            <div className="row">
              <div className="col-md-7 text-center mb-5 mx-auto" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="subtitle-1" style={{ textAlign: 'center', display: 'block', width: '100%' }}>More Features</span>
                <h2 className="section-title-1 fw-bold" style={{ textAlign: 'center', display: 'block', width: '100%', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Why Choose AttendEase</h2>
              </div>
            </div>

            <div className="row">
              {[
                { icon: "icon-people_outline", title: "Real-Time Attendance" },
                { icon: "icon-phone_android", title: "Leave Management" },
                { icon: "icon-pie_chart", title: "Detailed Reports" },
                { icon: "icon-public", title: "Multi-User Access" },
                { icon: "icon-search2", title: "Effortless Search" },
                { icon: "icon-security", title: "Secure & Reliable" },
                { icon: "icon-visibility", title: "Smart Analytics" },
                { icon: "icon-settings", title: "Dashboard" },
              ].map((f, i) => (
                <div
                  key={i}
                  className="col-6 col-sm-6 col-md-4 col-lg-3 mb-4"
                  data-aos="fade-up"
                  data-aos-delay={i * 100}
                >
                  <div className="feature-v2 scale-in hover-lift">
                    <span className={f.icon}></span>
                    <h3>{f.title}</h3>
                    {/* <p>Lorem ipsum dolor sit amet.</p> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


        <div className="container text-center">
          <p className="text-uppercase text-muted mb-4 small fw-semibold">
            TRUSTED BY MILLIONS OF DEVELOPERS &amp; THOUSANDS OF ENTERPRISE TEAMS
          </p>

          <div className="row justify-content-center align-items-center g-4 opacity-75">
            <div className="col-4 col-sm-2 col-md-2">
              <img
                src="images/gray-logo-airbnb.png"
                alt="Airbnb"
                className="img-fluid"
              />
            </div>
            <div className="col-4 col-sm-2 col-md-2">
              <img
                src="images/gray-logo-discord.png"
                alt="Discord"
                className="img-fluid"
              />
            </div>
            <div className="col-4 col-sm-2 col-md-2">
              <img
                src="images/gray-logo-intercom.png"
                alt="Intercom"
                className="img-fluid"
              />
            </div>
            <div className="col-4 col-sm-2 col-md-2">
              <img
                src="images/gray-logo-stripe.png"
                alt="Stripe"
                className="img-fluid"
              />
            </div>
            <div className="col-4 col-sm-2 col-md-2">
              <img
                src="images/gray-logo-netflix.png"
                alt="Netflix"
                className="img-fluid"
              />
            </div>
          </div>
        </div>
      </div>



      {/* Testimonials */}
      <div
        className="site-section bg-light testimonial-wrap stagger-fade-up"
        id="testimonials-section"
        style={{ background: isDarkMode ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
      >
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="subtitle-1" style={{ textAlign: 'center', display: 'block', width: '100%' }}>Testimonials</span>
              <h2 className="section-title-1 fw-bold" style={{ textAlign: 'center', display: 'block', width: '100%', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>What People Says</h2>
            </div>
          </div>
        </div>

        <div className="slide-one-item home-slider owl-carousel">
          {[
            {
              text: "“AttendEase has transformed how we manage attendance. The dashboard is intuitive and the reporting features are exactly what we needed.”",
              img: "images/person_3.jpg",
              name: "Sarah Johnson",
              role: "HR Manager",
              rating: 5,
            },
            {
              text: "“Since implementing AttendEase, our attendance tracking has become effortless. The real-time insights help us make better decisions.”",
              img: "images/person_2.jpg",
              name: "Michael Chen",
              role: "Operations Director",
              rating: 5,
            },
            {
              text: "“The leave management system is fantastic. Employees love the simplicity, and managers appreciate the streamlined approval process.”",
              img: "images/person_4.jpg",
              name: "Emily Rodriguez",
              role: "Team Lead",
              rating: 5,
            },
            {
              text: "“AttendEase saved us hours every week. The automated reports and analytics have made our workforce management so much easier.”",
              img: "images/person_4.jpg",
              name: "David Thompson",
              role: "CEO",
              rating: 5,
            },
          ].map((t, i) => (
            <div className="testimonial text-center bounce-in hover-lift" key={i}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '4px' }}>
                {[...Array(t.rating || 5)].map((_, idx) => (
                  <span key={idx} style={{ color: '#fbbf24', fontSize: '20px' }}>★</span>
                ))}
              </div>
              <blockquote className="mb-5">
                <p style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>{t.text}</p>
              </blockquote>
              <figure className="mb-4 d-flex align-items-center justify-content-center flex-column">
                <img src={t.img} alt={t.name} className="w-50 img-fluid mb-3" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                <p style={{ fontWeight: '600', color: isDarkMode ? '#e2e8f0' : '#1e293b', marginBottom: '0.25rem', fontFamily: '"Open Sans", sans-serif' }}>{t.name}</p>
                <p style={{ fontSize: '14px', color: isDarkMode ? '#cbd5e1' : '#64748b', fontFamily: '"Open Sans", sans-serif' }}>{t.role}</p>
              </figure>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="site-section stagger-fade-up" id="pricing-section" style={{ background: isDarkMode ? '#1e293b' : '#ffffff' }}>
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-7 text-center mb-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="subtitle-1" style={{ textAlign: 'center', display: 'block', width: '100%' }}>Pricing</span>
              <h2 className="section-title-1 fw-bold" style={{ textAlign: 'center', display: 'block', width: '100%', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Pricing for All</h2>
            </div>
          </div>
          <div className="row">
            {[
              {
                name: "Starter",
                price: 30,
                per: "/year",
                note: "* Billed annually or $10 per month",
                features: [
                  "Max 5 users",
                  "29 local security",
                  <del key="d1">Desktop App</del>,
                  <del key="d2">Email Support</del>,
                  <del key="d3">Phone Support 24/7</del>,
                ],
                btn: "btn-secondary",
              },
              {
                name: "Professional",
                price: 72,
                per: "/year",
                note: "* Billed annually or $30 per month",
                features: [
                  "Max 10 users",
                  "29 local security",
                  "Desktop App",
                  "Email Support",
                  <del key="d4">Phone Support 24/7</del>,
                ],
                btn: "btn-primary",
              },
              {
                name: "Enterprise",
                price: 130,
                per: "/year",
                note: "* Billed annually or $10 per month",
                features: [
                  "Unlimited users",
                  "29 local security",
                  "Desktop App",
                  "Email Support",
                  "Phone Support 24/7",
                ],
                btn: "btn-secondary",
              },
            ].map((p, i) => (
              <div className="col-lg-4 col-md-6 mb-4 pricing" key={i}>
                <div className="border p-5 text-center rounded flip-in hover-lift">
                  <h3 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>{p.name}</h3>
                  <div className="price mb-3">
                    <sup className="currency" style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>$</sup>
                    <span className="number" style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>{p.price}</span>{" "}
                    <span className="per" style={{ color: isDarkMode ? '#94a3b8' : '#94a3b8' }}>{p.per}</span>
                  </div>
                  <p className="text-muted mb-4" style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>{p.note}</p>
                  <ul className="list-unstyled ul-check text-start success mb-5" style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                    {p.features.map((f, j) => (
                      <li key={j} style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}>{f}</li>
                    ))}
                  </ul>
                  <p>
                    <a
                      href="#"
                      className={`btn btn-lg ${p.btn} rounded-0 w-100`}
                    >
                      Buy Now
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blog - Improved */}
      <div className="site-section bg-light stagger-fade-up" id="blog-section" style={{ 
        background: isDarkMode ? '#1e293b' : '#f8fafc',
        backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-7 text-center mb-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="subtitle-1" style={{ 
                textAlign: 'center', 
                display: 'block', 
                width: '100%',
                color: '#42c488'
              }}>Blog</span>
              <h2 className="section-title-1 fw-bold" style={{ 
                textAlign: 'center', 
                display: 'block', 
                width: '100%', 
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                fontFamily: '"Open Sans", sans-serif'
              }}>Latest News &amp; Updates</h2>
              <p className="mb-5" style={{ 
                color: isDarkMode ? '#cbd5e1' : '#64748b', 
                fontFamily: '"Open Sans", sans-serif',
                fontSize: '16px'
              }}>Stay updated with the latest features, tips, and industry insights</p>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="blog-placeholder" style={{ 
                background: isDarkMode ? '#0f172a' : '#ffffff', 
                border: isDarkMode ? '2px dashed #334155' : '2px dashed #e2e8f0',
                borderRadius: '16px',
                padding: '3rem 2rem',
                margin: '2rem 0',
                textAlign: 'center'
              }}>
                <h3 style={{ 
                  fontFamily: '"Open Sans", sans-serif', 
                  color: isDarkMode ? '#e2e8f0' : '#1e293b',
                  fontSize: '24px',
                  fontWeight: '600',
                  marginBottom: '1rem'
                }}>Coming Soon</h3>
                <p style={{ 
                  fontFamily: '"Open Sans", sans-serif', 
                  color: isDarkMode ? '#cbd5e1' : '#64748b',
                  fontSize: '16px',
                  lineHeight: '1.6'
                }}>We're preparing exciting content for you. Check back soon for updates, tips, and best practices!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact - Improved */}
      <div className="site-section pb-0 bg-light" id="contact-section" style={{ 
        background: isDarkMode ? '#1e293b' : '#f8fafc',
        backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-7 text-center mb-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="subtitle-1" style={{ 
                textAlign: 'center', 
                display: 'block', 
                width: '100%',
                color: '#42c488'
              }}>Contact</span>
              <h2 className="section-title-1 fw-bold" style={{ 
                textAlign: 'center', 
                display: 'block', 
                width: '100%', 
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                fontFamily: '"Open Sans", sans-serif'
              }}>Get In Touch</h2>
              <p className="mb-5" style={{ 
                color: isDarkMode ? '#cbd5e1' : '#64748b', 
                fontFamily: '"Open Sans", sans-serif',
                fontSize: '16px'
              }}>
                Have questions? We're here to help! Reach out to our team anytime.
              </p>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-md-4 text-center mb-4 mb-md-0">
              <div className="contact-info-card" style={{ 
                background: isDarkMode ? '#0f172a' : '#ffffff',
                border: isDarkMode ? '1px solid #334155' : 'none'
              }}>
                <div className="contact-icon">📍</div>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: isDarkMode ? '#e2e8f0' : '#1e293b', marginBottom: '0.5rem', fontFamily: '"Open Sans", sans-serif' }}>Office Address</h4>
                <p style={{ color: isDarkMode ? '#cbd5e1' : '#64748b', fontSize: '15px', fontFamily: '"Open Sans", sans-serif', lineHeight: '1.6' }}>
                  123 Business Street<br />
                  Suite 100<br />
                  San Francisco, CA 94105
              </p>
            </div>
            </div>
            <div className="col-md-4 text-center mb-4 mb-md-0">
              <div className="contact-info-card" style={{ 
                background: isDarkMode ? '#0f172a' : '#ffffff',
                border: isDarkMode ? '1px solid #334155' : 'none'
              }}>
                <div className="contact-icon">📞</div>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: isDarkMode ? '#e2e8f0' : '#1e293b', marginBottom: '0.5rem', fontFamily: '"Open Sans", sans-serif' }}>Phone</h4>
                <p style={{ color: isDarkMode ? '#cbd5e1' : '#64748b', fontSize: '15px', fontFamily: '"Open Sans", sans-serif' }}>
                  <a href="tel:+1234567890" style={{ color: '#42c488', textDecoration: 'none' }}>+1 (234) 567-890</a>
                </p>
                <p style={{ color: isDarkMode ? '#94a3b8' : '#94a3b8', fontSize: '13px', marginTop: '0.5rem', fontFamily: '"Open Sans", sans-serif' }}>Mon-Fri 9am-6pm EST</p>
            </div>
            </div>
            <div className="col-md-4 text-center mb-4 mb-md-0">
              <div className="contact-info-card" style={{ 
                background: isDarkMode ? '#0f172a' : '#ffffff',
                border: isDarkMode ? '1px solid #334155' : 'none'
              }}>
                <div className="contact-icon">✉️</div>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: isDarkMode ? '#e2e8f0' : '#1e293b', marginBottom: '0.5rem', fontFamily: '"Open Sans", sans-serif' }}>Email</h4>
                <p style={{ color: isDarkMode ? '#cbd5e1' : '#64748b', fontSize: '15px', fontFamily: '"Open Sans", sans-serif' }}>
                  <a href="mailto:support@attendease.com" style={{ color: '#42c488', textDecoration: 'none' }}>support@attendease.com</a>
                </p>
                <p style={{ color: isDarkMode ? '#94a3b8' : '#94a3b8', fontSize: '13px', marginTop: '0.5rem', fontFamily: '"Open Sans", sans-serif' }}>We reply within 24 hours</p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-5">
              <form 
                className="p-5 bg-white" 
                style={{ 
                  background: isDarkMode ? '#0f172a' : '#ffffff',
                  border: isDarkMode ? '1px solid #334155' : 'none'
                }}
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you for your message! We will get back to you soon.');
                }}
              >
                <h2 className="h4 text-black mb-5" style={{ 
                  fontFamily: '"Open Sans", sans-serif', 
                  fontSize: '24px', 
                  fontWeight: '700',
                  color: isDarkMode ? '#e2e8f0' : '#1e293b'
                }}>Send us a Message</h2>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="fname" className="form-label" style={{ 
                      fontFamily: '"Open Sans", sans-serif',
                      color: isDarkMode ? '#e2e8f0' : '#334155'
                    }}>
                      First Name
                    </label>
                    <input 
                      type="text" 
                      id="fname" 
                      className="form-control" 
                      required 
                      style={{ 
                        fontFamily: '"Open Sans", sans-serif',
                        background: isDarkMode ? '#1e293b' : '#ffffff',
                        border: isDarkMode ? '1.5px solid #334155' : '1.5px solid #e2e8f0',
                        color: isDarkMode ? '#e2e8f0' : '#1e293b'
                      }} 
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="lname" className="form-label" style={{ 
                      fontFamily: '"Open Sans", sans-serif',
                      color: isDarkMode ? '#e2e8f0' : '#334155'
                    }}>
                      Last Name
                    </label>
                    <input 
                      type="text" 
                      id="lname" 
                      className="form-control" 
                      required 
                      style={{ 
                        fontFamily: '"Open Sans", sans-serif',
                        background: isDarkMode ? '#1e293b' : '#ffffff',
                        border: isDarkMode ? '1.5px solid #334155' : '1.5px solid #e2e8f0',
                        color: isDarkMode ? '#e2e8f0' : '#1e293b'
                      }} 
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="email" className="form-label" style={{ 
                      fontFamily: '"Open Sans", sans-serif',
                      color: isDarkMode ? '#e2e8f0' : '#334155'
                    }}>
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      id="email" 
                      className="form-control" 
                      required 
                      style={{ 
                        fontFamily: '"Open Sans", sans-serif',
                        background: isDarkMode ? '#1e293b' : '#ffffff',
                        border: isDarkMode ? '1.5px solid #334155' : '1.5px solid #e2e8f0',
                        color: isDarkMode ? '#e2e8f0' : '#1e293b'
                      }} 
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="subject" className="form-label" style={{ 
                      fontFamily: '"Open Sans", sans-serif',
                      color: isDarkMode ? '#e2e8f0' : '#334155'
                    }}>
                      Subject
                    </label>
                    <input 
                      type="text" 
                      id="subject" 
                      className="form-control" 
                      required 
                      style={{ 
                        fontFamily: '"Open Sans", sans-serif',
                        background: isDarkMode ? '#1e293b' : '#ffffff',
                        border: isDarkMode ? '1.5px solid #334155' : '1.5px solid #e2e8f0',
                        color: isDarkMode ? '#e2e8f0' : '#1e293b'
                      }} 
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="message" className="form-label" style={{ 
                      fontFamily: '"Open Sans", sans-serif',
                      color: isDarkMode ? '#e2e8f0' : '#334155'
                    }}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows="6"
                      className="form-control"
                      placeholder="Write your notes or questions here..."
                      required
                      style={{ 
                        fontFamily: '"Open Sans", sans-serif',
                        background: isDarkMode ? '#1e293b' : '#ffffff',
                        border: isDarkMode ? '1.5px solid #334155' : '1.5px solid #e2e8f0',
                        color: isDarkMode ? '#e2e8f0' : '#1e293b'
                      }}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary w-100" style={{ fontFamily: '"Open Sans", sans-serif', padding: '14px', fontSize: '16px', fontWeight: '600' }}>
                      Send Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>


      <section className="py-5 bg-light" id="attendease-faq" style={{ 
        background: isDarkMode ? '#1e293b' : '#f8fafc',
        backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc'
      }}>
        <div className="container">
          {/* Section Heading */}
          <div className="text-center mb-5">
            <span className="subtitle-1 text-primary fw-semibold" style={{ color: '#42c488' }}>FAQ</span>
            <h2 className="fw-bold mt-2" style={{ 
              color: isDarkMode ? '#e2e8f0' : '#1e293b',
              fontFamily: '"Open Sans", sans-serif',
              fontSize: '32px'
            }}>Frequently Asked Questions</h2>
            <p className="text-muted mt-2" style={{ 
              color: isDarkMode ? '#cbd5e1' : '#64748b',
              fontFamily: '"Open Sans", sans-serif',
              fontSize: '16px'
            }}>
              Got Questions? We've Got Answers.
            </p>
          </div>

          {/* Accordion Section */}
          <div className="accordion" id="attendanceAccordion">
            {/* Employee Attendance */}
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingOne">
                <button
                  className="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseOne"
                  aria-expanded="true"
                  aria-controls="collapseOne"
                >
                  How does Employee Attendance work?
                </button>
              </h2>
              <div
                id="collapseOne"
                className="accordion-collapse collapse show"
                aria-labelledby="headingOne"
                data-bs-parent="#attendanceAccordion"
              >
                <div className="accordion-body">
                  Employees can check in and out with one click, view daily logs, and
                  track working hours in real time. This ensures accurate and
                  transparent attendance management.
                </div>
              </div>
            </div>

            {/* Manager Dashboard */}
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingTwo">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseTwo"
                  aria-expanded="false"
                  aria-controls="collapseTwo"
                >
                  What can managers do in the dashboard?
                </button>
              </h2>
              <div
                id="collapseTwo"
                className="accordion-collapse collapse"
                aria-labelledby="headingTwo"
                data-bs-parent="#attendanceAccordion"
              >
                <div className="accordion-body">
                  Managers can view attendance analytics, approve leaves, and monitor
                  team productivity in one unified dashboard.
                </div>
              </div>
            </div>

            {/* Attendance Reports */}
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingThree">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseThree"
                  aria-expanded="false"
                  aria-controls="collapseThree"
                >
                  Can I download attendance reports?
                </button>
              </h2>
              <div
                id="collapseThree"
                className="accordion-collapse collapse"
                aria-labelledby="headingThree"
                data-bs-parent="#attendanceAccordion"
              >
                <div className="accordion-body">
                  Yes, you can export attendance reports by week, month, or custom
                  range. Reports include detailed logs, late entries, and leave
                  summaries.
                </div>
              </div>
            </div>

            {/* Employee Leave Tracking */}
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingFour">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseFour"
                  aria-expanded="false"
                  aria-controls="collapseFour"
                >
                  How can employees apply for leave?
                </button>
              </h2>
              <div
                id="collapseFour"
                className="accordion-collapse collapse"
                aria-labelledby="headingFour"
                data-bs-parent="#attendanceAccordion"
              >
                <div className="accordion-body">
                  Employees can submit leave requests directly through AttendEase. Managers
                  receive notifications and can approve or reject requests instantly.
                </div>
              </div>
            </div>

            {/* Late/Absent Alerts */}
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingSeven">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseSeven"
                  aria-expanded="false"
                  aria-controls="collapseSeven"
                >
                  How are late or absent employees tracked?
                </button>
              </h2>
              <div
                id="collapseSeven"
                className="accordion-collapse collapse"
                aria-labelledby="headingSeven"
                data-bs-parent="#attendanceAccordion"
              >
                <div className="accordion-body">
                  AttendEase automatically flags late check-ins or absences, and managers
                  can view detailed reports for corrective actions or follow-ups.
                </div>
              </div>
            </div>
          </div>

          {/* Help Link */}
          <div className="mt-5 text-center">
            <a 
              href="#" 
              className="btn btn-outline-primary"
              style={{ 
                borderColor: '#42c488',
                color: '#42c488',
                background: isDarkMode ? 'rgba(66, 196, 136, 0.1)' : 'transparent',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderRadius: '8px',
                padding: '10px 20px',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#42c488';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = isDarkMode ? 'rgba(66, 196, 136, 0.1)' : 'transparent';
                e.target.style.color = '#42c488';
              }}
            >
              More questions? Visit the <span style={{ color: '#42c488', fontWeight: '600' }}>Help Center</span>.
            </a>
          </div>
        </div>
      </section>

      {/* Security Badges Section */}
      <div className="site-section" style={{ 
        padding: '4rem 0', 
        background: isDarkMode ? '#1e293b' : '#ffffff', 
        borderTop: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9' 
      }}>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-4">
              <h3 style={{ fontSize: '28px', fontWeight: '700', color: isDarkMode ? '#e2e8f0' : '#1e293b', marginBottom: '1rem', fontFamily: '"Open Sans", sans-serif' }}>Enterprise-Grade Security</h3>
              <p style={{ fontSize: '16px', color: isDarkMode ? '#cbd5e1' : '#64748b', fontFamily: '"Open Sans", sans-serif' }}>Your data is protected with industry-leading security standards</p>
            </div>
          </div>
          <div className="security-badges">
            <div className="security-badge">
              <div className="security-badge-icon">🔒</div>
              <div className="security-badge-text" style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>SSL Encrypted</div>
            </div>
            <div className="security-badge">
              <div className="security-badge-icon">🛡️</div>
              <div className="security-badge-text" style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>GDPR Compliant</div>
            </div>
            <div className="security-badge">
              <div className="security-badge-icon">✅</div>
              <div className="security-badge-text" style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>SOC 2 Certified</div>
            </div>
            <div className="security-badge">
              <div className="security-badge-icon">💾</div>
              <div className="security-badge-text" style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>Daily Backups</div>
            </div>
            <div className="security-badge">
              <div className="security-badge-icon">🔐</div>
              <div className="security-badge-text" style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>Data Encrypted</div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="newsletter-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '1rem', fontFamily: '"Open Sans", sans-serif' }}>Stay Updated</h2>
              <p style={{ fontSize: '18px', marginBottom: '2rem', fontFamily: '"Open Sans", sans-serif' }}>
                Get the latest tips, updates, and exclusive offers delivered to your inbox
              </p>
              <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!'); }}>
                <input 
                  type="email" 
                  className="newsletter-input" 
                  placeholder="Enter your email address" 
                  required
                  style={{ fontFamily: '"Open Sans", sans-serif' }}
                />
                <button type="submit" className="newsletter-btn" style={{ fontFamily: '"Open Sans", sans-serif' }}>
                  Subscribe
                </button>
              </form>
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '1rem', fontFamily: '"Open Sans", sans-serif' }}>
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Floating CTA Button */}
      <a href="/register" className="floating-cta" style={{ fontFamily: '"Open Sans", sans-serif' }}>
        <span>Get Started</span>
        <span style={{ fontSize: '20px' }}>→</span>
      </a>

      {/* Back to Top Button */}
      <button 
        className={`back-to-top ${showBackToTop ? 'show' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
        style={{ fontFamily: '"Open Sans", sans-serif' }}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      {/* Footer */}
      <Footer />
    </div>
    </>
  );
}




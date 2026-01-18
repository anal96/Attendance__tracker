import React, { useEffect, useState } from "react";

export function PublicLoadingPage({ onComplete }) {
  // Check theme immediately on mount - prioritize class over system preference
  const checkTheme = () => {
    // If dark-mode class exists, it's dark mode
    if (document.documentElement.classList.contains('dark-mode') || 
        document.body.classList.contains('dark-mode')) {
      return true;
    }
    // If no class, check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [isDarkMode, setIsDarkMode] = useState(checkTheme);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check for dark mode using dark-mode class (public pages use this)
  useEffect(() => {
    const checkDarkMode = () => {
      // Check for dark-mode class first (most reliable - this is what the page uses)
      const hasDarkClass = 
        document.documentElement.classList.contains('dark-mode') ||
        document.body.classList.contains('dark-mode');
      
      // If dark-mode class exists = dark mode
      // If dark-mode class does NOT exist = light mode (regardless of system preference)
      // Only use system preference if no class is set at all
      const isDark = hasDarkClass;
      
      setIsDarkMode(isDark);
    };
    
    // Check immediately
    checkDarkMode();
    
    // Set up observers for dynamic changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    // Also listen for storage changes (in case theme is changed in another tab)
    const handleStorageChange = () => {
      checkDarkMode();
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Animate progress - faster animation
  useEffect(() => {
    setProgress(20);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 100;
        const newProgress = prev + Math.random() * 20;
        return Math.min(newProgress, 100);
      });
    }, 50); // Faster update interval (50ms instead of 100ms)
    return () => clearInterval(interval);
  }, []);

  // Auto-hide after 400ms for fast loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 150); // Faster fade-out (150ms instead of 300ms)
    }, 400); // Faster total time (400ms instead of 1000ms)

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 7100,
    background: isDarkMode 
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
    transition: 'opacity 0.3s ease, background 0.3s ease',
    opacity: visible ? 1 : 0
  };

  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 7700,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    transition: 'opacity 0.3s ease',
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? 'auto' : 'none'
  };

  const brandColor = '#42c488';
  const spinnerSize = 96;

  return (
    <>
      {/* Overlay Background */}
      <div id="overlayer" style={overlayStyle} />
      
      {/* Loading Content - Centered Circle Spinner */}
      <div style={containerStyle}>
        {/* Centered Circle Progress Spinner with Logo */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: '2.5rem',
          position: 'relative',
          width: `${spinnerSize}px`,
          height: `${spinnerSize}px`
        }}>
          {/* SVG Circular Progress */}
          <svg
            width={spinnerSize}
            height={spinnerSize}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: 'rotate(-90deg)',
              filter: isDarkMode 
                ? 'drop-shadow(0 0 20px rgba(66, 196, 136, 0.3))'
                : 'drop-shadow(0 0 15px rgba(66, 196, 136, 0.2))'
            }}
          >
            {/* Background circle */}
            <circle
              cx={spinnerSize / 2}
              cy={spinnerSize / 2}
              r={(spinnerSize - 10) / 2}
              fill="none"
              stroke={isDarkMode ? '#334155' : '#e2e8f0'}
              strokeWidth="5"
            />
            {/* Progress circle */}
            <circle
              cx={spinnerSize / 2}
              cy={spinnerSize / 2}
              r={(spinnerSize - 10) / 2}
              fill="none"
              stroke={brandColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * (spinnerSize - 10) / 2}`}
              strokeDashoffset={`${2 * Math.PI * (spinnerSize - 10) / 2 * (1 - progress / 100)}`}
              style={{
                transition: 'stroke-dashoffset 0.3s ease-out'
              }}
            />
          </svg>
          
          {/* Inner pulsing circle */}
          <div style={{
            position: 'absolute',
            width: `${spinnerSize * 0.67}px`,
            height: `${spinnerSize * 0.67}px`,
            background: isDarkMode 
              ? 'rgba(66, 196, 136, 0.25)'
              : 'rgba(66, 196, 136, 0.15)',
            borderRadius: '50%',
            animation: 'pulse 2s ease-in-out infinite',
            top: `${(spinnerSize - spinnerSize * 0.67) / 2}px`,
            left: `${(spinnerSize - spinnerSize * 0.67) / 2}px`
          }} />
          
          {/* Center Logo */}
          <div style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${spinnerSize * 0.6}px`,
            height: `${spinnerSize * 0.6}px`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
            <img
              src="/images/Track.Manage__1_-removebg-preview.png"
              alt="Logo"
              style={{
                height: '48px',
                width: 'auto',
                objectFit: 'contain',
                animation: 'pulse 2s ease-in-out infinite',
                animationDuration: '2s'
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
            />
            {!imageLoaded && (
              <div style={{
                width: '48px',
                height: '48px',
                background: brandColor,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                TM
              </div>
            )}
          </div>
        </div>

        {/* Progress Percentage - Outside Circle */}
        <div style={{
          fontSize: '18px',
          fontWeight: '700',
          color: isDarkMode ? '#e2e8f0' : '#1e293b',
          fontFamily: '"Open Sans", sans-serif',
          marginBottom: '1.5rem',
          textAlign: 'center',
          textShadow: isDarkMode 
            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
            : '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          {Math.min(Math.round(progress), 100)}%
        </div>

        {/* Animated Dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          {[0, 150, 300].map((delay, index) => (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: isDarkMode 
                  ? 'rgba(66, 196, 136, 0.7)'
                  : brandColor,
                animation: 'bounce 1.4s ease-in-out infinite',
                animationDelay: `${delay}ms`,
                boxShadow: isDarkMode
                  ? '0 0 8px rgba(66, 196, 136, 0.5)'
                  : '0 0 6px rgba(66, 196, 136, 0.4)'
              }}
            />
          ))}
        </div>

        {/* Brand Tagline */}
        <div>
          <p style={{
            fontSize: '0.875rem',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            fontFamily: '"Open Sans", sans-serif',
            margin: 0,
            fontWeight: 400,
            letterSpacing: '0.5px'
          }}>
            Leave & Attendance Management System
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
}


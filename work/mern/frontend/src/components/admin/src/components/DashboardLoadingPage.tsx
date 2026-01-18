import React, { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

interface DashboardLoadingPageProps {
  message?: string;
  isLogout?: boolean;
}

export function DashboardLoadingPage({ 
  message = "Loading dashboard...", 
  isLogout = false 
}: DashboardLoadingPageProps) {
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check theme from ThemeProvider
  useEffect(() => {
    const checkTheme = () => {
      let isDark = false;
      
      // Check theme from ThemeProvider
      if (theme === "dark") {
        isDark = true;
      } else if (theme === "system") {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      // Also check for dark class
      if (!isDark) {
        isDark = document.documentElement.classList.contains('dark');
      }
      
      setIsDarkMode(isDark);
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
    };
  }, [theme]);

  // Animate progress
  useEffect(() => {
    if (isLogout) {
      // For logout, start at higher progress and complete faster
      setProgress(60);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return 100;
          const newProgress = prev + Math.random() * 25;
          return Math.min(newProgress, 100);
        });
      }, 50);
      return () => clearInterval(interval);
    } else {
      // For dashboard load, normal progress
      setProgress(10);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return 100;
          const newProgress = prev + Math.random() * 15;
          return Math.min(newProgress, 100);
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [isLogout]);

  const brandColor = '#42c488';
  const spinnerSize = 96;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    background: isDarkMode 
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
    transition: 'opacity 0.3s ease, background 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '500px',
    width: '90%',
    padding: '3rem 2rem',
    background: isDarkMode 
      ? 'rgba(30, 41, 59, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
    borderRadius: '20px',
    boxShadow: isDarkMode
      ? '0 20px 60px rgba(0, 0, 0, 0.5)'
      : '0 20px 60px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    textAlign: 'center'
  };

  return (
    <div style={overlayStyle}>
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

        {/* Loading Message */}
        <div style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: isDarkMode ? '#e2e8f0' : '#1e293b',
          fontFamily: '"Open Sans", sans-serif',
          marginBottom: '1.5rem'
        }}>
          {message}
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
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}




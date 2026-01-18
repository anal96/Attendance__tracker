import React, { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { LogOut } from "lucide-react";

interface DashboardLogoutLoadingProps {
  message?: string;
}

export function DashboardLogoutLoading({ 
  message = "Logging out..." 
}: DashboardLogoutLoadingProps) {
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [progress, setProgress] = useState(0);

  // Check theme from ThemeProvider
  useEffect(() => {
    const checkTheme = () => {
      let isDark = false;
      
      if (theme === "dark") {
        isDark = true;
      } else if (theme === "system") {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      if (!isDark) {
        isDark = document.documentElement.classList.contains('dark');
      }
      
      setIsDarkMode(isDark);
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
    };
  }, [theme]);

  // Animate progress for logout - slower, more visible
  useEffect(() => {
    setProgress(60);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100; // Cap at 100%
        const next = prev + Math.random() * 12; // Slower increment
        return Math.min(next, 100); // Ensure it never exceeds 100%
      });
    }, 120); // Slower update interval
    return () => clearInterval(interval);
  }, []);

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
        {/* Logout Icon with Animation */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: '2.5rem',
          position: 'relative',
          width: `${spinnerSize}px`,
          height: `${spinnerSize}px`
        }}>
          {/* Outer rotating ring - different color for logout */}
          <div style={{
            position: 'absolute',
            width: `${spinnerSize}px`,
            height: `${spinnerSize}px`,
            border: `5px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
            borderTop: `5px solid ${isDarkMode ? '#f59e0b' : '#f97316'}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            boxShadow: isDarkMode 
              ? '0 0 20px rgba(245, 158, 11, 0.3)'
              : '0 0 15px rgba(249, 115, 22, 0.2)'
          }} />
          
          {/* Inner pulsing circle - orange tint for logout */}
          <div style={{
            position: 'absolute',
            width: `${spinnerSize * 0.67}px`,
            height: `${spinnerSize * 0.67}px`,
            background: isDarkMode 
              ? 'rgba(245, 158, 11, 0.25)'
              : 'rgba(249, 115, 22, 0.15)',
            borderRadius: '50%',
            animation: 'pulse 1.5s ease-in-out infinite',
            top: `${(spinnerSize - spinnerSize * 0.67) / 2}px`,
            left: `${(spinnerSize - spinnerSize * 0.67) / 2}px`
          }} />
          
          {/* Center Logout Icon */}
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
            <div style={{
              width: '56px',
              height: '56px',
              background: isDarkMode 
                ? 'rgba(245, 158, 11, 0.2)'
                : 'rgba(249, 115, 22, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              <LogOut 
                size={32} 
                style={{
                  color: isDarkMode ? '#f59e0b' : '#f97316',
                  animation: 'slideOut 1s ease-in-out infinite'
                }}
              />
            </div>
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

        {/* Logout Message */}
        <div style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          color: isDarkMode ? '#e2e8f0' : '#1e293b',
          fontFamily: '"Open Sans", sans-serif',
          marginBottom: '1rem'
        }}>
          {message}
        </div>

        {/* Sub-message */}
        <div style={{
          fontSize: '0.875rem',
          color: isDarkMode ? '#94a3b8' : '#64748b',
          fontFamily: '"Open Sans", sans-serif',
          marginBottom: '1.5rem'
        }}>
          Please wait while we securely log you out...
        </div>

        {/* Animated Dots - Orange for logout */}
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
                  ? 'rgba(245, 158, 11, 0.7)'
                  : '#f97316',
                animation: 'bounce 1.4s ease-in-out infinite',
                animationDelay: `${delay}ms`,
                boxShadow: isDarkMode
                  ? '0 0 8px rgba(245, 158, 11, 0.5)'
                  : '0 0 6px rgba(249, 115, 22, 0.4)'
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
        
        @keyframes slideOut {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}


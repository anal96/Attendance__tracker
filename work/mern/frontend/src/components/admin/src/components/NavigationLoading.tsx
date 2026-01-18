import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";

interface NavigationLoadingProps {
  message?: string;
}

export function NavigationLoading({ message = "Loading..." }: NavigationLoadingProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const checkDarkMode = () => {
      let isDark = false;
      isDark = document.documentElement.classList.contains('dark');
      if (!isDark) {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      setIsDarkMode(isDark);
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  // Animate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" 
        : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
    }`}>
      <div className="max-w-lg w-full px-4">
        <Card className={`p-10 md:p-14 ${
          isDarkMode 
            ? "bg-gray-800/95 border-gray-700 shadow-2xl backdrop-blur-sm" 
            : "bg-white/95 border-gray-200 shadow-xl backdrop-blur-sm"
        }`}>
          <div className="text-center space-y-8">
            {/* Brand Logo/Icon Area */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Outer rotating ring with brand color */}
                <div className={`h-24 w-24 border-4 ${
                  isDarkMode 
                    ? "border-gray-700" 
                    : "border-gray-200"
                } border-t-[#42c488] rounded-full animate-spin`} />
                
                {/* Inner pulsing circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`h-16 w-16 ${
                    isDarkMode 
                      ? "bg-[#42c488]/20" 
                      : "bg-[#42c488]/10"
                  } rounded-full animate-pulse`} />
                </div>

                {/* Center brand logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="/images/Track.Manage__1_-removebg-preview.png?v=2" 
                    alt="Track.Manage Logo" 
                    className="h-12 w-auto object-contain animate-pulse"
                    style={{ animationDuration: '2s' }}
                  />
                </div>
              </div>
            </div>

            {/* Brand Name */}
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
                Track.Manage
              </h1>
              <div className="h-1 w-24 mx-auto bg-[#42c488] rounded-full mb-4" />
            </div>

            {/* Loading Message */}
            <div>
              <h2 className={`text-xl md:text-2xl font-semibold mb-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
                {message}
              </h2>
              <p className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Please wait while we load your content
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className={`w-full h-2.5 rounded-full overflow-hidden ${
                isDarkMode 
                  ? "bg-gray-700" 
                  : "bg-gray-200"
              }`}>
                <div 
                  className="h-full bg-gradient-to-r from-[#42c488] to-[#38a169] transition-all duration-300 ease-out rounded-full shadow-lg"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className={`text-xs font-medium ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}>
                {Math.round(progress)}%
              </p>
            </div>

            {/* Animated Dots with Brand Color */}
            <div className="flex justify-center space-x-2 pt-2">
              <div className={`h-2.5 w-2.5 rounded-full ${
                isDarkMode ? "bg-[#42c488]/60" : "bg-[#42c488]"
              } animate-bounce`} style={{ animationDelay: "0ms" }} />
              <div className={`h-2.5 w-2.5 rounded-full ${
                isDarkMode ? "bg-[#42c488]/60" : "bg-[#42c488]"
              } animate-bounce`} style={{ animationDelay: "150ms" }} />
              <div className={`h-2.5 w-2.5 rounded-full ${
                isDarkMode ? "bg-[#42c488]/60" : "bg-[#42c488]"
              } animate-bounce`} style={{ animationDelay: "300ms" }} />
            </div>

            {/* Brand Tagline */}
            <div className={`pt-4 border-t ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}>
              <p className={`text-xs ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}>
                Leave & Attendance Management System
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { AlertTriangle, WifiOff, ServerOff, RefreshCw, Home, Info } from "lucide-react";

interface ErrorPageProps {
  errorType?: "network" | "server" | "unknown";
  errorMessage?: string;
  statusCode?: number;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export function ErrorPage({ 
  errorType = "unknown", 
  errorMessage, 
  statusCode,
  onRetry,
  onGoHome 
}: ErrorPageProps) {
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkDarkMode = () => {
      let isDark = false;
      if (theme === "dark") {
        isDark = true;
      } else if (theme === "system") {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      isDark = isDark || document.documentElement.classList.contains('dark');
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
  }, [theme]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = "/";
    }
  };

  const getErrorDetails = () => {
    switch (errorType) {
      case "network":
        return {
          icon: <WifiOff className="h-20 w-20" />,
          title: "Connection Lost",
          description: "Unable to connect to the server. Please check your internet connection.",
          suggestions: [
            "Check your internet connection",
            "Verify your network settings",
            "Try refreshing the page",
            "Contact IT support if the problem persists"
          ]
        };
      case "server":
        return {
          icon: <ServerOff className="h-20 w-20" />,
          title: "Server Error",
          description: statusCode 
            ? `The server encountered an error (${statusCode}). Our team has been notified.`
            : "The server is temporarily unavailable. Please try again later.",
          suggestions: [
            "Wait a few moments and try again",
            "Check if the service is under maintenance",
            "Clear your browser cache",
            "Contact support if the issue continues"
          ]
        };
      default:
        return {
          icon: <AlertTriangle className="h-20 w-20" />,
          title: "Something Went Wrong",
          description: errorMessage || "An unexpected error occurred. Please try again.",
          suggestions: [
            "Refresh the page",
            "Clear your browser cache",
            "Try again in a few moments",
            "Contact support if the problem persists"
          ]
        };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" 
        : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
    }`}>
      <div className="max-w-2xl w-full">
        <Card className={`p-8 md:p-12 ${
          isDarkMode 
            ? "bg-gray-800/90 border-gray-700 shadow-2xl" 
            : "bg-white/90 border-gray-200 shadow-xl"
        }`}>
          <div className="text-center space-y-6">
            {/* Error Icon */}
            <div className={`flex justify-center ${
              errorType === "network" 
                ? "text-orange-500" 
                : errorType === "server" 
                ? "text-red-500" 
                : "text-yellow-500"
            }`}>
              {errorDetails.icon}
            </div>

            {/* Error Title */}
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-3 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
                {errorDetails.title}
              </h1>
              {statusCode && (
                <p className={`text-2xl font-semibold ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Error {statusCode}
                </p>
              )}
            </div>

            {/* Error Description */}
            <p className={`text-lg ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}>
              {errorDetails.description}
            </p>

            {/* Suggestions */}
            <div className={`rounded-lg p-6 text-left ${
              isDarkMode 
                ? "bg-gray-700/50 border border-gray-600" 
                : "bg-gray-50 border border-gray-200"
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Info className={`h-5 w-5 ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`} />
                <h3 className={`font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  What you can do:
                </h3>
              </div>
              <ul className="space-y-2">
                {errorDetails.suggestions.map((suggestion, index) => (
                  <li key={index} className={`flex items-start gap-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                      isDarkMode ? "bg-blue-400" : "bg-blue-600"
                    }`} />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={handleRetry}
                size="lg"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                {retryCount > 0 ? `Retry (${retryCount})` : "Retry"}
              </Button>
              <Button
                onClick={handleGoHome}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Home className="h-5 w-5" />
                Go to Home
              </Button>
            </div>

            {/* Additional Info */}
            <div className={`pt-6 border-t ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}>
              <p className={`text-sm ${
                isDarkMode ? "text-gray-500" : "text-gray-500"
              }`}>
                If this problem persists, please contact our support team with the error code:{" "}
                <span className="font-mono font-semibold">
                  {statusCode || "ERR-" + Date.now().toString().slice(-6)}
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}




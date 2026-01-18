import { useEffect, useState } from "react";
import { ErrorPage } from "./ErrorPage";
import axios from "axios";

interface NetworkErrorHandlerProps {
  children: React.ReactNode;
  onError?: (error: { type: "network" | "server"; statusCode?: number; message?: string }) => void;
}

export function NetworkErrorHandler({ children, onError }: NetworkErrorHandlerProps) {
  const [networkError, setNetworkError] = useState<{
    type: "network" | "server";
    statusCode?: number;
    message?: string;
  } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (networkError?.type === "network") {
        setNetworkError(null);
        setErrorCount(0);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNetworkError({
        type: "network",
        message: "No internet connection detected",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [networkError]);

  // Intercept axios errors globally
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Clear error on new request attempt
        if (networkError && isOnline) {
          setNetworkError(null);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        // Clear error on successful response
        if (networkError) {
          setNetworkError(null);
          setErrorCount(0);
        }
        return response;
      },
      (error) => {
        // Handle network errors
        if (!error.response) {
          // Network error (no response from server)
          if (error.code === "ERR_NETWORK" || error.message.includes("Network Error")) {
            setErrorCount(prev => prev + 1);
            // Only show error page after multiple consecutive failures
            if (errorCount >= 2 || !isOnline) {
              setNetworkError({
                type: "network",
                message: "Unable to reach the server. Please check your connection.",
              });
              if (onError) {
                onError({
                  type: "network",
                  message: error.message,
                });
              }
            }
          }
        } else {
          // Server error (5xx status codes)
          const status = error.response.status;
          if (status >= 500) {
            setErrorCount(prev => prev + 1);
            if (errorCount >= 1) {
              setNetworkError({
                type: "server",
                statusCode: status,
                message: `Server error: ${status} ${error.response.statusText}`,
              });
              if (onError) {
                onError({
                  type: "server",
                  statusCode: status,
                  message: error.response.statusText,
                });
              }
            }
          } else {
            // Clear error for non-server errors (4xx, etc.)
            setErrorCount(0);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [networkError, isOnline, errorCount, onError]);

  // Intercept fetch errors globally
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Check for server errors
        if (!response.ok && response.status >= 500) {
          setErrorCount(prev => prev + 1);
          if (errorCount >= 1) {
            setNetworkError({
              type: "server",
              statusCode: response.status,
              message: `Server error: ${response.status} ${response.statusText}`,
            });
            if (onError) {
              onError({
                type: "server",
                statusCode: response.status,
                message: response.statusText,
              });
            }
          }
        } else if (response.ok) {
          // Clear error on successful request
          setNetworkError(null);
          setErrorCount(0);
        }
        
        return response;
      } catch (error: any) {
        // Network error (no connection, CORS, etc.)
        if (error.name === "TypeError" && error.message.includes("fetch")) {
          setErrorCount(prev => prev + 1);
          if (errorCount >= 2 || !isOnline) {
            setNetworkError({
              type: "network",
              message: "Unable to reach the server. Please check your connection.",
            });
            if (onError) {
              onError({
                type: "network",
                message: error.message,
              });
            }
          }
        }
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [onError, errorCount, isOnline]);

  const handleRetry = () => {
    setNetworkError(null);
    // Try to reconnect
    if (isOnline) {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    setNetworkError(null);
    window.location.href = "/";
  };

  if (networkError) {
    return (
      <ErrorPage
        errorType={networkError.type}
        errorMessage={networkError.message}
        statusCode={networkError.statusCode}
        onRetry={handleRetry}
        onGoHome={handleGoHome}
      />
    );
  }

  return <>{children}</>;
}


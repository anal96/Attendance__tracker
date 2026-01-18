import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./header";
import Footer from "./footer";
import { PublicLoadingPage } from "./PublicLoadingPage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [resendStatus, setResendStatus] = useState({ state: "idle", message: "" });
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState("");
  const [verificationStatus, setVerificationStatus] = useState({ state: "idle", message: "" });
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState({ state: "idle", message: "" });
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [isSendingForgot, setIsSendingForgot] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resendForgotStatus, setResendForgotStatus] = useState({ state: "idle", message: "" });
  const [forgotResendTimer, setForgotResendTimer] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('home-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Check if user is already logged in - redirect to dashboard (prevent back navigation)
  useEffect(() => {
    const getCookie = (name) => {
      const cookies = document.cookie.split('; ');
      for (let cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key.trim() === name) {
          return decodeURIComponent(value);
        }
      }
      return null;
    };

    const userType = getCookie("userType");
    if (userType) {
      // User is already logged in - redirect back to dashboard
      console.log("🚫 User already logged in - redirecting to dashboard");
      window.location.href = "http://localhost:3000";
    }
    // Don't clear flags here - they should only be cleared on logout
    // If user is on login page without cookies, they will set flags on successful login
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

  useEffect(() => {
    let timer;
    if (forgotResendTimer > 0) {
      timer = setTimeout(() => {
        setForgotResendTimer((prev) => Math.max(prev - 1, 0));
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [forgotResendTimer]);

  // Prevent dark mode from being removed by scroll events or other scripts
  useEffect(() => {
    const preserveDarkMode = (mutations) => {
      if (isDarkMode) {
        // Check if dark-mode class was removed
        const htmlRemoved = mutations.some(m => 
          m.type === 'attributes' && 
          m.attributeName === 'class' && 
          !document.documentElement.classList.contains('dark-mode')
        );
        const bodyRemoved = mutations.some(m => 
          m.type === 'attributes' && 
          m.attributeName === 'class' && 
          !document.body.classList.contains('dark-mode')
        );

        if (htmlRemoved || !document.documentElement.classList.contains('dark-mode')) {
          document.documentElement.classList.add('dark-mode');
        }
        if (bodyRemoved || !document.body.classList.contains('dark-mode')) {
          document.body.classList.add('dark-mode');
        }
      }
    };

    // Monitor for class changes
    const observer = new MutationObserver(preserveDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'],
      attributeOldValue: true
    });
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'],
      attributeOldValue: true
    });

    // Also check on scroll events (in case something removes it during scroll)
    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (isDarkMode) {
          if (!document.documentElement.classList.contains('dark-mode')) {
            document.documentElement.classList.add('dark-mode');
          }
          if (!document.body.classList.contains('dark-mode')) {
            document.body.classList.add('dark-mode');
          }
        }
      }, 50); // Throttle to every 50ms
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(scrollTimeout);
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Function to get real-time location from browser (REQUIRED - no fallback to localhost)
  // This ensures we ALWAYS get real location - retries multiple times if needed
  const getBrowserLocation = (retryCount = 0, maxRetries = 3) => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('❌ Browser geolocation not supported');
        resolve(null);
        return;
      }

      // Check if permission was previously denied
      navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          console.error('❌ Location permission was previously denied');
          console.error('💡 Please enable location permission in browser settings');
          console.error('📍 Browser: Click lock icon → Location → Allow');
          resolve(null);
          return;
        }
      }).catch(() => {
        // Permissions API not supported, continue anyway
      });

      // Longer timeout to allow browser to get high accuracy location (especially with VPN)
      const timeout = setTimeout(() => {
        console.warn(`⏱️ Geolocation timeout (attempt ${retryCount + 1}/${maxRetries + 1})`);
        console.warn('⚠️ If using VPN: VPN may be slowing down location detection. Please wait...');
        
        // Retry if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          console.log(`🔄 Retrying location request... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            getBrowserLocation(retryCount + 1, maxRetries).then(resolve);
          }, 3000); // Increased delay for VPN scenarios
        } else {
          console.error('❌ Failed to get location after multiple attempts');
          console.error('⚠️ VPN detected: If you are using a VPN, it may be blocking location access. Try disabling VPN temporarily.');
          resolve(null);
        }
      }, 30000); // Increased to 30 seconds per attempt for VPN scenarios

      // Request location with high accuracy - FORCE fresh GPS location (no cache, no network-based)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
          console.log(`📍 ✅ Got browser location: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
          console.log(`📍 Location details - altitude: ${altitude || 'N/A'}, heading: ${heading || 'N/A'}, speed: ${speed || 'N/A'}`);
          
          // Check for suspicious accuracy that might indicate VPN/network location instead of GPS
          if (accuracy > 5000) {
            console.warn(`⚠️ WARNING: Very low accuracy (${Math.round(accuracy)}m = ${Math.round(accuracy/1000)}km) - Location may be network-based or affected by VPN`);
            console.warn('⚠️ VPN detected: VPN may be interfering with GPS. Location may not be accurate.');
            console.warn('⚠️ TIP: Try disabling VPN temporarily or move to an area with better GPS signal');
          } else if (accuracy > 1000) {
            console.warn(`⚠️ Moderate accuracy (${Math.round(accuracy)}m) - Location may be affected by VPN or network positioning`);
          }
          
          // Check if location seems cached (same coordinates from previous attempt)
          const lastLocation = sessionStorage.getItem('lastLoginLocation');
          if (lastLocation) {
            try {
              const last = JSON.parse(lastLocation);
              const timeDiff = Date.now() - (last.time || 0);
              const distance = Math.sqrt(Math.pow(latitude - last.lat, 2) + Math.pow(longitude - last.lng, 2)) * 111000; // Approx distance in meters
              if (distance < 10 && timeDiff < 60000) { // Less than 10m and within 1 minute
                console.warn(`⚠️ WARNING: Location is identical to previous login (${Math.round(distance)}m away, ${Math.round(timeDiff/1000)}s ago)`);
                console.warn('⚠️ This may indicate cached location or VPN affecting GPS. Try disabling VPN.');
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
          
          // Store current location for comparison
          sessionStorage.setItem('lastLoginLocation', JSON.stringify({ 
            lat: latitude, 
            lng: longitude, 
            time: Date.now(),
            accuracy: accuracy
          }));
          
          // Reverse geocode to get address (using a free service)
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
            .then(res => res.json())
            .then(data => {
              const locationParts = [];
              if (data.city) locationParts.push(data.city);
              if (data.principalSubdivision) locationParts.push(data.principalSubdivision);
              if (data.countryName) locationParts.push(data.countryName);
              const location = locationParts.length > 0 ? locationParts.join(', ') : `${latitude}, ${longitude}`;
              console.log(`✅ Browser location resolved for login: ${location}`);
              
              // Warn if reverse geocoded location seems incorrect (VPN server location)
              if (data.countryName && !data.city && accuracy > 5000) {
                console.warn(`⚠️ WARNING: Reverse geocode returned country-level location only (${data.countryName}) - may be VPN server location`);
                console.warn(`⚠️ GPS accuracy is ${Math.round(accuracy)}m - VPN may be interfering with location detection`);
              }
              
              // Return object with location string and coordinates
              resolve({
                location: location,
                latitude: latitude,
                longitude: longitude,
                accuracy: accuracy
              });
            })
            .catch(err => {
              console.error('Error reverse geocoding:', err);
              // Fallback to coordinates only (still real location, not localhost)
              console.log(`✅ Using coordinates for login: ${latitude}, ${longitude}`);
              resolve({
                location: `${latitude}, ${longitude}`,
                latitude: latitude,
                longitude: longitude,
                accuracy: accuracy
              });
            });
        },
        (error) => {
          clearTimeout(timeout);
          // Log specific error with helpful message
          if (error.code === 1) {
            console.error('❌ Location permission DENIED');
            console.error('💡 To get real location: Click lock icon → Location → Allow → Refresh → Login');
            console.warn('⚠️ If using VPN: VPN may block location access. Try disabling VPN or using browser location manually.');
            resolve(null);
          } else if (error.code === 2) {
            console.warn('❌ Location unavailable - check GPS/WiFi');
            console.warn('⚠️ VPN detected: VPN may interfere with location detection. Try disabling VPN temporarily or allow more time.');
            // Retry if we haven't exceeded max retries
            if (retryCount < maxRetries) {
              console.log(`🔄 Retrying location request... (${retryCount + 1}/${maxRetries})`);
              setTimeout(() => {
                getBrowserLocation(retryCount + 1, maxRetries).then(resolve);
              }, 3000); // Increased delay for VPN scenarios
            } else {
              resolve(null);
            }
          } else if (error.code === 3) {
            console.warn('⏱️ Location request timeout - GPS taking too long');
            console.warn('⚠️ VPN detected: VPN can slow down location detection. Waiting longer...');
            // Retry if we haven't exceeded max retries with longer timeout
            if (retryCount < maxRetries) {
              console.log(`🔄 Retrying location request with extended timeout... (${retryCount + 1}/${maxRetries})`);
              setTimeout(() => {
                getBrowserLocation(retryCount + 1, maxRetries).then(resolve);
              }, 3000); // Increased delay for VPN scenarios
            } else {
              console.error('❌ Location detection failed after multiple attempts. VPN may be blocking access.');
              resolve(null);
            }
          } else {
            console.warn(`❌ Browser geolocation error (${error.message})`);
            console.warn('⚠️ VPN may be interfering with location detection. Try disabling VPN temporarily.');
            // Retry if we haven't exceeded max retries
            if (retryCount < maxRetries) {
              console.log(`🔄 Retrying location request... (${retryCount + 1}/${maxRetries})`);
              setTimeout(() => {
                getBrowserLocation(retryCount + 1, maxRetries).then(resolve);
              }, 3000); // Increased delay for VPN scenarios
            } else {
              resolve(null);
            }
          }
        },
        {
          enableHighAccuracy: true, // Always use high accuracy for better location - FORCES GPS, not network
          timeout: 30000, // Increased to 30 seconds for VPN scenarios
          maximumAge: 0 // CRITICAL: Always get fresh location, don't use cached (prevents VPN cached location)
        }
      );
    });
  };

  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) return;
    try {
      setResendStatus({ state: "loading", message: "" });
      const response = await fetch("http://localhost:5000/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingVerificationEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setResendStatus({
          state: "success",
          message: data.message || "Verification email sent. Please check your inbox."
        });
      } else {
        setResendStatus({
          state: "error",
          message: data.message || "Unable to resend verification email."
        });
      }
    } catch (error) {
      setResendStatus({
        state: "error",
        message: error.message || "Unable to resend verification email."
      });
    }
  };

  const openVerificationModal = () => {
    setShowVerificationModal(true);
    setVerificationOtp("");
    setVerificationStatus({ state: "info", message: `Enter the 6-digit code we sent to ${pendingVerificationEmail}.` });
  };

  const closeVerificationModal = () => {
    setShowVerificationModal(false);
    setVerificationOtp("");
    setVerificationStatus({ state: "idle", message: "" });
  };

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (!pendingVerificationEmail) {
      setVerificationStatus({ state: "error", message: "We couldn't determine which email to verify. Please try logging in again." });
      return;
    }
    if (!verificationOtp || verificationOtp.trim().length !== 6) {
      setVerificationStatus({ state: "error", message: "Enter the 6-digit code from your inbox." });
      return;
    }
    setIsVerifyingOtp(true);
    setVerificationStatus({ state: "loading", message: "Verifying code..." });
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pendingVerificationEmail,
          otp: verificationOtp
        })
      });
      const data = await response.json();
      if (response.ok) {
        setVerificationStatus({ state: "success", message: data.message || "Email verified! You can now sign in." });
        setTimeout(() => {
          closeVerificationModal();
          setPendingVerificationEmail("");
          setAuthError("");
        }, 1200);
      } else {
        setVerificationStatus({ state: "error", message: data.message || "Unable to verify the code." });
      }
    } catch (error) {
      setVerificationStatus({ state: "error", message: error.message || "Unable to verify the code." });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const openForgotModal = () => {
    setShowForgotModal(true);
    setForgotStep("request");
    setForgotEmail(email);
    setForgotStatus({ state: "idle", message: "" });
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setResendForgotStatus({ state: "idle", message: "" });
    setForgotResendTimer(0);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStatus({ state: "idle", message: "" });
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setResendForgotStatus({ state: "idle", message: "" });
    setForgotResendTimer(0);
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotStatus({ state: "error", message: "Please enter your email address." });
      return;
    }
    setIsSendingForgot(true);
    setForgotStatus({ state: "loading", message: "Sending reset code..." });
    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setForgotStatus({ state: "success", message: data.message || "Reset code sent. Check your inbox." });
        setForgotStep("verify");
        setForgotResendTimer(60);
      } else {
        setForgotStatus({ state: "error", message: data.message || "Unable to send reset code." });
      }
    } catch (error) {
      setForgotStatus({ state: "error", message: error.message || "Unable to send reset code." });
    } finally {
      setIsSendingForgot(false);
    }
  };

  const handleResendForgotCode = async () => {
    if (!forgotEmail || forgotResendTimer > 0) return;
    setResendForgotStatus({ state: "loading", message: "" });
    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setResendForgotStatus({ state: "success", message: data.message || "Reset code sent." });
        setForgotStatus({ state: "info", message: "We sent a fresh reset code to your email." });
        setForgotResendTimer(60);
      } else {
        setResendForgotStatus({ state: "error", message: data.message || "Unable to resend code." });
      }
    } catch (error) {
      setResendForgotStatus({ state: "error", message: error.message || "Unable to resend code." });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setForgotStatus({ state: "error", message: "Enter the 6-digit reset code sent to your email." });
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotStatus({ state: "error", message: "New password must be at least 6 characters long." });
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotStatus({ state: "error", message: "Passwords do not match." });
      return;
    }

    setIsResettingPassword(true);
    setForgotStatus({ state: "loading", message: "Updating password..." });
    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          otp: forgotOtp,
          newPassword: forgotNewPassword
        })
      });
      const data = await response.json();
      if (response.ok) {
        setForgotStatus({ state: "success", message: data.message || "Password updated! You can now sign in." });
        setTimeout(() => {
          closeForgotModal();
        }, 1500);
      } else {
        setForgotStatus({ state: "error", message: data.message || "Unable to reset password." });
      }
    } catch (error) {
      setForgotStatus({ state: "error", message: error.message || "Unable to reset password." });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");
    setPendingVerificationEmail("");
    setResendStatus({ state: "idle", message: "" });

    try {
      // ALWAYS get browser location - REQUIRED for login (no fallback to localhost)
      // This ensures we get REAL location - will retry multiple times if needed
      console.log('📍 Requesting location permission for login (REQUIRED - will retry if needed)...');
      console.log('💡 Please ALLOW location access when prompted to proceed with login');
      
      const browserLocation = await getBrowserLocation();
      
      // Validate location was obtained - if not, show error and prevent login
      if (!browserLocation || !browserLocation.latitude || !browserLocation.longitude) {
        console.error('❌ ERROR: Real location is REQUIRED for login');
        setAuthError('Location access is required to login. Please allow location permission in your browser and try again.');
        setIsLoading(false);
        return; // Stop login process
      }
      
      console.log('✅ SUCCESS: Real location obtained for login:', browserLocation.location);
      console.log(`📍 Coordinates: ${browserLocation.latitude}, ${browserLocation.longitude}`);
      
      let response;
      let data;
      
      try {
        response = await fetch("http://localhost:5000/login", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            username: email, 
            password,
            location: browserLocation?.location || null, // Location string
            latitude: browserLocation?.latitude || null, // Exact coordinates
            longitude: browserLocation?.longitude || null,
            accuracy: browserLocation?.accuracy || null
          }),
        });

        // Try to parse JSON response
        try {
          const text = await response.text();
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error("❌ Error parsing response:", parseError);
          // If response is not JSON, create error object from status
          data = {
            error: `Server error (${response.status})`,
            message: response.status === 500 ? "Internal server error. Please try again later." :
                     response.status === 503 ? "Service temporarily unavailable. Please try again." :
                     response.status === 400 ? "Invalid request. Please check your input." :
                     response.status === 401 ? "Invalid email or password. Please check your credentials." :
                     response.status === 403 ? "Access denied. Please contact administrator." :
                     `Unexpected error (${response.status}). Please try again.`,
            details: "Server returned non-JSON response"
          };
        }
      } catch (fetchError) {
        // Network error - fetch failed completely
        console.error("❌ Network error during login:", fetchError);
        setAuthError("Unable to connect to server. Please check your internet connection and try again.");
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        setAuthError("");
        setPendingVerificationEmail("");
        setResendStatus({ state: "idle", message: "" });
        // Set flag in both sessionStorage and URL parameter to ensure it persists across redirects
        sessionStorage.setItem("justLoggedIn", "true");
        localStorage.setItem("justLoggedIn", "true"); // Backup in localStorage
        console.log("✅ Login successful - setting justLoggedIn flag");
        console.log("🔍 Verifying flags - session:", sessionStorage.getItem("justLoggedIn"), "local:", localStorage.getItem("justLoggedIn"));
        
        // Small delay to ensure flags are set before redirect
        setTimeout(() => {
          // Verify flags are still set before redirect
          const sessionFlag = sessionStorage.getItem("justLoggedIn");
          const localFlag = localStorage.getItem("justLoggedIn");
          console.log("🔍 Before redirect - session:", sessionFlag, "local:", localFlag);
          
          // Redirect with URL parameter as backup
          window.location.href = "http://localhost:3000?justLoggedIn=true";
        }, 100); // Small delay to ensure flags are persisted
      } else {
        // Handle different error types with detailed messages
        let errorMessage = "";
        
        // Prioritize error message from backend
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
          if (data.details) {
            errorMessage += ": " + data.details;
          } else {
            errorMessage += ". Please try again.";
          }
        } else {
          // Fallback based on status code
          switch (response.status) {
            case 400:
              errorMessage = "Invalid request. Please check your input and try again.";
              break;
            case 401:
              errorMessage = "Invalid email or password. Please check your credentials and try again.";
              break;
            case 403:
              errorMessage = "Access denied. Your account may be restricted. Please contact administrator.";
              break;
            case 404:
              errorMessage = "Service not found. Please contact support.";
              break;
            case 500:
              errorMessage = "Internal server error. Please try again later.";
              break;
            case 503:
              errorMessage = "Service temporarily unavailable. Please try again in a few moments.";
              break;
            default:
              errorMessage = `Login failed (Error ${response.status}). Please try again.`;
          }
        }
        
        // Handle specific error codes
        if (response.status === 403) {
          if (data?.code === "EMAIL_NOT_VERIFIED") {
            setAuthError(data.message || "Please verify your email before logging in.");
            setPendingVerificationEmail(data?.pendingEmail || email);
            setIsLoading(false);
            return;
          }
          if (data?.code === "ACCOUNT_SUSPENDED" || data?.code === "ACCOUNT_INACTIVE") {
            errorMessage = data.message || errorMessage;
          }
        }
        
        if (response.status === 400) {
          // Bad request - validation errors
          if (data.requiresLocation) {
            // Location required error with troubleshooting tips
            let locationErrorMsg = data.message || errorMessage;
            if (data.troubleshooting && Array.isArray(data.troubleshooting)) {
              locationErrorMsg += "\n\nTroubleshooting:\n" + data.troubleshooting.map((tip, i) => `${i + 1}. ${tip}`).join("\n");
            }
            errorMessage = locationErrorMsg;
          } else if (data.error === "Invalid email format") {
            errorMessage = data.message || "Please enter a valid email address (e.g., user@example.com)";
          } else if (data.error === "Email/Username is required") {
            errorMessage = data.message || "Please enter your email address";
          } else if (data.error === "Password is required") {
            errorMessage = data.message || "Please enter your password";
          }
        }
        
        // Display detailed error
        console.error("❌ Login failed:", {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          message: data.message,
          details: data.details,
          code: data.code
        });
        
        setAuthError(errorMessage);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("❌ Unexpected error during login:", err);
      console.error("❌ Error name:", err.name);
      console.error("❌ Error message:", err.message);
      console.error("❌ Error stack:", err.stack);
      
      let errorMessage = "";
      
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        errorMessage = "Unable to connect to server. Please check your internet connection and try again.";
      } else if (err.name === "SyntaxError" && err.message.includes("JSON")) {
        errorMessage = "Server returned invalid response. Please try again or contact support.";
      } else if (err.message) {
        errorMessage = err.message;
      } else {
        errorMessage = "An unexpected error occurred. Please try again.";
      }
      
      setAuthError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <>
      {pageLoading && <PublicLoadingPage onComplete={() => setPageLoading(false)} />}
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <style>{`
        * {
          box-sizing: border-box;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1200;
          padding: 1.5rem;
        }

        .modal-card {
          background: #ffffff;
          border-radius: 24px;
          max-width: 520px;
          width: 100%;
          padding: 32px;
          box-shadow: 0 30px 70px rgba(15, 23, 42, 0.35);
          position: relative;
        }

        .modal-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: transparent;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #94a3b8;
          transition: color 0.2s ease;
        }

        .modal-close-btn:hover {
          color: #0f172a;
        }

        .modal-card h3 {
          margin: 0 0 6px 0;
          font-size: 26px;
          font-weight: 700;
          color: #0f172a;
        }

        .modal-card p {
          margin: 0 0 18px 0;
          color: #475569;
          font-size: 14px;
        }

        .modal-status {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .modal-status.info {
          background: rgba(59, 130, 246, 0.1);
          color: #1d4ed8;
        }

        .modal-status.error {
          background: rgba(239, 68, 68, 0.12);
          color: #b91c1c;
        }

        .modal-status.success {
          background: rgba(16, 185, 129, 0.12);
          color: #047857;
        }

        .modal-status.loading {
          background: rgba(15, 118, 110, 0.12);
          color: #0f766e;
        }

        .modal-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .modal-card .resend-otp-btn {
          margin-top: 10px;
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-card .resend-otp-btn:hover:not(:disabled) {
          border-color: #42c488;
          color: #42c488;
        }

        .modal-card .resend-otp-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .resend-forgot-status {
          font-size: 13px;
          margin-top: 6px;
        }

        .resend-forgot-status.success {
          color: #047857;
        }

        .resend-forgot-status.error {
          color: #b91c1c;
        }

        .login-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          padding-top: 120px;
          position: relative;
          overflow: hidden;
        }

        .login-wrapper::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(66, 196, 136, 0.08) 0%, transparent 70%);
          top: -300px;
          right: -300px;
          border-radius: 50%;
          animation: float 8s ease-in-out infinite;
        }

        .login-wrapper::after {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(66, 196, 136, 0.06) 0%, transparent 70%);
          bottom: -250px;
          left: -250px;
          border-radius: 50%;
          animation: float 10s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }

        .login-container {
          width: 100%;
          max-width: 900px;
          position: relative;
          z-index: 1;
        }

        .login-card {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          min-height: 580px;
        }

        .login-form-section {
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }

        .login-brand img {
          width: 40px;
          height: 40px;
        }

        .login-brand-text h1 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: #0f172a;
          line-height: 1.2;
        }

        .login-brand-text p {
          font-size: 12px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 32px 0;
          line-height: 1.5;
        }

        .form-group {
          margin-bottom: 20px;
          position: relative;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 6px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #94a3b8;
          pointer-events: none;
        }

        .form-input {
          width: 100%;
          padding: 12px 14px 12px 44px;
          font-size: 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          background: #ffffff;
          color: #0f172a;
          transition: all 0.2s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: #42c488;
          box-shadow: 0 0 0 4px rgba(66, 196, 136, 0.1);
        }

        .form-input::placeholder {
          color: #94a3b8;
        }

        .auth-error {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 16px;
          display: block;
          line-height: 1.6;
          white-space: pre-line;
        }

        .verification-alert {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.07) 0%, rgba(59, 130, 246, 0.07) 100%);
          border: 1px solid rgba(16, 185, 129, 0.35);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .verification-alert h4 {
          margin: 0 0 8px;
          font-size: 15px;
          color: #0f172a;
        }

        .verification-alert p {
          margin: 0 0 12px;
          font-size: 13px;
          color: #475569;
          line-height: 1.5;
        }

        .verification-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .resend-button {
          background: #0f172a;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .resend-button:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .resend-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .verification-status {
          font-size: 13px;
        }

        .verification-status.success {
          color: #047857;
        }

        .verification-status.error {
          color: #dc2626;
        }

        .password-toggle-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .password-toggle-btn:hover {
          color: #42c488;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .custom-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #cbd5e1;
          border-radius: 4px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .custom-checkbox input {
          opacity: 0;
          position: absolute;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .custom-checkbox input:checked + .checkmark {
          display: block;
        }

        .custom-checkbox:has(input:checked) {
          background: #42c488;
          border-color: #42c488;
        }

        .checkmark {
          display: none;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .checkbox-label {
          font-size: 14px;
          color: #475569;
          cursor: pointer;
          user-select: none;
        }

        .forgot-link {
          font-size: 14px;
          font-weight: 600;
          color: #42c488;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .forgot-link:hover {
          color: #38a169;
        }

        .btn-primary {
          width: 100%;
          padding: 12px 20px;
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(66, 196, 136, 0.25);
          margin-bottom: 12px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(66, 196, 136, 0.35);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-primary .login-spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: login-spin 0.8s linear infinite;
          margin-right: 10px;
          flex-shrink: 0;
        }

        @keyframes login-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .btn-google {
          width: 100%;
          padding: 12px 20px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-google:hover {
          border-color: #42c488;
          background: #f0fdf4;
          color: #42c488;
        }

        .signup-link {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: #64748b;
        }

        .signup-link a {
          color: #42c488;
          font-weight: 600;
          text-decoration: none;
          margin-left: 4px;
        }

        .signup-link a:hover {
          text-decoration: underline;
        }

        .login-visual {
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }

        .login-visual::before {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 60px,
            rgba(255, 255, 255, 0.03) 60px,
            rgba(255, 255, 255, 0.03) 120px
          );
          animation: slide 20s linear infinite;
        }

        @keyframes slide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }

        .visual-content {
          position: relative;
          z-index: 2;
          text-align: center;
          color: white;
        }

        .visual-icon {
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .visual-icon img {
          width: 56px;
          height: 56px;
          filter: brightness(0) invert(1);
        }

        .visual-title {
          font-size: 26px;
          font-weight: 700;
          margin: 0 0 12px 0;
          letter-spacing: -0.5px;
        }

        .visual-description {
          font-size: 14px;
          opacity: 0.95;
          line-height: 1.6;
          max-width: 280px;
          margin: 0 auto;
        }

        .visual-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 8px;
        }

        .visual-feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          opacity: 0.95;
          padding: 8px 0;
        }

        .visual-feature-item svg {
          flex-shrink: 0;
          opacity: 0.9;
        }

        @media (max-width: 968px) {
          .login-card {
            grid-template-columns: 1fr;
          }

          .login-visual {
            display: none;
          }

          .login-form-section {
            padding: 40px 32px;
          }
        }

        @media (max-width: 640px) {
          .login-form-section {
            padding: 32px 24px;
          }

          .login-title {
            font-size: 24px;
          }
        }

        /* Dark Mode Styles */
        .dark-mode .auth-error {
          background: rgba(239, 68, 68, 0.18);
          border-color: rgba(248, 113, 113, 0.45);
          color: #fecaca;
        }

        .dark-mode .verification-alert {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(19, 78, 74, 0.65) 100%);
          border-color: rgba(34, 197, 94, 0.4);
        }

        .dark-mode .verification-alert h4 {
          color: #f8fafc;
        }

        .dark-mode .verification-alert p {
          color: #cbd5f5;
        }

        .dark-mode .resend-button {
          background: rgba(15, 23, 42, 0.7);
          color: #f8fafc;
          border: 1px solid rgba(148, 163, 184, 0.4);
        }

        .dark-mode .verification-status.success {
          color: #34d399;
        }

        .dark-mode .verification-status.error {
          color: #fca5a5;
        }

        .dark-mode .modal-card {
          background: #0f172a;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.6);
        }

        .dark-mode .modal-card h3 {
          color: #f8fafc;
        }

        .dark-mode .modal-card p {
          color: #cbd5f5;
        }

        .dark-mode .modal-close-btn {
          color: #64748b;
        }

        .dark-mode .modal-close-btn:hover {
          color: #e2e8f0;
        }

        .dark-mode .modal-card .resend-otp-btn {
          background: rgba(15, 23, 42, 0.9);
          border-color: #334155;
          color: #e2e8f0;
        }

        .dark-mode .modal-card .resend-otp-btn:hover:not(:disabled) {
          border-color: #42c488;
          color: #42c488;
        }

        .dark-mode .login-wrapper {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }

        .dark-mode .login-wrapper::before {
          background: radial-gradient(circle, rgba(66, 196, 136, 0.12) 0%, transparent 70%);
        }

        .dark-mode .login-wrapper::after {
          background: radial-gradient(circle, rgba(66, 196, 136, 0.08) 0%, transparent 70%);
        }

        .dark-mode .login-card {
          background: #1e293b;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .dark-mode .login-brand-text h1 {
          color: #e2e8f0;
        }

        .dark-mode .login-brand-text p {
          color: #94a3b8;
        }

        .dark-mode .login-title {
          color: #e2e8f0;
        }

        .dark-mode .login-subtitle {
          color: #94a3b8;
        }

        .dark-mode .form-label {
          color: #cbd5e1;
        }

        .dark-mode .input-icon {
          color: #64748b;
        }

        .dark-mode .form-input {
          background: #334155;
          border-color: #475569;
          color: #e2e8f0;
        }

        .dark-mode .form-input:focus {
          border-color: #42c488;
          box-shadow: 0 0 0 4px rgba(66, 196, 136, 0.15);
        }

        .dark-mode .form-input::placeholder {
          color: #64748b;
        }

        .dark-mode .password-toggle-btn {
          color: #64748b;
        }

        .dark-mode .password-toggle-btn:hover {
          color: #42c488;
        }

        .dark-mode .custom-checkbox {
          border-color: #475569;
        }

        .dark-mode .custom-checkbox:has(input:checked) {
          background: #42c488;
          border-color: #42c488;
        }

        .dark-mode .checkbox-label {
          color: #cbd5e1;
        }

        .dark-mode .divider {
          color: #64748b;
        }

        .dark-mode .divider::before,
        .dark-mode .divider::after {
          background: #475569;
        }

        .dark-mode .btn-google {
          background: #334155;
          border-color: #475569;
          color: #e2e8f0;
        }

        .dark-mode .btn-google:hover {
          border-color: #42c488;
          background: rgba(66, 196, 136, 0.1);
          color: #42c488;
        }

        .dark-mode .signup-link {
          color: #94a3b8;
        }
      `}</style>

      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button
              type="button"
              className="modal-close-btn"
              aria-label="Close forgot password dialog"
              onClick={closeForgotModal}
            >
              ×
            </button>
            <h3>{forgotStep === "request" ? "Forgot password" : "Verify reset code"}</h3>
            <p>
              {forgotStep === "request"
                ? "Enter your email address and we'll send you a 6-digit code to reset your password."
                : `Enter the reset code we sent to ${forgotEmail} and choose a new password.`}
            </p>
            {forgotStatus.state !== "idle" && (
              <div className={`modal-status ${forgotStatus.state}`}>
                {forgotStatus.message}
              </div>
            )}
            {forgotStep === "request" ? (
              <form onSubmit={handleForgotRequest} className="modal-grid">
                <label className="form-label">Email address</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="example@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={isSendingForgot}>
                  {isSendingForgot ? "Sending..." : "Send reset code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="modal-grid">
                <label className="form-label">Reset code</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 11h16M4 7h16M4 15h16" />
                  </svg>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-input"
                    placeholder="••••••"
                    value={forgotOtp}
                    maxLength={6}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    required
                  />
                </div>
                <label className="form-label">New password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter new password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    required
                  />
                </div>
                <label className="form-label">Confirm password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Confirm password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={isResettingPassword}>
                  {isResettingPassword ? "Updating..." : "Update password"}
                </button>
                <button
                  type="button"
                  className="resend-otp-btn"
                  onClick={handleResendForgotCode}
                  disabled={forgotResendTimer > 0 || resendForgotStatus.state === "loading"}
                >
                  {resendForgotStatus.state === "loading"
                    ? "Sending..."
                    : forgotResendTimer > 0
                    ? `Resend code in ${forgotResendTimer}s`
                    : "Resend reset code"}
                </button>
                {resendForgotStatus.state !== "idle" && (
                  <div className={`resend-forgot-status ${resendForgotStatus.state}`}>
                    {resendForgotStatus.message}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {showVerificationModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button
              type="button"
              className="modal-close-btn"
              aria-label="Close verification dialog"
              onClick={closeVerificationModal}
            >
              ×
            </button>
            <h3>Enter verification code</h3>
            <p>We sent a 6-digit verification code to <strong>{pendingVerificationEmail}</strong>.</p>
            {verificationStatus.state !== "idle" && (
              <div className={`modal-status ${verificationStatus.state}`}>
                {verificationStatus.message}
              </div>
            )}
            <form onSubmit={handleVerifyEmailOtp} className="modal-grid">
              <label className="form-label">Verification code</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 11h16M4 7h16M4 15h16" />
                </svg>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  placeholder="••••••"
                  value={verificationOtp}
                  maxLength={6}
                  onChange={(e) => setVerificationOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={isVerifyingOtp}>
                {isVerifyingOtp ? "Verifying..." : "Verify email"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-card">
            {/* Left: Login Form */}
            <div className="login-form-section">
              <div className="login-brand">
                <img src="/icons/icon.png" alt="Logo" />
                <div className="login-brand-text">
                  <h1>
                    Tra<strong style={{ color: "#42c488" }}>ck.</strong>
                    Mana<strong style={{ color: "#42c488" }}>ge.</strong>
                    Peop<strong style={{ color: "#42c488" }}>le.</strong>
                  </h1>
                  <p>Simplifying Attendance Management</p>
                </div>
              </div>

              <h2 className="login-title">Welcome back</h2>
              <p className="login-subtitle">Sign in to continue to your account</p>

              {pendingVerificationEmail ? (
                <div className="verification-alert">
                  <h4>Email verification needed</h4>
                  <p>
                    {authError || "Please verify your email address to continue."} We sent a 6-digit verification code to{" "}
                    <strong>{pendingVerificationEmail}</strong>. Click the button below if you need a new code.
                  </p>
                  <div className="verification-actions">
                    <button
                      type="button"
                      className="resend-button"
                      onClick={openVerificationModal}
                    >
                      Enter verification code
                    </button>
                    <button
                      type="button"
                      className="resend-button"
                      onClick={handleResendVerification}
                      disabled={resendStatus.state === "loading"}
                    >
                      {resendStatus.state === "loading" ? "Sending..." : "Resend verification code"}
                    </button>
                    {resendStatus.state !== "idle" && (
                      <span
                        className={`verification-status ${
                          resendStatus.state === "success"
                            ? "success"
                            : resendStatus.state === "error"
                            ? "error"
                            : ""
                        }`}
                      >
                        {resendStatus.message}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                authError && (
                  <div className="auth-error">
                    {authError.split('\n').map((line, index) => (
                      <div key={index} style={{ marginBottom: index < authError.split('\n').length - 1 ? '4px' : '0' }}>
                        {line}
                      </div>
                    ))}
                  </div>
                )
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <div className="checkbox-wrapper">
                    <div className="custom-checkbox">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={remember}
                        onChange={() => setRemember(!remember)}
                      />
                      <span className="checkmark">✓</span>
                    </div>
                    <label htmlFor="remember" className="checkbox-label">
                      Remember me
                    </label>
                  </div>
                  <a
                    href="#"
                    className="forgot-link"
                    onClick={(e) => {
                      e.preventDefault();
                      openForgotModal();
                    }}
                  >
                    Forgot password?
                  </a>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="login-spinner"></span>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>

                <div className="divider">
                  <span>or continue with</span>
                </div>

                <button type="button" className="btn-google">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </form>

              <p className="signup-link">
                Don't have an account? <a href="/register">Sign up</a>
              </p>
            </div>

            {/* Right: Visual Section */}
            <div className="login-visual">
              <div className="visual-content">
                <div className="visual-icon">
                  <img src="/icons/icon.png" alt="Logo" />
                </div>
                <h3 className="visual-title">Welcome to AttendEase</h3>
                <div className="visual-features">
                  <div className="visual-feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Real-time Attendance Tracking</span>
                  </div>
                  <div className="visual-feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Leave Management System</span>
                  </div>
                  <div className="visual-feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Advanced Analytics & Reports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

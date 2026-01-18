import React, { useState, useEffect } from "react";
import Header from "./header";
import Footer from "./footer";
import TermsAndConditions from "./TermsAndConditions";
import PrivacyPolicy from "./PrivacyPolicy";
import { PublicLoadingPage } from "./PublicLoadingPage";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    qualification: "",
    experience: "",
    phone: "",
    address: "",
    agree: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneValidationMessage, setPhoneValidationMessage] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('home-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpStatus, setOtpStatus] = useState({ state: "idle", message: "" });
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendOtpStatus, setResendOtpStatus] = useState({ state: "idle", message: "" });
  const [resendOtpTimer, setResendOtpTimer] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);

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

  useEffect(() => {
    let timer;
    if (resendOtpTimer > 0) {
      timer = setTimeout(() => {
        setResendOtpTimer((prev) => Math.max(prev - 1, 0));
      }, 1000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [resendOtpTimer]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Real-time phone validation notification
    if (name === "phone") {
      const cleaned = value.replace(/[\s\-\(\)]/g, '');
      if (cleaned.length === 0) {
        setPhoneValidationMessage("");
      } else if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
        setPhoneValidationMessage("✓ Valid 10-digit phone number");
      } else if (cleaned.length < 10) {
        setPhoneValidationMessage(`Enter ${10 - cleaned.length} more digit(s)`);
      } else if (cleaned.length > 10) {
        setPhoneValidationMessage("Phone number should be 10 digits");
      } else if (!/^\d+$/.test(cleaned)) {
        setPhoneValidationMessage("Phone number should contain only digits");
      } else {
        setPhoneValidationMessage("");
      }
    }
  };

  const validateStep1 = () => {
    return formData.name && formData.email && formData.password;
  };

  const validatePhoneNumber = (phone) => {
    if (!phone || phone.trim() === '') {
      return false;
    }
    // Remove spaces, dashes, and parentheses
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // More flexible validation: 7-15 digits (allows international formats)
    // Check length and that it contains only digits and optional + at start
    return cleaned.length >= 7 && cleaned.length <= 15 && /^\+?\d+$/.test(cleaned);
  };

  const validateStep2 = () => {
    if (!formData.age || !formData.qualification || !formData.experience || !formData.phone || !formData.confirmPassword) {
      return false;
    }
    // Validate phone number format
    if (!validatePhoneNumber(formData.phone)) {
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!formData.agree) {
      alert("Please agree to the Terms & Conditions");
      return;
    }

    // Validate phone number (must be exactly 10 digits)
    if (!validatePhoneNumber(formData.phone)) {
      alert("Please enter a valid 10-digit phone number (e.g., 9876543210)");
      return;
    }

    setIsLoading(true);

    try {
      console.log("📤 Sending registration request:", {
        name: formData.name,
        email: formData.email,
        age: formData.age,
        qualification: formData.qualification,
        experience: formData.experience,
        phone: formData.phone,
        address: formData.address,
      });

      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          age: formData.age,
          qualification: formData.qualification,
          experience: formData.experience,
          phone: formData.phone,
          address: formData.address,
          termsAccepted: true
        }),
      });

      console.log("📥 Response status:", response.status, response.statusText);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("❌ Failed to parse response:", parseError);
        const text = await response.text();
        console.error("Response text:", text);
        alert("Server error: Invalid response. Please try again.");
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        console.log("✅ Registration successful:", data);
        setPendingVerificationEmail(data.pendingEmail || formData.email);
        setShowOtpModal(true);
        setOtpCode("");
        setOtpStatus({
          state: "info",
          message: data.message || "We sent a 6-digit verification code to your email. Enter it below to activate your account."
        });
        setResendOtpStatus({ state: "idle", message: "" });
        setResendOtpTimer(60);
        setIsLoading(false);
        return;
      } else {
        console.error("❌ Registration failed:", data);
        alert(data.message || `Registration failed (${response.status}). Please check your information and try again.`);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("❌ Error during registration:", err);
      alert(`Network error: ${err.message || "Could not connect to server. Please check your connection and try again."}`);
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!pendingVerificationEmail) {
      setOtpStatus({ state: "error", message: "We could not determine which email to verify. Please register again." });
      return;
    }
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpStatus({ state: "error", message: "Please enter the 6-digit code sent to your email." });
      return;
    }

    setIsVerifyingOtp(true);
    setOtpStatus({ state: "loading", message: "Verifying code..." });
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingVerificationEmail, otp: otpCode })
      });
      const data = await response.json();
      if (response.ok) {
        setOtpStatus({ state: "success", message: data.message || "Email verified! Redirecting to login..." });
        setTimeout(() => {
          window.location.href = "http://localhost:3001/login";
        }, 1500);
      } else {
        setOtpStatus({ state: "error", message: data.message || "Unable to verify the code. Please try again." });
      }
    } catch (error) {
      setOtpStatus({ state: "error", message: error.message || "Unable to verify the code. Please try again." });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingVerificationEmail || resendOtpTimer > 0) {
      return;
    }
    setResendOtpStatus({ state: "loading", message: "" });
    try {
      const response = await fetch("http://localhost:5000/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingVerificationEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setResendOtpStatus({ state: "success", message: data.message || "Verification code sent. Check your email." });
        setOtpStatus({ state: "info", message: "We sent a fresh 6-digit code to your email." });
        setResendOtpTimer(60);
      } else {
        setResendOtpStatus({ state: "error", message: data.message || "Unable to resend the code right now." });
      }
    } catch (error) {
      setResendOtpStatus({ state: "error", message: error.message || "Unable to resend the code right now." });
    }
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtpCode("");
    setOtpStatus({ state: "idle", message: "" });
  };

  return (
    <>
      {pageLoading && <PublicLoadingPage onComplete={() => setPageLoading(false)} />}
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <style>{`
        * {
          box-sizing: border-box;
        }

        .register-wrapper {
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

        .register-wrapper::before {
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

        .register-wrapper::after {
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

        .otp-modal-overlay {
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
          z-index: 1000;
          padding: 1.5rem;
        }

        .otp-modal {
          background: #ffffff;
          border-radius: 24px;
          max-width: 480px;
          width: 100%;
          padding: 32px;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25);
          position: relative;
        }

        .otp-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: transparent;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #94a3b8;
          transition: color 0.2s ease;
        }

        .otp-close-btn:hover {
          color: #0f172a;
        }

        .otp-modal h3 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
        }

        .otp-modal p {
          margin: 0 0 16px 0;
          color: #475569;
          line-height: 1.6;
        }

        .otp-input-wrapper {
          margin: 20px 0;
        }

        .otp-input {
          width: 100%;
          padding: 14px 16px;
          font-size: 20px;
          letter-spacing: 0.4em;
          text-align: center;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          font-weight: 600;
          color: #0f172a;
          background: #f8fafc;
        }

        .otp-input:focus {
          border-color: #42c488;
          outline: none;
          box-shadow: 0 0 0 4px rgba(66, 196, 136, 0.2);
        }

        .otp-status {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .otp-status.info {
          background: rgba(59, 130, 246, 0.1);
          color: #1d4ed8;
        }

        .otp-status.error {
          background: rgba(239, 68, 68, 0.12);
          color: #b91c1c;
        }

        .otp-status.success {
          background: rgba(16, 185, 129, 0.12);
          color: #047857;
        }

        .otp-status.loading {
          background: rgba(15, 118, 110, 0.12);
          color: #0f766e;
        }

        .resend-otp-btn {
          width: 100%;
          margin-top: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .resend-otp-btn:hover:not(:disabled) {
          border-color: #42c488;
          color: #42c488;
        }

        .resend-otp-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .resend-status {
          font-size: 13px;
          margin-top: 8px;
        }

        .resend-status.success {
          color: #047857;
        }

        .resend-status.error {
          color: #b91c1c;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }

        .register-container {
          width: 100%;
          max-width: 900px;
          position: relative;
          z-index: 1;
          margin-top: 0;
        }

        .register-card {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          min-height: 580px;
        }

        .register-form-section {
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 2;
        }

        .step-number.completed {
          background: #42c488;
          color: white;
          border: 2px solid #42c488;
        }

        .step-number.active {
          background: #42c488;
          color: white;
          border: 2px solid #42c488;
          box-shadow: 0 0 0 4px rgba(66, 196, 136, 0.2);
        }

        .step-number.inactive {
          background: #ffffff;
          color: #94a3b8;
          border: 2px solid #e2e8f0;
        }

        .step-line {
          width: 60px;
          height: 2px;
          background: #e2e8f0;
          transition: all 0.3s ease;
        }

        .step-line.completed {
          background: #42c488;
        }

        .step-label {
          position: absolute;
          top: 44px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          color: #64748b;
        }

        .step-label.active {
          color: #42c488;
          font-weight: 600;
        }

        .step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .step-form {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .step-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .btn-step {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-step-secondary {
          background: #ffffff;
          color: #64748b;
          border: 1.5px solid #e2e8f0;
        }

        .btn-step-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .btn-step-primary {
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(66, 196, 136, 0.25);
        }

        .btn-step-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(66, 196, 136, 0.35);
        }

        .btn-step-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .register-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }

        .register-brand img {
          width: 40px;
          height: 40px;
        }

        .register-brand-text h1 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: #0f172a;
          line-height: 1.2;
        }

        .register-brand-text p {
          font-size: 12px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .register-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }

        .register-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 32px 0;
          line-height: 1.5;
        }

        .form-group {
          margin-bottom: 20px;
          position: relative;
        }

        .form-group-full {
          grid-column: 1 / -1;
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
          width: 18px;
          height: 18px;
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

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
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

        .form-textarea {
          width: 100%;
          padding: 12px 14px;
          font-size: 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          background: #ffffff;
          color: #0f172a;
          transition: all 0.2s ease;
          outline: none;
          resize: vertical;
          font-family: inherit;
        }

        .form-textarea:focus {
          border-color: #42c488;
          box-shadow: 0 0 0 4px rgba(66, 196, 136, 0.1);
        }

        .checkbox-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 24px;
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
          margin-top: 2px;
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
          font-size: 13px;
          color: #475569;
          cursor: pointer;
          user-select: none;
          line-height: 1.5;
        }

        .checkbox-label a {
          color: #42c488;
          text-decoration: none;
          font-weight: 600;
        }

        .checkbox-label a:hover {
          text-decoration: underline;
        }

        .btn-primary {
          width: 100%;
          padding: 11px 18px;
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(66, 196, 136, 0.25);
          margin-bottom: 12px;
          position: relative;
          overflow: hidden;
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
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .login-link {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: #64748b;
        }

        .login-link a {
          color: #42c488;
          font-weight: 600;
          text-decoration: none;
          margin-left: 4px;
        }

        .login-link a:hover {
          text-decoration: underline;
        }

        .register-visual {
          background: linear-gradient(135deg, #42c488 0%, #38a169 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }

        .register-visual::before {
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
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .visual-icon img {
          width: 44px;
          height: 44px;
          filter: brightness(0) invert(1);
        }

        .visual-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
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
          .register-card {
            grid-template-columns: 1fr;
          }

          .register-visual {
            display: none;
          }

          .register-form-section {
            padding: 40px 32px;
            max-height: none;
          }

          .form-row,
          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .register-form-section {
            padding: 32px 24px;
          }

          .register-title {
            font-size: 24px;
          }
        }

        /* Dark Mode Styles */
        .dark-mode .otp-modal-overlay {
          background: rgba(2, 6, 23, 0.8);
        }

        .dark-mode .otp-modal {
          background: #0f172a;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55);
        }

        .dark-mode .otp-modal h3 {
          color: #f8fafc;
        }

        .dark-mode .otp-modal p {
          color: #cbd5f5;
        }

        .dark-mode .otp-close-btn {
          color: #64748b;
        }

        .dark-mode .otp-close-btn:hover {
          color: #e2e8f0;
        }

        .dark-mode .otp-input {
          background: #1e293b;
          border-color: #334155;
          color: #f8fafc;
        }

        .dark-mode .resend-otp-btn {
          background: rgba(15, 23, 42, 0.8);
          border-color: #334155;
          color: #e2e8f0;
        }

        .dark-mode .resend-otp-btn:hover:not(:disabled) {
          border-color: #42c488;
          color: #42c488;
        }

        .dark-mode .register-wrapper {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }

        .dark-mode .register-wrapper::before {
          background: radial-gradient(circle, rgba(66, 196, 136, 0.12) 0%, transparent 70%);
        }

        .dark-mode .register-wrapper::after {
          background: radial-gradient(circle, rgba(66, 196, 136, 0.08) 0%, transparent 70%);
        }

        .dark-mode .register-card {
          background: #1e293b;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .dark-mode .register-brand-text h1 {
          color: #e2e8f0;
        }

        .dark-mode .register-brand-text p {
          color: #94a3b8;
        }

        .dark-mode .register-title {
          color: #e2e8f0;
        }

        .dark-mode .register-subtitle {
          color: #94a3b8;
        }

        .dark-mode .step-number.inactive {
          background: #334155;
          color: #94a3b8;
          border-color: #475569;
        }

        .dark-mode .step-line {
          background: #475569;
        }

        .dark-mode .step-label {
          color: #94a3b8;
        }

        .dark-mode .step-label.active {
          color: #42c488;
        }

        .dark-mode .step-actions {
          border-top-color: #475569;
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

        .dark-mode .form-textarea {
          background: #334155;
          border-color: #475569;
          color: #e2e8f0;
        }

        .dark-mode .form-textarea:focus {
          border-color: #42c488;
          box-shadow: 0 0 0 4px rgba(66, 196, 136, 0.15);
        }

        .dark-mode .form-textarea::placeholder {
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

        .dark-mode .btn-step-secondary {
          background: #334155;
          color: #e2e8f0;
          border-color: #475569;
        }

        .dark-mode .btn-step-secondary:hover {
          background: #475569;
          border-color: #64748b;
        }

        .dark-mode .login-link {
          color: #94a3b8;
        }
      `}</style>

      {showOtpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <button
              type="button"
              className="otp-close-btn"
              aria-label="Close verification dialog"
              onClick={closeOtpModal}
            >
              ×
            </button>
            <h3>Verify your email</h3>
            <p>Enter the 6-digit code we sent to <strong>{pendingVerificationEmail}</strong>.</p>
            {otpStatus.state !== "idle" && (
              <div className={`otp-status ${otpStatus.state}`}>
                {otpStatus.message}
              </div>
            )}
            <form onSubmit={handleVerifyOtp}>
              <div className="otp-input-wrapper">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="otp-input"
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  placeholder="••••••"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={isVerifyingOtp}>
                {isVerifyingOtp ? "Verifying..." : "Verify email"}
              </button>
            </form>
            <button
              type="button"
              className="resend-otp-btn"
              onClick={handleResendOtp}
              disabled={resendOtpTimer > 0 || resendOtpStatus.state === "loading"}
            >
              {resendOtpStatus.state === "loading"
                ? "Sending..."
                : resendOtpTimer > 0
                ? `Resend code in ${resendOtpTimer}s`
                : "Resend verification code"}
            </button>
            {resendOtpStatus.state !== "idle" && (
              <div className={`resend-status ${resendOtpStatus.state}`}>
                {resendOtpStatus.message}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="register-wrapper">
        <div className="register-container">
          <div className="register-card">
            {/* Left: Registration Form */}
            <div className="register-form-section">
              <div className="register-brand">
                <img src="/icons/icon.png" alt="Logo" />
                <div className="register-brand-text">
                  <h1>
                    Tra<strong style={{ color: "#42c488" }}>ck.</strong>
                    Mana<strong style={{ color: "#42c488" }}>ge.</strong>
                    Peop<strong style={{ color: "#42c488" }}>le.</strong>
                  </h1>
                  <p>Simplifying Attendance Management</p>
                </div>
              </div>

              <h2 className="register-title">Create your account</h2>
              <p className="register-subtitle">Join us and start managing your attendance efficiently</p>

              {/* Step Indicator */}
              <div className="step-indicator">
                <div className="step-item">
                  <div className={`step-number ${currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'inactive'}`}>
                    {currentStep > 1 ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      '1'
                    )}
                  </div>
                  <span className={`step-label ${currentStep === 1 ? 'active' : ''}`}>Personal Info</span>
                </div>
                <div className={`step-line ${currentStep > 1 ? 'completed' : ''}`}></div>
                <div className="step-item">
                  <div className={`step-number ${currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'inactive'}`}>
                    {currentStep > 2 ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      '2'
                    )}
                  </div>
                  <span className={`step-label ${currentStep === 2 ? 'active' : ''}`}>Professional Info</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="step-content">
                <div className="step-form">

                {/* Step 1 Content */}
                {currentStep === 1 && (
                  <div className="form-grid">
                    {/* Full Name - Full Width (1) */}
                    <div className="form-group form-group-full">
                      <label className="form-label">Full Name</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <input
                          type="text"
                          className="form-input"
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Email & Password - Two Columns (2) */}
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
                          id="email"
                          name="email"
                          placeholder="example@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          autoComplete="off"
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
                          id="password"
                          name="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 Content */}
                {currentStep === 2 && (
                  <div className="form-grid">
                    {/* Age & Qualification - Two Columns (2) */}
                    <div className="form-group">
                      <label className="form-label">Age</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <input
                          type="number"
                          className="form-input"
                          id="age"
                          name="age"
                          placeholder="25"
                          value={formData.age}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Qualification</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                        <input
                          type="text"
                          className="form-input"
                          id="qualification"
                          name="qualification"
                          placeholder="B.Tech, MBA"
                          value={formData.qualification}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Experience & Phone - Two Columns (2) */}
                    <div className="form-group">
                      <label className="form-label">Experience (Years)</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <input
                          type="number"
                          className="form-input"
                          id="experience"
                          name="experience"
                          placeholder="2"
                          value={formData.experience}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <input
                          type="tel"
                          className="form-input"
                          id="phone"
                          name="phone"
                          placeholder="9876543210"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      {phoneValidationMessage && (
                        <div style={{
                          marginTop: '6px',
                          fontSize: '12px',
                          color: phoneValidationMessage.includes('✓') ? '#42c488' : '#ef4444',
                          fontWeight: phoneValidationMessage.includes('✓') ? '600' : '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {phoneValidationMessage.includes('✓') && (
                            <span style={{ fontSize: '14px' }}>✓</span>
                          )}
                          {phoneValidationMessage}
                        </div>
                      )}
                    </div>

                    {/* Address - Full Width (1) */}
                    <div className="form-group form-group-full">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-textarea"
                        id="address"
                        name="address"
                        rows="3"
                        placeholder="Enter your address"
                        value={formData.address}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    {/* Confirm Password - Full Width (1) */}
                    <div className="form-group form-group-full">
                      <label className="form-label">Confirm Password</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-input"
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="Re-enter password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="form-group form-group-full">
                      <div className="checkbox-wrapper">
                        <div className="custom-checkbox">
                          <input
                            type="checkbox"
                            id="agree"
                            name="agree"
                            checked={formData.agree}
                            onChange={handleChange}
                            required
                          />
                          <span className="checkmark">✓</span>
                        </div>
                        <label htmlFor="agree" className="checkbox-label">
                          I agree to the{" "}
                          <a 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              setShowTerms(true);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            Terms & Conditions
                          </a>
                          {" "}and{" "}
                          <a 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              setShowPrivacy(true);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            Privacy Policy
                          </a>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                </div>

                {/* Step Navigation */}
                <div className="step-actions">
                  {currentStep === 2 && (
                    <button
                      type="button"
                      className="btn-step btn-step-secondary"
                      onClick={handlePrevious}
                    >
                      Previous
                    </button>
                  )}
                  {currentStep === 1 ? (
                    <button
                      type="button"
                      className="btn-step btn-step-primary"
                      onClick={handleNext}
                      disabled={!validateStep1()}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn-step btn-step-primary"
                      disabled={!formData.agree || isLoading || !validateStep2()}
                    >
                      {isLoading ? "Creating account..." : "Create account"}
                    </button>
                  )}
                </div>
              </form>

              <p className="login-link">
                Already have an account? <a href="/login">Sign in</a>
              </p>
            </div>

            {/* Right: Visual Section */}
            <div className="register-visual">
              <div className="visual-content">
                <div className="visual-icon">
                  <img src="/icons/icon.png" alt="Logo" />
                </div>
                <h3 className="visual-title">Join AttendEase Today</h3>
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
      
      {/* Terms & Conditions Modal */}
      <TermsAndConditions 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
      />
      
      {/* Privacy Policy Modal */}
      <PrivacyPolicy 
        isOpen={showPrivacy} 
        onClose={() => setShowPrivacy(false)} 
      />
    </>
  );
}

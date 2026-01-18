import React, { useState, useEffect } from "react";

export default function TermsAndConditions({ isOpen, onClose }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark-mode') || 
             document.body.classList.contains('dark-mode');
    }
    return false;
  });

  useEffect(() => {
    const checkDarkMode = () => {
      if (typeof document !== 'undefined') {
        setIsDarkMode(
          document.documentElement.classList.contains('dark-mode') || 
          document.body.classList.contains('dark-mode')
        );
      }
    };
    
    if (typeof document !== 'undefined') {
      const observer = new MutationObserver(checkDarkMode);
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
      observer.observe(document.body, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
      
      return () => observer.disconnect();
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="terms-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "20px",
        overflow: "auto"
      }}
    >
      <div 
        className={`terms-modal-content ${isDarkMode ? 'dark-mode' : ''}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
          color: isDarkMode ? "#e2e8f0" : "#0f172a",
          borderRadius: "16px",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: isDarkMode ? "0 24px 64px rgba(0, 0, 0, 0.6)" : "0 24px 64px rgba(0, 0, 0, 0.2)",
          position: "relative",
          border: isDarkMode ? "1px solid #334155" : "none"
        }}
      >
        <style>{`
          .terms-modal-content.dark-mode {
            background: #1e293b;
            color: #e2e8f0;
          }
          
          .terms-modal-content.dark-mode h1,
          .terms-modal-content.dark-mode h2 {
            color: #e2e8f0;
          }
          
          .terms-modal-content.dark-mode p,
          .terms-modal-content.dark-mode li {
            color: #cbd5e1;
          }
          
          .terms-modal-content.dark-mode .close-btn {
            color: #e2e8f0;
          }
        `}</style>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="close-btn"
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: isDarkMode ? "#94a3b8" : "#64748b",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = isDarkMode ? "#475569" : "#f1f5f9";
            e.target.style.color = isDarkMode ? "#e2e8f0" : "#0f172a";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = isDarkMode ? "#94a3b8" : "#64748b";
          }}
        >
          ×
        </button>

        {/* Content */}
        <div style={{ padding: "48px 40px" }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: isDarkMode ? "#e2e8f0" : "#0f172a",
            marginBottom: "8px",
            marginTop: "0"
          }}>
            Terms & Conditions
          </h1>
          <p style={{
            fontSize: "14px",
            color: isDarkMode ? "#94a3b8" : "#64748b",
            marginBottom: "32px"
          }}>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div style={{ fontSize: "14px", lineHeight: "1.8", color: isDarkMode ? "#e2e8f0" : "#334155" }}>
            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#f1f5f9" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                1. Acceptance of Terms
              </h2>
              <p style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>
                By creating an account and using Track.Manage.People (the "Service"), you agree to be bound by these Terms & Conditions. 
                If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                2. Account Registration
              </h2>
              <p style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>You agree to:</p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px", color: isDarkMode ? "#cbd5e1" : "#334155" }}>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Provide accurate, current, and complete information during registration</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Maintain and update your information to keep it accurate and current</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Maintain the security of your password and account</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Accept responsibility for all activities that occur under your account</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                3. User Responsibilities
              </h2>
              <p style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>You are responsible for:</p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px", color: isDarkMode ? "#cbd5e1" : "#334155" }}>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Accurate and timely attendance check-in and check-out</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Submitting leave applications with accurate information</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Maintaining confidentiality of your account credentials</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Complying with all applicable laws and regulations</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Not using the Service for any illegal or unauthorized purpose</li>
              </ul>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                4. Attendance and Leave Management
              </h2>
              <p style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>
                The Service provides tools for tracking attendance and managing leave requests. 
                You understand that:
              </p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px", color: isDarkMode ? "#cbd5e1" : "#334155" }}>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Attendance records are used for payroll and HR purposes</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Leave applications are subject to approval by managers or administrators</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>False or misleading information may result in disciplinary action</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Location data may be collected for security and verification purposes</li>
              </ul>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                5. Privacy and Data Protection
              </h2>
              <p style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>
                We are committed to protecting your privacy. By using the Service, you agree to our data collection and usage practices, including:
              </p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px", color: isDarkMode ? "#cbd5e1" : "#334155" }}>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Collection of personal information for account management</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Storage of attendance and leave records</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Location tracking for attendance verification (if enabled)</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Sharing of information with authorized managers and administrators</li>
              </ul>
              <p style={{ marginTop: "12px", color: isDarkMode ? "#cbd5e1" : "#334155" }}>
                Your data will be handled in accordance with applicable data protection laws.
              </p>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                6. Prohibited Activities
              </h2>
              <p style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>You agree not to:</p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px", color: isDarkMode ? "#cbd5e1" : "#334155" }}>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Attempt to gain unauthorized access to the Service or other accounts</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Interfere with or disrupt the Service or servers</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Use automated systems to access the Service without permission</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Share your account credentials with others</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Manipulate or falsify attendance or leave records</li>
                <li style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>Use the Service to violate any laws or regulations</li>
              </ul>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                7. Account Termination
              </h2>
              <p style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>
                We reserve the right to suspend or terminate your account at any time if you violate these Terms & Conditions 
                or engage in any fraudulent, abusive, or illegal activity. You may also request account deletion by contacting your administrator.
              </p>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                8. Limitation of Liability
              </h2>
              <p style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>
                The Service is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, 
                special, or consequential damages arising from your use of the Service.
              </p>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                9. Changes to Terms
              </h2>
              <p style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>
                We reserve the right to modify these Terms & Conditions at any time. You will be notified of significant changes, 
                and continued use of the Service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                10. Contact Information
              </h2>
              <p style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>
                If you have any questions about these Terms & Conditions, please contact your system administrator or HR department.
              </p>
            </section>

            <div style={{
              marginTop: "40px",
              padding: "20px",
              backgroundColor: isDarkMode ? "#334155" : "#f8fafc",
              borderRadius: "12px",
              border: `1px solid ${isDarkMode ? "#475569" : "#e2e8f0"}`
            }}>
              <p style={{
                fontSize: "13px",
                color: isDarkMode ? "#cbd5e1" : "#64748b",
                margin: "0",
                fontWeight: "600"
              }}>
                By creating an account, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

